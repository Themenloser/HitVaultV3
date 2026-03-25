import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';

export default function VideosScreen() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // TODO: Load videos from AsyncStorage
    setVideos([]);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Videos</Text>
      {videos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Keine Videos</Text>
          <Text style={styles.emptySubtext}>
            Suchen Sie nach Videos und speichern Sie diese
          </Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.videoItem}>
              <Text style={styles.videoTitle}>{item.title}</Text>
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
  videoItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
});
