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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/constants';
import { userAPI } from '../services/api';

export default function MainMenuScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            navigation.replace('Login');
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with User Info */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.userName}>{user?.nama || 'User'}</Text>
          <Text style={styles.userRole}>{user?.jabatan || 'Staff'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {/* Menu Absen */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Absen')}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.menuIconText}>📋</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Menu Absen</Text>
            <Text style={styles.menuDescription}>Record attendance with photo</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {/* Actual Work - MD Visit */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MDVisit')}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.menuIconText}>🚗</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>MD Visit (Actual Work)</Text>
            <Text style={styles.menuDescription}>Plan and execute visit routes</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {/* Reports */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('DailyReport')}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.menuIconText}>📊</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Reports</Text>
            <Text style={styles.menuDescription}>View daily reports</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Status</Text>
          <Text style={styles.statValue}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Sync Status</Text>
          <Text style={[styles.statValue, { color: COLORS.success }]}>Synced</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  userName: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
  },
  userRole: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 3,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  menuContainer: {
    padding: 16,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.lightBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIconText: {
    fontSize: 28,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  menuDescription: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 4,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.lightGray,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
