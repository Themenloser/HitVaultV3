import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';

export default function LibraryScreen() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    // TODO: Load songs from AsyncStorage
    setSongs([]);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bibliothek</Text>
      {songs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bibliothek leer</Text>
          <Text style={styles.emptySubtext}>
            Suchen Sie nach Songs und speichern Sie diese
          </Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.songItem}>
              <Text style={styles.songTitle}>{item.title}</Text>
            </View>
          )}
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
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  songItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
});
