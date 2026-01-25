import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { COLORS } from '../utils/constants';
import { visitAPI } from '../services/api';

export default function MDVisitScreen({ navigation }) {
  const [step, setStep] = useState('date'); // 'date', 'planList', 'checkIn', 'form', 'photos'
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkinLocation, setCheckinLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visitForm, setVisitForm] = useState({});
  const [photos, setPhotos] = useState({
    before: null,
    after: null,
    product: null,
  });

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

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    
    // Load plan visits for selected date
    setLoading(true);
    try {
      const response = await visitAPI.getPlanVisits({
        userId: user.id,
        date: date.toISOString().split('T')[0],
      });
      
      if (response.data.success) {
        setPlans(response.data.data || []);
        if (response.data.data.length > 0) {
          setStep('planList');
        } else {
          Alert.alert('No Plans', 'No visit plans found for this date');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load visit plans');
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setStep('checkIn');
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      // Get current GPS location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCheckinLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: new Date().toISOString(),
      });

      // Populate visit form with plan data
      setVisitForm({
        planVisitId: selectedPlan.id,
        mdName: user.nama,
        username: user.username,
        idOutlet: selectedPlan.idOutlet,
        namaOutlet: selectedPlan.namaOutlet,
        alamatOutlet: selectedPlan.alamatOutlet,
        latitude: selectedPlan.latitude,
        longitude: selectedPlan.longitude,
        checkInTime: new Date().toISOString(),
      });

      setStep('form');
    } catch (error) {
      Alert.alert('Error', 'Failed to get check-in location');
      console.error('Check-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async (photoType) => {
    // Photo upload logic - handled by VisitFormScreen
    navigation.navigate('PhotoCapture', {
      type: photoType,
      onPhotoSelected: (uri) => {
        setPhotos({ ...photos, [photoType]: uri });
      },
    });
  };

  const handleCheckOut = async () => {
    // Validate all required fields
    if (!visitForm.mdName || !visitForm.username || !visitForm.idOutlet || !visitForm.namaOutlet) {
      Alert.alert('Incomplete', 'Please fill all required fields');
      return;
    }

    if (!photos.before || !photos.after || !photos.product) {
      Alert.alert('Photos Required', 'Please upload all three photos');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add form data
      formData.append('planVisitId', visitForm.planVisitId);
      formData.append('userId', user.id);
      formData.append('mdName', visitForm.mdName);
      formData.append('username', visitForm.username);
      formData.append('idOutlet', visitForm.idOutlet);
      formData.append('namaOutlet', visitForm.namaOutlet);
      formData.append('alamatOutlet', visitForm.alamatOutlet);
      formData.append('latitude', visitForm.latitude);
      formData.append('longitude', visitForm.longitude);
      formData.append('checkInTime', visitForm.checkInTime);
      formData.append('checkOutTime', new Date().toISOString());
      
      // Add photos
      if (photos.before) {
        formData.append('photoBefore', {
          uri: photos.before,
          type: 'image/jpeg',
          name: `visit-before-${Date.now()}.jpg`,
        });
      }
      
      if (photos.after) {
        formData.append('photoAfter', {
          uri: photos.after,
          type: 'image/jpeg',
          name: `visit-after-${Date.now()}.jpg`,
        });
      }
      
      if (photos.product) {
        formData.append('photoProduct', {
          uri: photos.product,
          type: 'image/jpeg',
          name: `visit-product-${Date.now()}.jpg`,
        });
      }

      const response = await visitAPI.submitVisitAction(formData);

      if (response.data.success) {
        Alert.alert('Success', 'Visit action saved successfully', [
          {
            text: 'OK',
            onPress: () => {
              // Reset and go back
              setStep('date');
              setSelectedPlan(null);
              setVisitForm({});
              setPhotos({ before: null, after: null, product: null });
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to save visit');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save visit');
      console.error('Check-out error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Date Selection
  if (step === 'date') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>MD Visit</Text>
          <Text style={styles.subtitle}>Step 1: Select Date</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonLabel}>📅 Select Date</Text>
            <Text style={styles.dateButtonValue}>
              {selectedDate.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={(event, date) => {
                if (date) handleDateSelect(date);
              }}
            />
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => handleDateSelect(selectedDate)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Step 2: Plan List
  if (step === 'planList') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>MD Visit</Text>
          <Text style={styles.subtitle}>Step 2: Select Plan Route</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View style={styles.content}>
            <FlatList
              data={plans}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.planCard}
                  onPress={() => handleSelectPlan(item)}
                >
                  <View style={styles.planHeader}>
                    <Text style={styles.planOutlet}>{item.namaOutlet}</Text>
                    <Text style={styles.planStatus}>{item.status}</Text>
                  </View>
                  <Text style={styles.planAddress}>{item.alamatOutlet}</Text>
                  <View style={styles.planDetails}>
                    <Text style={styles.planDetail}>📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</Text>
                    <Text style={styles.planDetail}>🕐 {new Date(item.plannedTime).toLocaleTimeString()}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setStep('date')}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    );
  }

  // Step 3: Check In
  if (step === 'checkIn') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>MD Visit</Text>
          <Text style={styles.subtitle}>Step 3: Check In</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🏪 {selectedPlan?.namaOutlet}</Text>
            <Text style={styles.infoText}>{selectedPlan?.alamatOutlet}</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton, { marginTop: 20 }]}
            onPress={handleCheckIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>📍 Check In (GPS)</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setStep('planList')}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Step 4: Visit Form
  if (step === 'form') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>MD Visit</Text>
          <Text style={styles.subtitle}>Step 4: Visit Form</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>MD Name (Auto)</Text>
            <View style={styles.readOnlyInput}>
              <Text>{visitForm.mdName}</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Username (Auto)</Text>
            <View style={styles.readOnlyInput}>
              <Text>{visitForm.username}</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Outlet ID (Auto)</Text>
            <View style={styles.readOnlyInput}>
              <Text>{visitForm.idOutlet}</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Outlet Name (Auto)</Text>
            <View style={styles.readOnlyInput}>
              <Text>{visitForm.namaOutlet}</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address (Auto)</Text>
            <View style={styles.readOnlyInput}>
              <Text style={{ fontSize: 12 }}>{visitForm.alamatOutlet}</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>GPS Coordinates (Auto)</Text>
            <View style={styles.readOnlyInput}>
              <Text style={{ fontSize: 12 }}>
                Lat: {visitForm.latitude?.toFixed(6)}{'\n'}
                Lng: {visitForm.longitude?.toFixed(6)}
              </Text>
            </View>
          </View>

          {/* Photo Upload Buttons */}
          <View style={styles.photoSection}>
            <Text style={styles.photoSectionTitle}>📸 Photos Required</Text>

            <TouchableOpacity
              style={[styles.photoButton, photos.before && styles.photoButtonSelected]}
              onPress={() => handleUploadPhoto('before')}
            >
              <Text style={styles.photoButtonText}>
                {photos.before ? '✓ Photo Before' : '📷 Upload Photo Before'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.photoButton, photos.after && styles.photoButtonSelected]}
              onPress={() => handleUploadPhoto('after')}
            >
              <Text style={styles.photoButtonText}>
                {photos.after ? '✓ Photo After' : '📷 Upload Photo After'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.photoButton, photos.product && styles.photoButtonSelected]}
              onPress={() => handleUploadPhoto('product')}
            >
              <Text style={styles.photoButtonText}>
                {photos.product ? '✓ Product Photo' : '📷 Upload Product Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleCheckOut}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>✓ Check Out</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setStep('checkIn')}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  content: {
    padding: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  dateButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  dateButtonLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  dateButtonValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planOutlet: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    flex: 1,
  },
  planStatus: {
    fontSize: 12,
    backgroundColor: COLORS.lightBg,
    color: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  planAddress: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 10,
  },
  planDetails: {
    gap: 6,
  },
  planDetail: {
    fontSize: 12,
    color: COLORS.gray,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.gray,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  readOnlyInput: {
    backgroundColor: COLORS.lightBg,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  photoSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  photoSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
  },
  photoButton: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  photoButtonSelected: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
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
