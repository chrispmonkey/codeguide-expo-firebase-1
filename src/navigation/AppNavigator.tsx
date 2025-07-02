import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components';
import { LoginScreen, WalletCreationScreen, WalletRecoveryScreen } from '../screens';
import { ProfileService } from '../services';

// Main app screens
import { MainTabNavigator } from './MainTabNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';

export type RootStackParamList = {
  // Auth Flow
  Login: undefined;
  WalletCreation: undefined;
  WalletRecovery: undefined;
  
  // Onboarding
  Onboarding: undefined;
  
  // Main App
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { user, isLoading, isInitialized } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [profileCheckLoading, setProfileCheckLoading] = useState(false);
  
  const profileService = ProfileService.getInstance();

  // Check if user has completed profile when authenticated
  useEffect(() => {
    let mounted = true;
    
    const checkUserProfile = async () => {
      if (!user) {
        setHasProfile(null);
        return;
      }

      try {
        setProfileCheckLoading(true);
        const hasUserProfile = await profileService.hasProfile(user);
        
        if (mounted) {
          setHasProfile(hasUserProfile);
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        if (mounted) {
          setHasProfile(false); // Default to requiring onboarding on error
        }
      } finally {
        if (mounted) {
          setProfileCheckLoading(false);
        }
      }
    };

    checkUserProfile();
    
    return () => {
      mounted = false;
    };
  }, [user, profileService]);

  // Show loading screen while auth state is being determined or profile is being checked
  if (!isInitialized || isLoading || (user && profileCheckLoading)) {
    return <LoadingSpinner visible={true} message="Loading..." />;
  }

  const handleOnboardingComplete = () => {
    // Refresh profile status to navigate to main app
    setHasProfile(true);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1F2937' },
          animation: 'slide_from_right',
        }}
      >
        {user ? (
          // User is authenticated
          hasProfile ? (
            // User has completed profile - show main app
            <Stack.Screen 
              name="Main" 
              component={MainTabNavigator}
              options={{ gestureEnabled: false }}
            />
          ) : (
            // User needs to complete onboarding
            <Stack.Screen 
              name="Onboarding" 
              options={{ gestureEnabled: false }}
            >
              {() => (
                <OnboardingNavigator 
                  onComplete={handleOnboardingComplete}
                  onSkip={handleOnboardingComplete}
                />
              )}
            </Stack.Screen>
          )
        ) : (
          // User not authenticated - show auth flow
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen 
              name="WalletCreation" 
              component={WalletCreationScreen}
              options={{
                title: 'Create Wallet',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="WalletRecovery" 
              component={WalletRecoveryScreen}
              options={{
                title: 'Recover Wallet',
                gestureEnabled: true,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 