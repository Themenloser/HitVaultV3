import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LibraryScreen() {
  const [favorites, setFavorites] = useState([]);
  const [songs, setSongs] = useState([]);
  const [activeTab, setActiveTab] = useState('favorites'); // 'favorites' or 'songs'

  useEffect(() => {
    loadFavorites();
    loadSongs();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        const favoritesData = JSON.parse(storedFavorites);
        console.log('Loaded favorites:', favoritesData);
        setFavorites(favoritesData);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadSongs = async () => {
    try {
      const storedSongs = await AsyncStorage.getItem('songs');
      if (storedSongs) {
        const songsData = JSON.parse(storedSongs);
        console.log('Loaded songs:', songsData);
        setSongs(songsData);
      }
    } catch (error) {
      console.error('Error loading songs:', error);
    }
  };

  const removeFavorite = async (item) => {
    try {
      const updatedFavorites = favorites.filter(fav => fav.id !== item.id);
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      Alert.alert('Entfernt', `"${item.title}" wurde aus Favoriten entfernt`);
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Fehler', 'Konnte Favorit nicht entfernen');
    }
  };

  const renderFavoriteItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemArtist}>{item.artist || 'Unbekannter Künstler'}</Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => removeFavorite(item)}
      >
        <Icon name="star" size={20} color="#FFCC00" />
      </TouchableOpacity>
    </View>
  );

  const renderSongItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemArtist}>{item.artist || 'Unbekannter Künstler'}</Text>
        <Text style={styles.itemPath}>Lokal gespeichert</Text>
      </View>
      <Icon name="music-note" size={20} color="#666" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bibliothek</Text>
      
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
            Favoriten ({favorites.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'songs' && styles.activeTab]}
          onPress={() => setActiveTab('songs')}
        >
          <Text style={[styles.tabText, activeTab === 'songs' && styles.activeTabText]}>
            Songs ({songs.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'favorites' ? (
        favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="star-border" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Keine Favoriten</Text>
            <Text style={styles.emptySubtext}>
              Fügen Sie Songs über die Suche zu Ihren Favoriten hinzu
            </Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={renderFavoriteItem}
            contentContainerStyle={styles.listContainer}
          />
        )
      ) : (
        songs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="music-note" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Keine Songs heruntergeladen</Text>
            <Text style={styles.emptySubtext}>
              Laden Sie Songs über die Suche herunter
            </Text>
          </View>
        ) : (
          <FlatList
            data={songs}
            keyExtractor={(item) => item.id}
            renderItem={renderSongItem}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'System',
  },
  activeTabText: {
    color: 'white',
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
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
    marginBottom: 2,
    fontFamily: 'System',
  },
  itemPath: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'System',
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 8,
    color: '#333',
    fontFamily: 'System',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'System',
  },
});
