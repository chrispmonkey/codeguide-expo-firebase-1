import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export type MainTabParamList = {
  Home: undefined;
  Connections: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screens for the main app
function HomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>🌟 Astrophysicals</Text>
      <Text style={styles.subtitle}>Welcome to your astrological journey!</Text>
      <Text style={styles.description}>
        Connect with others through NFC/QR codes to discover your cosmic compatibility
        and mint unique NFT keepsakes of your encounters.
      </Text>
    </View>
  );
}

function ConnectionsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>🤝 Connections</Text>
      <Text style={styles.subtitle}>Your cosmic connections</Text>
      <Text style={styles.description}>
        View your past connections, compatibility scores, and NFT collection here.
      </Text>
    </View>
  );
}

function ProfileScreen() {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>👤 Profile</Text>
      <Text style={styles.subtitle}>Your astrological profile</Text>
      
      <View style={styles.userInfo}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user?.email || 'Not available'}</Text>
        
        <Text style={styles.label}>User ID:</Text>
        <Text style={styles.value}>{user?.uid || 'Not available'}</Text>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333333',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#888888',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Connections" 
        component={ConnectionsScreen}
        options={{
          tabBarLabel: 'Connections',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🤝</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#7c3aed',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  userInfo: {
    marginVertical: 30,
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#888888',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  signOutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 