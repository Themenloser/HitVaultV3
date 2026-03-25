import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import RNFS from 'react-native-fs';
import { apiClient } from '../config/api';

// SF Symbol component for iOS native icons
const SFSymbol = ({ name, size = 20, color = '#333' }) => {
  const symbolMap = {
    'cloud': '☁',
    'play.circle.fill': '▶',
    'externaldrive.connected.to.line.below': '💾',
    'checkmark': '✓',
    'xmark': '✕',
  };
  
  return (
    <Text style={{ fontSize: size, color, fontWeight: '500' }}>
      {symbolMap[name] || '•'}
    </Text>
  );
};

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

  const testBackend = async () => {
    try {
      Alert.alert('Backend Test', 'Teste Backend-Verbindung...');
      const results = await apiClient.search('Lacazette');
      console.log('Backend test successful:', results);
      Alert.alert('Backend Test', `✅ Backend erreichbar - ${results.length} Ergebnisse gefunden`);
    } catch (error) {
      console.error('Backend test failed:', error);
      Alert.alert('Backend Test', `❌ Backend-Fehler: ${error.message}`);
    }
  };

  const testTrackPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer();
      console.log('TrackPlayer test successful');
      Alert.alert('TrackPlayer Test', '✅ TrackPlayer bereit');
    } catch (error) {
      console.error('TrackPlayer test failed:', error);
      Alert.alert('TrackPlayer Test', '❌ TrackPlayer Fehler');
    }
  };

  const testRNFS = async () => {
    try {
      const testPath = `${RNFS.DocumentDirectoryPath}/test.txt`;
      await RNFS.writeFile(testPath, 'Test content', 'utf8');
      const exists = await RNFS.exists(testPath);
      await RNFS.unlink(testPath);
      console.log('RNFS test successful');
      Alert.alert('RNFS Test', '✅ Dateisystem funktioniert');
    } catch (error) {
      console.error('RNFS test failed:', error);
      Alert.alert('RNFS Test', '❌ Dateisystem Fehler');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug</Text>
        <TouchableOpacity style={styles.debugButton} onPress={testBackend}>
          <SFSymbol name="cloud" size={20} color="#007AFF" />
          <Text style={styles.debugButtonText}>Test Backend</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.debugButton} onPress={testTrackPlayer}>
          <SFSymbol name="play.circle.fill" size={20} color="#34C759" />
          <Text style={styles.debugButtonText}>Test TrackPlayer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.debugButton} onPress={testRNFS}>
          <SFSymbol name="externaldrive.connected.to.line.below" size={20} color="#FF9500" />
          <Text style={styles.debugButtonText}>Test RNFS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    fontFamily: 'System',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 20,
    fontFamily: 'System',
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
    fontFamily: 'System',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  settingValue: {
    fontSize: 16,
    color: 'gray',
    fontFamily: 'System',
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  debugButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
    fontFamily: 'System',
  },
});
