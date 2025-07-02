import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner, ErrorMessage } from '../components';
import type { SiwaChallenge } from '../services';

interface LoginScreenProps {
  navigation?: any; // Navigation prop for routing
}

export function LoginScreen({ navigation }: LoginScreenProps) {
  const {
    signIn,
    signUp,
    generateSiwaChallenge,
    signInWithAptos,
    registerWithAptos,
    signMessageWithWallet,
    isLoading,
    error,
    clearError,
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletLogin, setIsWalletLogin] = useState(false);
  const [siwaChallenge, setSiwaChallenge] = useState<SiwaChallenge | null>(null);

  // Clear error when component mounts or mode changes
  React.useEffect(() => {
    clearError();
  }, [isSignUp, isWalletLogin]);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      if (isSignUp) {
        await signUp(email, password, true); // Create wallet by default
        Alert.alert(
          'Success',
          'Account created successfully! Your wallet has been generated.',
          [{ text: 'OK', onPress: () => navigation?.replace('Main') }]
        );
      } else {
        await signIn(email, password);
        navigation?.replace('Main');
      }
    } catch (error) {
      Alert.alert('Authentication Error', (error as Error).message);
    }
  };

  const handleSiwaInit = async () => {
    if (!walletAddress.trim()) {
      Alert.alert('Error', 'Please enter your wallet address');
      return;
    }

    try {
      const challenge = await generateSiwaChallenge(walletAddress.trim());
      setSiwaChallenge(challenge);
      
      // In a real app, this would prompt the user to sign with their wallet
      // For demo purposes, we'll simulate the signing process
      Alert.alert(
        'Sign Challenge',
        `Please sign this message with your wallet:\n\n${challenge.challenge}`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setSiwaChallenge(null) },
          { text: 'Sign (Demo)', onPress: () => handleSiwaSign(challenge) }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate authentication challenge');
    }
  };

  const handleSiwaSign = async (challenge: SiwaChallenge) => {
    try {
      // In a real app, the user would sign with their wallet
      // For demo purposes, we'll use our test signing method
      const signatureData = await signMessageWithWallet(walletAddress, challenge.challenge);
      
      if (!signatureData) {
        Alert.alert('Error', 'Failed to sign message. Please ensure wallet exists.');
        return;
      }

      const signaturePayload = {
        challenge: challenge.challenge,
        signature: signatureData.signature,
        publicKey: signatureData.publicKey,
        address: walletAddress,
        nonce: challenge.nonce,
      };

      // Try to sign in first
      const result = await signInWithAptos(signaturePayload);
      
      if (result.success) {
        Alert.alert('Success', 'Signed in successfully!', [
          { text: 'OK', onPress: () => navigation?.replace('Main') }
        ]);
      } else if (result.requiresRegistration) {
        // If user doesn't exist, prompt for registration
        Alert.alert(
          'New User',
          'This wallet is not registered. Would you like to create an account?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Register', 
              onPress: () => handleSiwaRegister(signaturePayload) 
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Authentication failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete wallet authentication');
    } finally {
      setSiwaChallenge(null);
    }
  };

  const handleSiwaRegister = async (signaturePayload: any) => {
    try {
      const result = await registerWithAptos(signaturePayload, {
        displayName: `User_${walletAddress.slice(-6)}`
      });

      if (result.success) {
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => navigation?.replace('Main') }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to register with wallet');
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    clearError();
  };

  const toggleWalletLogin = () => {
    setIsWalletLogin(!isWalletLogin);
    setWalletAddress('');
    setSiwaChallenge(null);
    clearError();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Astrophysicals</Text>
            <Text style={styles.subtitle}>
              {isWalletLogin 
                ? 'Sign in with your Aptos wallet' 
                : isSignUp 
                  ? 'Create your account' 
                  : 'Welcome back'
              }
            </Text>
          </View>

          <ErrorMessage 
            message={error} 
            onDismiss={clearError}
            type="error"
          />

          <View style={styles.formContainer}>
            {isWalletLogin ? (
              // Wallet authentication form
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Wallet Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your Aptos wallet address"
                  value={walletAddress}
                  onChangeText={setWalletAddress}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            ) : (
              // Email authentication form
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!isLoading}
                  />
                </View>

                {isSignUp && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      editable={!isLoading}
                    />
                  </View>
                )}
              </>
            )}

            {/* Main action button */}
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={isWalletLogin ? handleSiwaInit : handleEmailAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isWalletLogin 
                    ? 'Sign In with Wallet' 
                    : isSignUp 
                      ? 'Create Account' 
                      : 'Sign In'
                  }
                </Text>
              )}
            </TouchableOpacity>

            {/* Auth mode toggle */}
            {!isWalletLogin && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={toggleAuthMode}
                disabled={isLoading}
              >
                <Text style={styles.secondaryButtonText}>
                  {isSignUp ? 'Already have an account? Sign In' : 'New user? Create Account'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Wallet/Email toggle */}
            <TouchableOpacity
              style={[styles.button, styles.tertiaryButton]}
              onPress={toggleWalletLogin}
              disabled={isLoading}
            >
              <Text style={styles.tertiaryButtonText}>
                {isWalletLogin ? 'Use Email Instead' : 'Sign In with Aptos Wallet'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info text */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {isWalletLogin 
                ? 'Connect using your existing Aptos wallet for a secure, decentralized experience.'
                : isSignUp
                  ? 'Creating an account will also generate a secure Aptos wallet for you.'
                  : 'Sign in to access your astrological connections and NFT collection.'
              }
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <LoadingSpinner
        visible={isLoading}
        message={isWalletLogin ? "Authenticating with wallet..." : "Signing you in..."}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },

  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#7c3aed',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#7c3aed',
    borderWidth: 1,
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButtonText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '500',
  },
  infoContainer: {
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },
}); 