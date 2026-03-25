import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { apiClient } from '../config/api';
import { addLog } from '../screens/SettingsScreen';

// SF Symbol component for iOS native icons
const SFSymbol = ({ name, size = 20, color = '#333' }) => {
  const symbolMap = {
    'video.fill': 'V',
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

const FormatSelectionModal = ({ 
  visible, 
  onClose, 
  onFormatSelected, 
  videoUrl, 
  videoTitle 
}) => {
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [selectedMergeFormat, setSelectedMergeFormat] = useState('mp4');

  const mergeFormats = ['mp4', 'mkv', 'webm'];

  useEffect(() => {
    if (visible && videoUrl) {
      loadFormats();
    }
  }, [visible, videoUrl]);

  const loadFormats = async () => {
    setLoading(true);
    try {
      addLog('FORMAT_LOAD', `Loading formats for: ${videoTitle}`);
      const videoInfo = await apiClient.getVideoInfo(videoUrl);
      setFormats(videoInfo.formats || []);
      addLog('FORMAT_LOAD_SUCCESS', `Loaded ${videoInfo.formats?.length || 0} formats`);
    } catch (error) {
      addLog('FORMAT_LOAD_ERROR', error.message);
      Alert.alert('Fehler', 'Formate konnten nicht geladen werden');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleFormatSelect = (format) => {
    setSelectedFormat(format);
  };

  const handleConfirm = () => {
    if (!selectedFormat) {
      Alert.alert('Fehler', 'Bitte wählen Sie ein Format aus');
      return;
    }

    onFormatSelected({
      formatId: selectedFormat.format_id,
      mergeTo: selectedMergeFormat,
      format: selectedFormat,
    });
    onClose();
  };

  const renderFormatItem = ({ item }) => {
    const isSelected = selectedFormat?.format_id === item.format_id;
    
    return (
      <TouchableOpacity
        style={[
          styles.formatItem,
          isSelected && styles.selectedFormatItem
        ]}
        onPress={() => handleFormatSelect(item)}
      >
        <View style={styles.formatInfo}>
          <View style={styles.formatHeader}>
            <SFSymbol 
              name={item.kind.includes('video') ? 'video.fill' : 'music.note'} 
              size={16} 
              color="#333" 
            />
            <Text style={styles.formatId}>{item.format_id}</Text>
            {isSelected && (
              <SFSymbol name="checkmark" size={16} color="#007AFF" />
            )}
          </View>
          
          <Text style={styles.formatKind}>{item.kind}</Text>
          
          {item.resolution && (
            <Text style={styles.formatDetail}>Auflösung: {item.resolution}</Text>
          )}
          
          {item.fps && (
            <Text style={styles.formatDetail}>FPS: {item.fps}</Text>
          )}
          
          {item.filesize && (
            <Text style={styles.formatDetail}>
              Größe: {(item.filesize / (1024 * 1024)).toFixed(1)} MB
            </Text>
          )}
          
          {item.tbr && (
            <Text style={styles.formatDetail}>Bitrate: {item.tbr} kbps</Text>
          )}
          
          {item.format_note && (
            <Text style={styles.formatNote}>{item.format_note}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderMergeFormatItem = (format) => {
    const isSelected = selectedMergeFormat === format;
    
    return (
      <TouchableOpacity
        style={[
          styles.mergeFormatItem,
          isSelected && styles.selectedMergeFormatItem
        ]}
        onPress={() => setSelectedMergeFormat(format)}
      >
        <Text style={[
          styles.mergeFormatText,
          isSelected && styles.selectedMergeFormatText
        ]}>
          {format.toUpperCase()}
        </Text>
        {isSelected && (
          <SFSymbol name="checkmark" size={16} color="#007AFF" />
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
          <Text style={styles.title}>Format auswählen</Text>
          <View style={styles.placeholder} />
        </View>

        <Text style={styles.videoTitle} numberOfLines={2}>
          {videoTitle}
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Lade Formate...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Video-Format</Text>
            <FlatList
              data={formats}
              keyExtractor={(item) => item.format_id}
              renderItem={renderFormatItem}
              style={styles.formatsList}
              showsVerticalScrollIndicator={false}
            />

            <Text style={styles.sectionTitle}>Ausgabe-Format</Text>
            <View style={styles.mergeFormatsContainer}>
              {mergeFormats.map(renderMergeFormatItem)}
            </View>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedFormat && styles.disabledButton
              ]}
              onPress={handleConfirm}
              disabled={!selectedFormat}
            >
              <Text style={styles.confirmButtonText}>Download starten</Text>
            </TouchableOpacity>
          </>
        )}
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
  videoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'System',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'System',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'System',
  },
  formatsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formatItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedFormatItem: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  formatInfo: {
    flex: 1,
  },
  formatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  formatId: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 8,
    fontFamily: 'System',
  },
  formatKind: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
    fontFamily: 'System',
  },
  formatDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 1,
    fontFamily: 'System',
  },
  formatNote: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
    fontFamily: 'System',
  },
  mergeFormatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  mergeFormatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  selectedMergeFormatItem: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  mergeFormatText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
    fontFamily: 'System',
  },
  selectedMergeFormatText: {
    color: '#007AFF',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default FormatSelectionModal;
