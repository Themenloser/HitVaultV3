import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../config/api';

// Global log storage
const globalLogs = [];
export const addLog = (type, message, data = null) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    message,
    data: data ? JSON.stringify(data).substring(0, 500) : null,
  };
  globalLogs.unshift(logEntry);
  if (globalLogs.length > 100) globalLogs.pop();
  console.log(`[${type}] ${message}`, data || '');
};

// SF Symbol component using text symbols (not emojis)
const SFSymbol = ({ name, size = 20, color = '#333' }) => {
  const symbolMap = {
    'cloud': 'C',
    'play.circle.fill': '>',
    'externaldrive.connected.to.line.below': 'D',
    'checkmark': '+',
    'xmark': 'x',
    'doc.text.fill': 'L',
    'trash': 'T',
    'arrow.clockwise': 'R',
  };
  
  return (
    <Text style={{ fontSize: size, color, fontWeight: '700', fontFamily: 'System' }}>
      {symbolMap[name] || '•'}
    </Text>
  );
};

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [storageSize, setStorageSize] = useState(0);
  const [appVersion, setAppVersion] = useState('0.0.1');
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadSettings();
    calculateStorage();
  }, []);

  const loadSettings = async () => {
    try {
      const storedVersion = await AsyncStorage.getItem('appVersion');
      if (storedVersion) setAppVersion(storedVersion);
    } catch (error) {
      addLog('ERROR', 'Failed to load settings', error.message);
    }
  };

  const calculateStorage = async () => {
    try {
      const audioDir = `${RNFS.DocumentDirectoryPath}/audios`;
      const videoDir = `${RNFS.DocumentDirectoryPath}/videos`;
      
      let totalSize = 0;
      
      if (await RNFS.exists(audioDir)) {
        const audioFiles = await RNFS.readDir(audioDir);
        totalSize += audioFiles.reduce((sum, file) => sum + (file.size || 0), 0);
      }
      
      if (await RNFS.exists(videoDir)) {
        const videoFiles = await RNFS.readDir(videoDir);
        totalSize += videoFiles.reduce((sum, file) => sum + (file.size || 0), 0);
      }
      
      setStorageSize(Math.round(totalSize / 1024 / 1024 * 10) / 10);
      addLog('INFO', `Storage calculated: ${totalSize} bytes`);
    } catch (error) {
      addLog('ERROR', 'Failed to calculate storage', error.message);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    addLog('INFO', `Dark mode ${!isDarkMode ? 'enabled' : 'disabled'}`);
  };

  const testBackend = async () => {
    addLog('TEST', 'Starting backend test...');
    try {
      const results = await apiClient.search('Lacazette');
      addLog('SUCCESS', 'Backend test passed', { resultsCount: results.length });
      Alert.alert('Backend Test', `[OK] Backend erreichbar - ${results.length} Ergebnisse gefunden`);
    } catch (error) {
      addLog('ERROR', 'Backend test failed', error.message);
      Alert.alert('Backend Test', `[X] Backend-Fehler: ${error.message}`);
    }
  };

  const testTrackPlayer = async () => {
    addLog('TEST', 'Starting TrackPlayer test...');
    try {
      await TrackPlayer.setupPlayer();
      addLog('SUCCESS', 'TrackPlayer test passed');
      Alert.alert('TrackPlayer Test', '[OK] TrackPlayer bereit');
    } catch (error) {
      addLog('ERROR', 'TrackPlayer test failed', error.message);
      Alert.alert('TrackPlayer Test', `[X] TrackPlayer Fehler: ${error.message}`);
    }
  };

  const testRNFS = async () => {
    addLog('TEST', 'Starting RNFS test...');
    try {
      const testPath = `${RNFS.DocumentDirectoryPath}/test.txt`;
      await RNFS.writeFile(testPath, 'Test content', 'utf8');
      const exists = await RNFS.exists(testPath);
      await RNFS.unlink(testPath);
      addLog('SUCCESS', 'RNFS test passed', { fileExists: exists });
      Alert.alert('RNFS Test', '[OK] Dateisystem funktioniert');
    } catch (error) {
      addLog('ERROR', 'RNFS test failed', error.message);
      Alert.alert('RNFS Test', `[X] Dateisystem Fehler: ${error.message}`);
    }
  };

  const testAudioEndpoint = async () => {
    addLog('TEST', 'Testing audio endpoint...');
    try {
      const testVideoId = 'dQw4w9WgXcQ';
      const result = await apiClient.getAudio(testVideoId);
      addLog('SUCCESS', 'Audio endpoint test passed', { hasUrl: !!result.url });
      Alert.alert('Audio Test', `[OK] Audio URL erhalten: ${result.url ? 'Ja' : 'Nein'}`);
    } catch (error) {
      addLog('ERROR', 'Audio endpoint test failed', error.message);
      Alert.alert('Audio Test', `[X] Audio Fehler: ${error.message}`);
    }
  };

  const openLogViewer = () => {
    setLogs([...globalLogs]);
    setLogModalVisible(true);
  };

  const clearLogs = () => {
    globalLogs.length = 0;
    setLogs([]);
    addLog('INFO', 'Logs cleared');
  };

  const renderLogItem = ({ item }) => (
    <View style={[styles.logItem, styles[`log${item.type}`]]}>
      <Text style={styles.logTime}>{item.timestamp.split('T')[1].split('.')[0]}</Text>
      <Text style={[styles.logType, styles[`logType${item.type}`]]}>{item.type}</Text>
      <Text style={styles.logMessage}>{item.message}</Text>
      {item.data && <Text style={styles.logData}>{item.data}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Einstellungen</Text>
      
      <ScrollView style={styles.scrollView}>
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
          <Text style={styles.sectionTitle}>Debug & Tests</Text>
          
          <TouchableOpacity style={styles.debugButton} onPress={testBackend}>
            <SFSymbol name="cloud" size={20} color="#007AFF" />
            <Text style={styles.debugButtonText}>Test Backend</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.debugButton} onPress={testAudioEndpoint}>
            <SFSymbol name="play.circle.fill" size={20} color="#34C759" />
            <Text style={styles.debugButtonText}>Test Audio Stream</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.debugButton} onPress={testTrackPlayer}>
            <SFSymbol name="play.circle.fill" size={20} color="#5856D6" />
            <Text style={styles.debugButtonText}>Test TrackPlayer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.debugButton} onPress={testRNFS}>
            <SFSymbol name="externaldrive.connected.to.line.below" size={20} color="#FF9500" />
            <Text style={styles.debugButtonText}>Test Dateisystem</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.debugButton} onPress={openLogViewer}>
            <SFSymbol name="doc.text.fill" size={20} color="#8E8E93" />
            <Text style={styles.debugButtonText}>Logs anzeigen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={logModalVisible}
        onRequestClose={() => setLogModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>System Logs</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={clearLogs} style={styles.modalButton}>
                <SFSymbol name="trash" size={18} color="#FF3B30" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setLogModalVisible(false)} style={styles.modalButton}>
                <SFSymbol name="xmark" size={18} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
          
          <FlatList
            data={logs}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderLogItem}
            contentContainerStyle={styles.logList}
            ListEmptyComponent={
              <Text style={styles.emptyLogs}>Keine Logs vorhanden</Text>
            }
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontFamily: 'System',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'System',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  settingValue: {
    fontSize: 16,
    color: '#8E8E93',
    fontFamily: 'System',
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  debugButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    fontFamily: 'System',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1c1c1e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'System',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  modalButton: {
    padding: 8,
  },
  logList: {
    padding: 8,
  },
  logItem: {
    padding: 8,
    marginBottom: 4,
    borderRadius: 6,
    backgroundColor: '#1c1c1e',
  },
  logTime: {
    fontSize: 11,
    color: '#8E8E93',
    fontFamily: 'System',
    marginBottom: 2,
  },
  logType: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'System',
  },
  logTypeSUCCESS: { color: '#34C759' },
  logTypeERROR: { color: '#FF3B30' },
  logTypeTEST: { color: '#5856D6' },
  logTypeINFO: { color: '#007AFF' },
  logMessage: {
    fontSize: 13,
    color: 'white',
    fontFamily: 'System',
  },
  logData: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
    fontFamily: 'System',
  },
  emptyLogs: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 40,
    fontSize: 16,
    fontFamily: 'System',
  },
});
