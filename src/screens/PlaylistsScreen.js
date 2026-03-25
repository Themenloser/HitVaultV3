import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function PlaylistsScreen() {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    // TODO: Load playlists from AsyncStorage
    setPlaylists([
      { id: 'favorites', name: 'Favoriten', songs: [] },
    ]);
  }, []);

  const createPlaylist = () => {
    // TODO: Implement playlist creation
    console.log('Create new playlist');
  };

  const renderPlaylist = ({ item }) => (
    <View style={styles.playlistItem}>
      <Text style={styles.playlistName}>{item.name}</Text>
      <Text style={styles.playlistCount}>{item.songs.length} Songs</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Playlists</Text>
        <TouchableOpacity style={styles.addButton} onPress={createPlaylist}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={renderPlaylist}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  playlistItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  playlistName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  playlistCount: {
    fontSize: 14,
    color: 'gray',
  },
});
