import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Camera,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/constants';
import { visitAPI } from '../services/api';

export default function AbsenScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();
  const cameraRef = React.useRef(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      setPhoto(photo);
      setCameraVisible(false);
      
      // Get GPS location
      await getLocation();
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      console.error('Camera error:', error);
    }
  };

  const getLocation = async () => {
    try {
      if (!locationPermission?.granted) {
        const { granted } = await requestLocationPermission();
        if (!granted) {
          Alert.alert('Permission Required', 'Location permission is required for attendance');
          return;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
      console.error('Location error:', error);
    }
  };

  const handleSubmitAbsen = async () => {
    if (!photo) {
      Alert.alert('Error', 'Please take a photo first');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location data not available');
      return;
    }

    setLoading(true);
    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('userName', user.nama);
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);
      formData.append('accuracy', location.accuracy);
      formData.append('timestamp', new Date().toISOString());
      
      // Append photo
      formData.append('photo', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `absen-${user.id}-${Date.now()}.jpg`,
      });

      const response = await visitAPI.submitAbsen(formData);

      if (response.data.success) {
        Alert.alert('Success', 'Attendance recorded successfully', [
          {
            text: 'OK',
            onPress: () => {
              setPhoto(null);
              setLocation(null);
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to submit attendance');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit attendance');
      console.error('Absen error:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestCamPermission = async () => {
    const { granted } = await requestCameraPermission();
    if (!granted) {
      Alert.alert('Permission Required', 'Camera permission is required');
      return;
    }
    setCameraVisible(true);
  };

  if (cameraVisible && cameraPermission?.granted) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} ref={cameraRef} facing="front">
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setCameraVisible(false)}
            >
              <Text style={styles.buttonText}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleTakePhoto}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        <Text style={styles.subtitle}>{user?.nama || 'User'}</Text>
      </View>

      {photo ? (
        <View style={styles.photoContainer}>
          <Image source={{ uri: photo.uri }} style={styles.photo} />
          <View style={styles.geotagInfo}>
            <Text style={styles.geotagTitle}>📍 Geotag Information</Text>
            <Text style={styles.geotagText}>Latitude: {location?.latitude?.toFixed(6)}</Text>
            <Text style={styles.geotagText}>Longitude: {location?.longitude?.toFixed(6)}</Text>
            <Text style={styles.geotagText}>Accuracy: ±{location?.accuracy?.toFixed(0)}m</Text>
            <Text style={styles.geotagText}>Time: {new Date().toLocaleString()}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📷</Text>
          <Text style={styles.emptyText}>No photo taken yet</Text>
          <Text style={styles.emptySubtext}>Tap "Take Photo" to capture attendance</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={photo ? handleSubmitAbsen : requestCamPermission}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>
              {photo ? '✓ OK (Submit)' : '📷 Take Photo'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => {
            setPhoto(null);
            setLocation(null);
            navigation.goBack();
          }}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>✕ Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  cancelButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  photoContainer: {
    margin: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  photo: {
    width: '100%',
    height: 300,
  },
  geotagInfo: {
    padding: 16,
    backgroundColor: COLORS.lightBg,
  },
  geotagTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 10,
  },
  geotagText: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.lightBg,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: COLORS.dark,
    fontSize: 16,
    fontWeight: '600',
  },
});
