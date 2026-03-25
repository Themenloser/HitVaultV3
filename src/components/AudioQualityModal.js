import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { addLog } from '../screens/SettingsScreen';

// SF Symbol component for iOS native icons
const SFSymbol = ({ name, size = 20, color = '#333' }) => {
  const symbolMap = {
    'music.note': 'N',
    'checkmark': '✓',
    'xmark': '✕',
  };
  
  return (
    <Text style={{ fontSize: size, color, fontWeight: '700', fontFamily: 'System' }}>
      {symbolMap[name] || '•'}
    </Text>
  );
};

const AudioQualityModal = ({ 
  visible, 
  onClose, 
  onQualitySelected, 
  videoUrl, 
  videoTitle 
}) => {
  const [selectedFormat, setSelectedFormat] = useState('mp3');
  const [selectedQuality, setSelectedQuality] = useState('192');

  const audioFormats = [
    { value: 'mp3', label: 'MP3', description: 'Meist kompatibel' },
    { value: 'm4a', label: 'M4A', description: 'Apple Format' },
    { value: 'wav', label: 'WAV', description: 'Hohe Qualität' },
    { value: 'opus', label: 'OPUS', description: 'Modern & effizient' },
    { value: 'flac', label: 'FLAC', description: 'Verlustfrei' },
  ];

  const audioQualities = [
    { value: '128', label: '128 kbps', description: 'Standard' },
    { value: '192', label: '192 kbps', description: 'Gut' },
    { value: '256', label: '256 kbps', description: 'Sehr gut' },
    { value: '320', label: '320 kbps', description: 'Höchste Qualität' },
  ];

  const handleConfirm = () => {
    addLog('AUDIO_QUALITY_SELECTED', `Format: ${selectedFormat}, Quality: ${selectedQuality}`);
    
    onQualitySelected({
      audioFormat: selectedFormat,
      audioQuality: selectedQuality,
    });
    onClose();
  };

  const renderFormatItem = (format) => {
    const isSelected = selectedFormat === format.value;
    
    return (
      <TouchableOpacity
        key={format.value}
        style={[
          styles.optionItem,
          isSelected && styles.selectedOptionItem
        ]}
        onPress={() => setSelectedFormat(format.value)}
      >
        <View style={styles.optionInfo}>
          <Text style={[
            styles.optionLabel,
            isSelected && styles.selectedOptionLabel
          ]}>
            {format.label}
          </Text>
          <Text style={styles.optionDescription}>
            {format.description}
          </Text>
        </View>
        {isSelected && (
          <SFSymbol name="checkmark" size={20} color="#007AFF" />
        )}
      </TouchableOpacity>
    );
  };

  const renderQualityItem = (quality) => {
    const isSelected = selectedQuality === quality.value;
    
    return (
      <TouchableOpacity
        key={quality.value}
        style={[
          styles.optionItem,
          isSelected && styles.selectedOptionItem
        ]}
        onPress={() => setSelectedQuality(quality.value)}
      >
        <View style={styles.optionInfo}>
          <Text style={[
            styles.optionLabel,
            isSelected && styles.selectedOptionLabel
          ]}>
            {quality.label}
          </Text>
          <Text style={styles.optionDescription}>
            {quality.description}
          </Text>
        </View>
        {isSelected && (
          <SFSymbol name="checkmark" size={20} color="#007AFF" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <SFSymbol name="xmark" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Audio-Qualität</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SFSymbol name="music.note" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Format</Text>
            </View>
            <View style={styles.optionsContainer}>
              {audioFormats.map(renderFormatItem)}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SFSymbol name="music.note" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Qualität</Text>
            </View>
            <View style={styles.optionsContainer}>
              {audioQualities.map(renderQualityItem)}
            </View>
          </View>

          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Vorschau:</Text>
            <Text style={styles.previewText}>
              {selectedFormat.toUpperCase()} • {selectedQuality} kbps
            </Text>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Download starten</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'System',
  },
  optionsContainer: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedOptionItem: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  selectedOptionLabel: {
    color: '#007AFF',
  },
  optionDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    fontFamily: 'System',
  },
  previewContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
    fontFamily: 'System',
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'System',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default AudioQualityModal;
