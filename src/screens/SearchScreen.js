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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TrackPlayer from 'react-native-track-player';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // TODO: Implement actual search with backend
      const response = await fetch(`https://yt-is06.onrender.com/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (item) => {
    try {
      // Get audio stream URL
      const response = await fetch('/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id })
      });
      const data = await response.json();
      
      await TrackPlayer.add({
        id: item.id,
        url: data.url,
        title: item.title,
        artist: item.artist
      });
      await TrackPlayer.play();
    } catch (error) {
      console.error('Play error:', error);
      Alert.alert('Fehler', 'Konnte Titel nicht abspielen');
    }
  };

  const handleDownloadAudio = async (item) => {
    try {
      const response = await fetch('/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id })
      });
      const data = await response.json();
      
      const fileName = `${item.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;
      const downloadPath = `${RNFS.DocumentDirectoryPath}/audios/${fileName}`;
      
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/audios`);
      
      const downloadResult = await RNFS.downloadFile({
        fromUrl: data.url,
        toFile: downloadPath,
        progress: (res) => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          console.log(`Download Progress: ${progress}%`);
        }
      }).promise;
      
      if (downloadResult.statusCode === 200) {
        // Save to AsyncStorage
        const existingSongs = await AsyncStorage.getItem('songs') || '[]';
        const songs = JSON.parse(existingSongs);
        songs.push({
          id: item.id,
          title: item.title,
          artist: item.artist,
          localPath: downloadPath
        });
        await AsyncStorage.setItem('songs', JSON.stringify(songs));
        
        Alert.alert('Erfolg', 'Audio heruntergeladen');
      }
    } catch (error) {
      console.error('Download audio error:', error);
      Alert.alert('Fehler', 'Konnte Audio nicht herunterladen');
    }
  };

  const handleDownloadVideo = async (item) => {
    try {
      const response = await fetch('/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id })
      });
      const data = await response.json();
      
      const fileName = `${item.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
      const downloadPath = `${RNFS.DocumentDirectoryPath}/videos/${fileName}`;
      
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/videos`);
      
      const downloadResult = await RNFS.downloadFile({
        fromUrl: data.url,
        toFile: downloadPath,
        progress: (res) => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          console.log(`Download Progress: ${progress}%`);
        }
      }).promise;
      
      if (downloadResult.statusCode === 200) {
        // Save to AsyncStorage
        const existingVideos = await AsyncStorage.getItem('videos') || '[]';
        const videos = JSON.parse(existingVideos);
        videos.push({
          id: item.id,
          title: item.title,
          artist: item.artist,
          localPath: downloadPath
        });
        await AsyncStorage.setItem('videos', JSON.stringify(videos));
        
        Alert.alert('Erfolg', 'Video heruntergeladen');
      }
    } catch (error) {
      console.error('Download video error:', error);
      Alert.alert('Fehler', 'Konnte Video nicht herunterladen');
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
    <View style={styles.container}>
      <Text style={styles.title}>Suchen</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Suche..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={search}
        returnKeyType="search"
      />
      
      {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      
      {searchResults.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Suche...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderResult}
        />
      )}
    </View>
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
  loader: {
    marginVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: 'gray',
    fontFamily: 'System',
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
