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
import TrackPlayer from 'react-native-track-player';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../config/api';
import { addLog } from './SettingsScreen';

// SF Symbol component for iOS native icons using text symbols (not emojis)
const SFSymbol = ({ name, size = 20, color = '#333' }) => {
  const symbolMap = {
    'play.fill': '>',
    'arrow.down.circle': 'D',
    'video.fill': 'V',
    'star': 'S',
    'star.fill': '★',
    'magnifyingglass': 'Q',
    'music.note': 'N',
  };
  
  return (
    <Text style={{ fontSize: size, color, fontWeight: '700', fontFamily: 'System' }}>
      {symbolMap[name] || '•'}
    </Text>
  );
};

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
      addLog('PLAY', `Starting playback for: ${item.title}`);
      
      // Get stream URL from /stream endpoint
      const streamData = await apiClient.getStreamUrl(item.url || item.id);
      
      if (!streamData.url) {
        throw new Error('Keine gültige Stream-URL erhalten');
      }

      addLog('PLAY', `Got stream URL, setting up TrackPlayer`);

      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: item.id,
        url: streamData.url,
        title: streamData.title || item.title,
        artist: streamData.artist || item.artist || 'Unbekannter Künstler',
        artwork: streamData.thumbnail || item.thumbnail,
      });
      await TrackPlayer.play();
      
      addLog('PLAY_SUCCESS', `Playing: ${item.title}`);
      Alert.alert('Erfolg', `Spielt jetzt: ${item.title}`);
    } catch (error) {
      addLog('PLAY_ERROR', error.message);
      console.error('Play error:', error);
      Alert.alert('Wiedergabefehler', error.message);
    }
  };

  const handleDownloadAudio = async (item) => {
    try {
      addLog('DOWNLOAD', `Starting audio download for: ${item.title}`);
      
      // Download audio file from /audio endpoint (returns MP3 blob)
      const audioBlob = await apiClient.downloadAudio(item.url || item.id);
      
      const fileName = `${item.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;
      const downloadPath = `${RNFS.DocumentDirectoryPath}/audios/${fileName}`;
      
      // Create directory if it doesn't exist
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/audios`);
      
      // Convert blob to base64 and write to file
      // For React Native, we need to use the blob differently
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        await RNFS.writeFile(downloadPath, base64data, 'base64');
        
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
        
        addLog('DOWNLOAD_SUCCESS', `Audio saved: ${fileName}`);
        Alert.alert('Download erfolgreich', `"${item.title}" wurde heruntergeladen`);
      };
      reader.readAsDataURL(audioBlob.blob);
      
      Alert.alert('Download gestartet', `Lade "${item.title}" herunter...`);
    } catch (error) {
      addLog('DOWNLOAD_ERROR', error.message);
      console.error('Download audio error:', error);
      Alert.alert('Download-Fehler', error.message);
    }
  };

  const handleDownloadVideo = async (item) => {
    try {
      addLog('DOWNLOAD', `Starting video download for: ${item.title}`);
      
      // Download video file from /video endpoint (returns MP4 blob)
      const videoBlob = await apiClient.downloadVideo(item.url || item.id);
      
      const fileName = `${item.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
      const downloadPath = `${RNFS.DocumentDirectoryPath}/videos/${fileName}`;
      
      // Create directory if it doesn't exist
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/videos`);
      
      // Convert blob to base64 and write to file
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        await RNFS.writeFile(downloadPath, base64data, 'base64');
        
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
        
        addLog('DOWNLOAD_SUCCESS', `Video saved: ${fileName}`);
        Alert.alert('Video-Download erfolgreich', `"${item.title}" wurde heruntergeladen`);
      };
      reader.readAsDataURL(videoBlob.blob);
      
      Alert.alert('Video-Download gestartet', `Lade "${item.title}" herunter...`);
    } catch (error) {
      addLog('DOWNLOAD_ERROR', error.message);
      console.error('Download video error:', error);
      Alert.alert('Video-Download-Fehler', error.message);
    }
  };

  const handleToggleFavorite = async (item) => {
    try {
      console.log('Toggling favorite for:', item);
      const existingFavorites = await AsyncStorage.getItem('favorites');
      console.log('Existing favorites raw:', existingFavorites);
      
      const favorites = existingFavorites ? JSON.parse(existingFavorites) : [];
      console.log('Parsed favorites:', favorites);
      
      const index = favorites.findIndex(fav => fav.id === item.id);
      
      if (index > -1) {
        // Remove from favorites
        favorites.splice(index, 1);
        console.log('Removing from favorites, new list:', favorites);
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
        Alert.alert('Entfernt', `"${item.title}" aus Favoriten entfernt`);
      } else {
        // Add to favorites
        const newFavorite = {
          id: item.id,
          title: item.title,
          artist: item.artist || 'Unbekannter Künstler',
          addedAt: new Date().toISOString(),
        };
        favorites.push(newFavorite);
        console.log('Adding to favorites, new list:', favorites);
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
        Alert.alert('Hinzugefügt', `"${item.title}" zu Favoriten hinzugefügt`);
      }
    } catch (error) {
      console.error('Favorite error:', error);
      Alert.alert('Fehler', 'Favorit konnte nicht gespeichert werden');
    }
  };

  const isFavorite = (item) => {
    // This is a simplified check - in real app you'd track state properly
    return false;
  };

  const renderResult = ({ item }) => (
    <View style={styles.resultItem}>
      <Text style={styles.resultTitle}>{item.title}</Text>
      <Text style={styles.resultArtist}>{item.artist}</Text>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handlePlay(item)}
        >
          <SFSymbol name="play.fill" size={20} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleDownloadAudio(item)}
        >
          <SFSymbol name="arrow.down.circle" size={20} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleDownloadVideo(item)}
        >
          <SFSymbol name="video.fill" size={20} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleToggleFavorite(item)}
        >
          <SFSymbol name="star" size={20} color="#333" />
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
          <SFSymbol name="magnifyingglass" size={48} color="#ccc" />
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
    paddingHorizontal: 16,
    fontFamily: 'System',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 16,
    fontFamily: 'System',
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 16,
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
    paddingHorizontal: 20,
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
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'System',
  },
  resultArtist: {
    fontSize: 13,
    color: 'gray',
    marginBottom: 10,
    fontFamily: 'System',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    maxWidth: 70,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
});
