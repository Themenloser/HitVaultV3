import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LibraryScreen from './src/screens/LibraryScreen';
import SearchScreen from './src/screens/SearchScreen';
import VideosScreen from './src/screens/VideosScreen';
import PlaylistsScreen from './src/screens/PlaylistsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Bibliothek') iconName = 'library-music';
            else if (route.name === 'Suchen') iconName = 'search';
            else if (route.name === 'Videos') iconName = 'videocam';
            else if (route.name === 'Playlists') iconName = 'queue-music';
            else if (route.name === 'Einstellungen') iconName = 'settings';
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Bibliothek" component={LibraryScreen} />
        <Tab.Screen name="Suchen" component={SearchScreen} />
        <Tab.Screen name="Videos" component={VideosScreen} />
        <Tab.Screen name="Playlists" component={PlaylistsScreen} />
        <Tab.Screen name="Einstellungen" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
