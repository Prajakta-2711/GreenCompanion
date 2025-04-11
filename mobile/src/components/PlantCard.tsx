import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getWaterStatusText, getWaterProgress } from '../utils/plantUtils';

interface PlantCardProps {
  plant: {
    id: number;
    name: string;
    species?: string;
    imageUrl?: string;
    location: string;
    lastWatered?: string | null;
    wateringFrequency: number;
  };
  onPress: () => void;
}

const PlantCard = ({ plant, onPress }: PlantCardProps) => {
  const waterProgress = getWaterProgress(plant.lastWatered, plant.wateringFrequency);
  const statusText = getWaterStatusText(plant.lastWatered, plant.wateringFrequency);
  
  const getStatusColor = () => {
    if (waterProgress >= 0.75) return '#F44336'; // Red - needs water urgently
    if (waterProgress >= 0.5) return '#FF9800';  // Orange - will need water soon
    return '#4CAF50'; // Green - recently watered
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image 
        source={{ uri: plant.imageUrl || 'https://via.placeholder.com/150' }} 
        style={styles.image} 
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{plant.name}</Text>
        
        {plant.species && (
          <Text style={styles.species} numberOfLines={1}>{plant.species}</Text>
        )}
        
        <View style={styles.locationContainer}>
          <Feather name="map-pin" size={12} color="#666" />
          <Text style={styles.location} numberOfLines={1}>{plant.location}</Text>
        </View>
        
        <View style={styles.wateringStatusContainer}>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${Math.min(waterProgress * 100, 100)}%`, backgroundColor: getStatusColor() }
              ]} 
            />
          </View>
          <Text style={styles.wateringStatus}>{statusText}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    maxWidth: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  species: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#7f8c8d',
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  wateringStatusContainer: {
    marginTop: 4,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
  },
  wateringStatus: {
    fontSize: 10,
    color: '#666',
  },
});

export default PlantCard;
