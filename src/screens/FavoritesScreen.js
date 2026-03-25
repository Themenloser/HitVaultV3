import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer from 'react-native-track-player';

// SF Symbol component using text symbols (not emojis)
const SFSymbol = ({ name, size = 20, color = '#333' }) => {
  const symbolMap = {
    'play.fill': '>',
    'pause.fill': '|',
    'star.fill': '★',
    'star': 'S',
    'arrow.down.circle': 'D',
    'video.fill': 'V',
    'trash': 'T',
    'music.note': 'N',
    'magnifyingglass': 'Q',
    'person.fill': 'P',
    'gear': 'G',
    'xmark.circle.fill': 'X',
  };
  
  return (
    <Text style={{ fontSize: size, color, fontWeight: '700', fontFamily: 'System' }}>
      {symbolMap[name] || '•'}
    </Text>
  );
};

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
    // Add focus listener to reload when screen comes into focus
    const interval = setInterval(loadFavorites, 2000); // Reload every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      console.log('Raw favorites from storage:', storedFavorites);
      
      if (storedFavorites) {
        const favoritesData = JSON.parse(storedFavorites);
        console.log('Parsed favorites:', favoritesData);
        setFavorites(favoritesData);
      } else {
        console.log('No favorites found in storage');
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Fehler', 'Favoriten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (item) => {
    try {
      console.log('Removing favorite:', item);
      const updatedFavorites = favorites.filter(fav => fav.id !== item.id);
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      console.log('Favorite removed, updated list:', updatedFavorites);
      Alert.alert('Entfernt', `"${item.title}" wurde aus Favoriten entfernt`);
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Fehler', 'Konnte Favorit nicht entfernen');
    }
  };

  const playFavorite = async (item) => {
    try {
      console.log('Playing favorite:', item);
      // For favorites, we need to get the stream URL first
      const { apiClient } = require('../config/api');
      const audioData = await apiClient.getAudio(item.id);
      
      if (!audioData.url) {
        throw new Error('Keine Audio-URL verfügbar');
      }

      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: item.id,
        url: audioData.url,
        title: item.title,
        artist: item.artist || 'Unbekannter Künstler',
      });
      await TrackPlayer.play();
      
      Alert.alert('Wiedergabe', `Spielt: ${item.title}`);
    } catch (error) {
      console.error('Play error:', error);
      Alert.alert('Fehler', `Wiedergabe fehlgeschlagen: ${error.message}`);
    }
  };

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => playFavorite(item)}
      activeOpacity={0.7}
    >
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemArtist}>{item.artist || 'Unbekannter Künstler'}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => playFavorite(item)}
        >
          <SFSymbol name="play.fill" size={18} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeFavorite(item)}
        >
          <SFSymbol name="trash" size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Favoriten</Text>
      <Text style={styles.subtitle}>{favorites.length} gespeichert</Text>
      
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <SFSymbol name="star" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Keine Favoriten</Text>
          <Text style={styles.emptySubtext}>
            Fügen Sie Songs aus der Suche zu Ihren Favoriten hinzu
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
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
    marginBottom: 4,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontFamily: 'System',
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'System',
  },
  itemArtist: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'System',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    padding: 10,
    marginRight: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  removeButton: {
    padding: 10,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
    fontFamily: 'System',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    fontFamily: 'System',
  },
});
