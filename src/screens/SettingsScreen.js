import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
} from 'react-native';

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [storageSize, setStorageSize] = useState(0);
  const [appVersion, setAppVersion] = useState('0.0.1');

  useEffect(() => {
    // TODO: Load actual settings from AsyncStorage
    // TODO: Calculate actual storage size
    setStorageSize(0);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // TODO: Save dark mode preference
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Einstellungen</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Darstellung</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Speicher</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Genutzter Speicher</Text>
          <Text style={styles.settingValue}>{storageSize} MB</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Info</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>App-Version</Text>
          <Text style={styles.settingValue}>{appVersion}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'gray',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 16,
    color: 'gray',
  },
});
