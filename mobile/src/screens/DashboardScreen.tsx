import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import * as apiClient from '../api/client';
import PlantStatusCard from '../components/PlantStatusCard';
import ActivityItem from '../components/ActivityItem';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [plants, setPlants] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plantsData, activitiesData, tasksData] = await Promise.all([
        apiClient.getPlants(),
        apiClient.getActivities(),
        apiClient.getTasks(),
      ]);
      setPlants(plantsData);
      setActivities(activitiesData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Get plants that need attention (due for watering)
  const plantsNeedingAttention = plants.filter(plant => {
    if (!plant.lastWatered) return true;
    
    const lastWatered = new Date(plant.lastWatered);
    const today = new Date();
    const diffDays = Math.floor((today - lastWatered) / (1000 * 60 * 60 * 24));
    return diffDays >= plant.wateringFrequency;
  });

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <Image 
          source={{ uri: user?.profilePicture || 'https://via.placeholder.com/100' }} 
          style={styles.profileImage} 
        />
        <View style={styles.profileInfo}>
          <Text style={styles.greeting}>Hello, {user?.firstName || user?.username}</Text>
          <Text style={styles.subGreeting}>Welcome to your plant care dashboard</Text>
        </View>
      </View>

      {/* Plants Needing Attention */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Plants Needing Care</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Plants')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {plantsNeedingAttention.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {plantsNeedingAttention.map(plant => (
              <TouchableOpacity 
                key={plant.id} 
                onPress={() => navigation.navigate('PlantDetails', { plantId: plant.id })}
              >
                <PlantStatusCard plant={plant} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>All your plants are happy and healthy!</Text>
          </View>
        )}
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
        </View>
        
        {activities.length > 0 ? (
          <View style={styles.activitiesList}>
            {activities.slice(0, 5).map(activity => {
              const plant = plants.find(p => p.id === activity.plantId);
              if (!plant) return null;
              return <ActivityItem key={activity.id} activity={activity} plant={plant} />;
            })}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No recent activities</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Scanner')}
        >
          <Text style={styles.actionButtonText}>Scan Plant</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Plants', { screen: 'PlantsScreen', params: { action: 'add' } })}
        >
          <Text style={styles.actionButtonText}>Add Plant</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileSection: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  subGreeting: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  section: {
    backgroundColor: '#ffffff',
    marginVertical: 10,
    paddingVertical: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  seeAll: {
    fontSize: 14,
    color: '#4CAF50',
  },
  horizontalScroll: {
    paddingLeft: 15,
  },
  activitiesList: {
    paddingHorizontal: 15,
  },
  emptyStateContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#7f8c8d',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 20,
    paddingHorizontal: 15,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 150,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
