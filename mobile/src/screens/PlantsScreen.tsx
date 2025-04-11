import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as apiClient from '../api/client';
import PlantCard from '../components/PlantCard';
import AddPlantModal from '../components/AddPlantModal';

export default function PlantsScreen({ navigation, route }) {
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
    // Check if coming from dashboard with "add" action
    if (route.params?.action === 'add') {
      setIsAddModalVisible(true);
    }
  }, [route.params]);

  const loadPlants = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getPlants();
      setPlants(data);
      setFilteredPlants(data);
    } catch (error) {
      console.error('Failed to load plants', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlants();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPlants(plants);
    } else {
      const filtered = plants.filter(plant => 
        plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (plant.species && plant.species.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredPlants(filtered);
    }
  }, [searchQuery, plants]);

  const handlePlantPress = (plant) => {
    navigation.navigate('PlantDetails', { plantId: plant.id });
  };

  const handleAddPlant = async (plantData) => {
    try {
      await apiClient.createPlant(plantData);
      setIsAddModalVisible(false);
      loadPlants();
    } catch (error) {
      console.error('Failed to add plant', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search plants..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredPlants}
        renderItem={({ item }) => (
          <PlantCard plant={item} onPress={() => handlePlantPress(item)} />
        )}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No plants found</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <AddPlantModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSubmit={handleAddPlant}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  listContent: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
