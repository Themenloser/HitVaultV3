import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TrackPlayer from 'react-native-track-player';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../config/api';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie einen Suchbegriff ein');
      return;
    }

    setLoading(true);
    try {
      const results = await apiClient.search(searchQuery);
      setSearchResults(results);
      
      if (results.length === 0) {
        Alert.alert('Keine Ergebnisse', `Keine Songs gefunden für "${searchQuery}"`);
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Suchfehler', error.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (item) => {
    try {
      // Get audio stream URL
      const audioData = await apiClient.getAudio(item.id);
      
      if (!audioData.url) {
        throw new Error('Keine gültige Audio-URL erhalten');
      }

      // Validate URL format
      if (!audioData.url.startsWith('http')) {
        throw new Error('Ungültiges URL-Format erhalten');
      }

      await TrackPlayer.reset(); // Clear previous tracks
      await TrackPlayer.add({
        id: item.id,
        url: audioData.url,
        title: item.title,
        artist: item.artist || 'Unbekannter Künstler',
      });
      await TrackPlayer.play();
      
      Alert.alert('Erfolg', `Spielt jetzt: ${item.title}`);
    } catch (error) {
      console.error('Play error:', error);
      Alert.alert('Wiedergabefehler', error.message);
    }
  };

  const handleDownloadAudio = async (item) => {
  try {
    const audioData = await apiClient.getAudio(item.id);
    
    if (!audioData.url) {
      throw new Error('Keine gültige Download-URL erhalten');
    }

    // Validate URL format
    if (!audioData.url.startsWith('http')) {
      throw new Error('Ungültiges URL-Format für Download');
    }

    const fileName = `${item.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;
    const downloadPath = `${RNFS.DocumentDirectoryPath}/audios/${fileName}`;
    
    // Create directory if it doesn't exist
    await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/audios`, { NSURLIsExcludedFromBackupKey: true });
    
    // Show download started message
    Alert.alert('Download gestartet', `Lade "${item.title}" herunter...`);
    
    const downloadResult = await RNFS.downloadFile({
      fromUrl: audioData.url,
      toFile: downloadPath,
      progressDivider: 10,
      progress: (res) => {
        const progress = Math.round((res.bytesWritten / res.contentLength) * 100);
        console.log(`Download Progress: ${progress}%`);
      }
    }).promise;
    
    if (downloadResult.statusCode === 200) {
      // Verify file exists
      const fileExists = await RNFS.exists(downloadPath);
      if (!fileExists) {
        throw new Error('Download abgeschlossen, aber Datei nicht gefunden');
      }

      // Save to AsyncStorage
      const existingSongs = await AsyncStorage.getItem('songs') || '[]';
      const songs = JSON.parse(existingSongs);
      songs.push({
        id: item.id,
        title: item.title,
        artist: item.artist || 'Unbekannter Künstler',
        localPath: downloadPath,
        downloadedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem('songs', JSON.stringify(songs));
      
      Alert.alert('Download erfolgreich', `"${item.title}" wurde heruntergeladen`);
    } else {
      throw new Error(`Download fehlgeschlagen mit Status: ${downloadResult.statusCode}`);
    }
  } catch (error) {
    console.error('Download audio error:', error);
    Alert.alert('Download-Fehler', error.message);
  }
};

  const handleDownloadVideo = async (item) => {
  try {
    const videoData = await apiClient.getVideo(item.id);
    
    if (!videoData.url) {
      throw new Error('Keine gültige Video-Download-URL erhalten');
    }

    // Validate URL format
    if (!videoData.url.startsWith('http')) {
      throw new Error('Ungültiges URL-Format für Video-Download');
    }

    const fileName = `${item.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
    const downloadPath = `${RNFS.DocumentDirectoryPath}/videos/${fileName}`;
    
    // Create directory if it doesn't exist
    await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/videos`, { NSURLIsExcludedFromBackupKey: true });
    
    // Show download started message
    Alert.alert('Video-Download gestartet', `Lade "${item.title}" herunter...`);
    
    const downloadResult = await RNFS.downloadFile({
      fromUrl: videoData.url,
      toFile: downloadPath,
      progressDivider: 10,
      progress: (res) => {
        const progress = Math.round((res.bytesWritten / res.contentLength) * 100);
        console.log(`Video Download Progress: ${progress}%`);
      }
    }).promise;
    
    if (downloadResult.statusCode === 200) {
      // Verify file exists
      const fileExists = await RNFS.exists(downloadPath);
      if (!fileExists) {
        throw new Error('Video-Download abgeschlossen, aber Datei nicht gefunden');
      }

      // Save to AsyncStorage
      const existingVideos = await AsyncStorage.getItem('videos') || '[]';
      const videos = JSON.parse(existingVideos);
      videos.push({
        id: item.id,
        title: item.title,
        artist: item.artist || 'Unbekannter Künstler',
        localPath: downloadPath,
        downloadedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem('videos', JSON.stringify(videos));
      
      Alert.alert('Video-Download erfolgreich', `"${item.title}" wurde heruntergeladen`);
    } else {
      throw new Error(`Video-Download fehlgeschlagen mit Status: ${downloadResult.statusCode}`);
    }
  } catch (error) {
    console.error('Download video error:', error);
    Alert.alert('Video-Download-Fehler', error.message);
  }
};

  const handleToggleFavorite = async (item) => {
    try {
      const existingFavorites = await AsyncStorage.getItem('favorites') || '[]';
      const favorites = JSON.parse(existingFavorites);
      
      const index = favorites.findIndex(fav => fav.id === item.id);
      if (index > -1) {
        favorites.splice(index, 1);
        Alert.alert('Entfernt', 'Aus Favoriten entfernt');
      } else {
        favorites.push({
          id: item.id,
          title: item.title,
          artist: item.artist
        });
        Alert.alert('Hinzugefügt', 'Zu Favoriten hinzugefügt');
      }
      
      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Favorite error:', error);
    }
  };

  const renderResult = ({ item }) => (
    <View style={styles.resultItem}>
      <Text style={styles.resultTitle}>{item.title}</Text>
      <Text style={styles.resultArtist}>{item.artist}</Text>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.playButton]} 
          onPress={() => handlePlay(item)}
        >
          <Icon name="play-arrow" size={20} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.downloadAudioButton]} 
          onPress={() => handleDownloadAudio(item)}
        >
          <Icon name="download" size={20} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.downloadVideoButton]} 
          onPress={() => handleDownloadVideo(item)}
        >
          <Icon name="videocam" size={20} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.favoriteButton]} 
          onPress={() => handleToggleFavorite(item)}
        >
          <Icon name="star" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Suchen</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Suche..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={search}
        returnKeyType="search"
        editable={!loading}
      />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Suche läuft...</Text>
        </View>
      )}
      
      {!loading && searchResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="search" size={48} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery.trim() ? 'Keine Ergebnisse gefunden' : 'Geben Sie einen Suchbegriff ein'}
          </Text>
        </View>
      ) : (
        !loading && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderResult}
            contentContainerStyle={styles.listContainer}
          />
        )
      )}
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
  searchInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'System',
  },
  listContainer: {
    paddingBottom: 20,
  },
  resultItem: {
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
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    fontFamily: 'System',
  },
  resultArtist: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
    fontFamily: 'System',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    width: 65,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#007AFF',
  },
  downloadAudioButton: {
    backgroundColor: '#34C759',
  },
  downloadVideoButton: {
    backgroundColor: '#FF9500',
  },
  favoriteButton: {
    backgroundColor: '#FFCC00',
  },
});
