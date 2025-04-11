import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Feather } from '@expo/vector-icons';
import * as apiClient from '../api/client';

export default function PlantScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const [capturing, setCapturing] = useState(false);
  const [analyzeMode, setAnalyzeMode] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      const imagePickerStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (imagePickerStatus.status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to use this feature');
      }
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && cameraReady) {
      try {
        setCapturing(true);
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        setImageUri(photo.uri);
        setAnalyzeMode(true);
      } catch (error) {
        console.error('Failed to take picture', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      } finally {
        setCapturing(false);
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.cancelled) {
        setImageUri(result.assets[0].uri);
        setAnalyzeMode(true);
      }
    } catch (error) {
      console.error('Image picker error', error);
    }
  };

  const cancelAnalysis = () => {
    setImageUri(null);
    setAnalyzeMode(false);
    setAnalysisResult(null);
  };

  const analyzePlant = async () => {
    if (!imageUri) return;

    try {
      setAnalyzing(true);
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const result = await apiClient.analyzePlantImage(base64Image);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Failed to analyze plant', error);
      Alert.alert('Analysis Error', 'There was a problem analyzing your plant. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera. Please enable camera permissions.</Text></View>;
  }

  return (
    <View style={styles.container}>
      {!analyzeMode ? (
        // Camera View
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={type}
            flashMode={flash}
            onCameraReady={() => setCameraReady(true)}
          >
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={() => {
                  setType(
                    type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back
                  );
                }}
              >
                <Feather name="refresh-cw" size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.flashButton}
                onPress={() => {
                  setFlash(
                    flash === Camera.Constants.FlashMode.off
                      ? Camera.Constants.FlashMode.on
                      : Camera.Constants.FlashMode.off
                  );
                }}
              >
                <Feather 
                  name={flash === Camera.Constants.FlashMode.off ? "zap-off" : "zap"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>
          </Camera>
          
          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <Feather name="image" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={takePicture}
              disabled={capturing || !cameraReady}
            >
              {capturing ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
            
            <View style={{ width: 50 }} />
          </View>
        </View>
      ) : (
        // Analysis View
        <View style={styles.analyzeContainer}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          )}
          
          {!analyzing && !analysisResult && (
            <View style={styles.analyzeButtons}>
              <TouchableOpacity style={styles.analyzeButton} onPress={analyzePlant}>
                <Text style={styles.analyzeButtonText}>Analyze Plant</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cancelButton} onPress={cancelAnalysis}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {analyzing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Analyzing your plant...</Text>
            </View>
          )}
          
          {analysisResult && (
            <ScrollView style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Analysis Results</Text>
              
              {analysisResult.plantName && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>Plant Identification</Text>
                  <Text style={styles.resultText}>{analysisResult.plantName}</Text>
                  {analysisResult.scientificName && (
                    <Text style={styles.resultScientificName}>{analysisResult.scientificName}</Text>
                  )}
                </View>
              )}
              
              {analysisResult.healthStatus && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>Health Status</Text>
                  <Text style={styles.resultText}>{analysisResult.healthStatus}</Text>
                </View>
              )}
              
              {analysisResult.careInstructions && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>Care Instructions</Text>
                  <Text style={styles.resultText}>{analysisResult.careInstructions}</Text>
                </View>
              )}
              
              {analysisResult.issues && analysisResult.issues.length > 0 && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>Potential Issues</Text>
                  {analysisResult.issues.map((issue, index) => (
                    <View key={index} style={styles.issueItem}>
                      <Text style={styles.issueName}>{issue.name}</Text>
                      <Text style={styles.issueDescription}>{issue.description}</Text>
                      {issue.solution && (
                        <Text style={styles.issueSolution}>Solution: {issue.solution}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.addPlantButton}
                  onPress={() => navigation.navigate('Plants', { 
                    screen: 'PlantsScreen', 
                    params: { 
                      action: 'add',
                      plantData: {
                        name: analysisResult.plantName || '',
                        species: analysisResult.scientificName || '',
                        notes: analysisResult.careInstructions || '',
                        imageUri: imageUri
                      }
                    } 
                  })}
                >
                  <Text style={styles.addPlantButtonText}>Add to My Plants</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.newScanButton} onPress={cancelAnalysis}>
                  <Text style={styles.newScanButtonText}>New Scan</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    top: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  analyzeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  previewImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  analyzeButtons: {
    flexDirection: 'column',
    padding: 20,
    gap: 10,
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  resultContainer: {
    flex: 1,
    padding: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  resultSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  resultSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  resultScientificName: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 5,
  },
  issueItem: {
    marginVertical: 8,
    padding: 10,
    backgroundColor: '#fff',
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
    borderRadius: 4,
  },
  issueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  issueDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  issueSolution: {
    fontSize: 14,
    color: '#4CAF50',
  },
  actionButtons: {
    marginTop: 20,
    marginBottom: 30,
    gap: 10,
  },
  addPlantButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addPlantButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  newScanButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  newScanButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
