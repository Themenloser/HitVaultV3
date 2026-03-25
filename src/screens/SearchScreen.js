import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

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

  const renderResult = ({ item }) => (
    <View style={styles.resultItem}>
      <Text style={styles.resultTitle}>{item.title}</Text>
      <Text style={styles.resultArtist}>{item.artist}</Text>
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
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  resultArtist: {
    fontSize: 14,
    color: 'gray',
  },
});
