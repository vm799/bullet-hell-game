/**
 * Main App Component
 * Sets up navigation and Firebase initialization
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, View } from 'react-native';

import { firebaseClient } from './services/firebaseClient';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import MatchmakingScreen from './screens/MatchmakingScreen';
import ResultScreen from './screens/ResultScreen';
import ProfileScreen from './screens/ProfileScreen';
import ShopScreen from './screens/ShopScreen';
import OfflineGameScreen from './screens/OfflineGameScreen';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Game Stack Navigator
 */
function GameStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Matchmaking" component={MatchmakingScreen} />
      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="OfflineGame"
        component={OfflineGameScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  );
}

/**
 * Main Tab Navigator
 */
function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#16213e',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#00d4ff',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen
        name="GameStack"
        component={GameStackNavigator}
        options={{
          title: 'Play',
          tabBarLabel: 'Play',
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          title: 'Shop',
          tabBarLabel: 'Shop',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * App Component
 */
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize Firebase
        await firebaseClient.initialize();

        // Simulate some initialization delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setIsReady(true);
      } catch (err) {
        console.error('App initialization error:', err);
        setError(err instanceof Error ? err.message : 'Initialization failed');
        setIsReady(true);
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0f0f0f',
        }}
      >
        <ActivityIndicator
          size="large"
          color="#ff4444"
          style={{ marginRight: 10 }}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
