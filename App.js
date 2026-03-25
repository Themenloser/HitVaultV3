import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { BlurView } from 'react-native-blur';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TrackPlayer from 'react-native-track-player';
import LibraryScreen from './src/screens/LibraryScreen';
import SearchScreen from './src/screens/SearchScreen';
import VideosScreen from './src/screens/VideosScreen';
import PlaylistsScreen from './src/screens/PlaylistsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

// Enable screens for better performance
enableScreens();

// TrackPlayer service setup
const setupTrackPlayer = async () => {
  try {
    await TrackPlayer.setupPlayer({
      waitForBuffer: true,
    });
    
    await TrackPlayer.updateOptions({
      capabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
        TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
        TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
        TrackPlayer.CAPABILITY_STOP,
      ],
      compactCapabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
      ],
    });
    
    console.log('TrackPlayer setup complete');
  } catch (error) {
    console.error('TrackPlayer setup error:', error);
  }
};

export default function App() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    setupTrackPlayer();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
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
          tabBarStyle: {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarBackground: () => (
            <BlurView
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              blurType="light"
              blurAmount={20}
              reducedTransparencyFallbackColor="white"
            />
          ),
          tabBarLabelStyle: {
            fontFamily: 'System',
            fontSize: 10,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen name="Bibliothek" component={LibraryScreen} />
        <Tab.Screen name="Suchen" component={SearchScreen} />
        <Tab.Screen name="Videos" component={VideosScreen} />
        <Tab.Screen name="Playlists" component={PlaylistsScreen} />
        <Tab.Screen name="Einstellungen" component={SettingsScreen} />
      </Tab.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
