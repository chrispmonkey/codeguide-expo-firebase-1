import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Clipboard,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner, ErrorMessage } from '../components';

// Get screen dimensions for responsive design
const { width: screenWidth } = Dimensions.get('window');

interface WalletCreationScreenProps {
  navigation?: any;
}

// Steps in the wallet creation flow
enum CreationStep {
  INTRO = 'intro',
  GENERATING = 'generating',
  DISPLAY_MNEMONIC = 'display_mnemonic',
  BACKUP_WARNING = 'backup_warning',
  VERIFY_MNEMONIC = 'verify_mnemonic',
  SUCCESS = 'success',
}

export function WalletCreationScreen({ navigation }: WalletCreationScreenProps) {
  const { createWallet, isLoading, error, clearError } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<CreationStep>(CreationStep.INTRO);
  const [walletData, setWalletData] = useState<{ address: string; mnemonic: string } | null>(null);
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [hasBackedUp, setHasBackedUp] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, []);

  // Process mnemonic when wallet is created
  useEffect(() => {
    if (walletData?.mnemonic) {
      const words = walletData.mnemonic.split(' ');
      setMnemonicWords(words);
      
      // Create shuffled version for verification
      const shuffled = [...words]
        .sort(() => Math.random() - 0.5)
        .slice(0, 12); // Ensure we have exactly 12 words
      setShuffledWords(shuffled);
    }
  }, [walletData]);

  const handleStartCreation = async () => {
    setCurrentStep(CreationStep.GENERATING);
    
    try {
      const wallet = await createWallet();
      setWalletData(wallet);
      setCurrentStep(CreationStep.DISPLAY_MNEMONIC);
    } catch (error) {
      setCurrentStep(CreationStep.INTRO);
      Alert.alert('Error', 'Failed to create wallet. Please try again.');
    }
  };

  const handleCopyMnemonic = async () => {
    if (walletData?.mnemonic) {
      await Clipboard.setString(walletData.mnemonic);
      Alert.alert('Copied', 'Recovery phrase copied to clipboard');
    }
  };

  const handleBackupConfirmed = () => {
    setHasBackedUp(true);
    setCurrentStep(CreationStep.BACKUP_WARNING);
  };

  const handleStartVerification = () => {
    setCurrentStep(CreationStep.VERIFY_MNEMONIC);
  };

  const handleWordSelect = (word: string) => {
    if (selectedWords.length < mnemonicWords.length) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleWordRemove = (index: number) => {
    const newSelected = selectedWords.filter((_, i) => i !== index);
    setSelectedWords(newSelected);
  };

  const handleVerifyMnemonic = () => {
    const isCorrect = selectedWords.join(' ') === walletData?.mnemonic;
    
    if (isCorrect) {
      setVerificationComplete(true);
      setCurrentStep(CreationStep.SUCCESS);
    } else {
      Alert.alert(
        'Verification Failed',
        'The order of words is incorrect. Please try again.',
        [{ text: 'Try Again', onPress: () => setSelectedWords([]) }]
      );
    }
  };

  const handleComplete = () => {
    Alert.alert(
      'Wallet Created Successfully',
      'Your wallet has been created and backed up securely.',
      [{ text: 'Continue', onPress: () => navigation?.replace('Main') }]
    );
  };

  const renderIntroStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Create Your Wallet</Text>
      <Text style={styles.stepDescription}>
        We'll generate a secure wallet for you with a 12-word recovery phrase. 
        This phrase is the only way to recover your wallet, so it's important to back it up safely.
      </Text>
      
      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>⚠️ Important Security Notice</Text>
        <Text style={styles.warningText}>
          • Your recovery phrase is the key to your wallet{'\n'}
          • Never share it with anyone{'\n'}
          • Store it offline in a secure location{'\n'}
          • We cannot recover it if you lose it
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleStartCreation}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Create Wallet</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGeneratingStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Generating Your Wallet</Text>
      <Text style={styles.stepDescription}>
        Creating your secure wallet and recovery phrase...
      </Text>
      <LoadingSpinner 
        visible={true} 
        overlay={false} 
        message="Generating secure wallet..."
      />
    </View>
  );

  const renderDisplayMnemonicStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Your Recovery Phrase</Text>
      <Text style={styles.stepDescription}>
        Write down these 12 words in order. You'll need them to verify your backup.
      </Text>
      
      <View style={styles.mnemonicContainer}>
        {mnemonicWords.map((word, index) => (
          <View key={index} style={styles.mnemonicWordContainer}>
            <Text style={styles.wordNumber}>{index + 1}</Text>
            <Text style={styles.mnemonicWord}>{word}</Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={handleCopyMnemonic}
      >
        <Text style={styles.secondaryButtonText}>📋 Copy to Clipboard</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleBackupConfirmed}
      >
        <Text style={styles.buttonText}>I've Written It Down</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBackupWarningStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Backup Confirmation</Text>
      <Text style={styles.stepDescription}>
        Let's verify you've backed up your recovery phrase correctly.
      </Text>
      
      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>🔒 Final Security Check</Text>
        <Text style={styles.warningText}>
          In the next step, you'll need to select your recovery words in the correct order. 
          Make sure you have them written down safely before proceeding.
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleStartVerification}
      >
        <Text style={styles.buttonText}>Verify My Backup</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, styles.tertiaryButton]}
        onPress={() => setCurrentStep(CreationStep.DISPLAY_MNEMONIC)}
      >
        <Text style={styles.tertiaryButtonText}>Show Phrase Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVerifyMnemonicStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Verify Recovery Phrase</Text>
      <Text style={styles.stepDescription}>
        Select the words in the correct order to verify your backup.
      </Text>
      
      {/* Selected words display */}
      <View style={styles.selectedWordsContainer}>
        <Text style={styles.selectedWordsLabel}>Selected Words:</Text>
        <View style={styles.selectedWordsList}>
          {Array.from({ length: 12 }, (_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.selectedWordSlot,
                selectedWords[index] && styles.selectedWordSlotFilled
              ]}
              onPress={() => selectedWords[index] && handleWordRemove(index)}
            >
              <Text style={styles.wordNumber}>{index + 1}</Text>
              <Text style={styles.selectedWord}>
                {selectedWords[index] || '---'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Word selection buttons */}
      <View style={styles.wordSelectionContainer}>
        <Text style={styles.wordSelectionLabel}>Available Words:</Text>
        <View style={styles.wordGrid}>
          {shuffledWords.map((word, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.wordButton,
                selectedWords.includes(word) && styles.wordButtonUsed
              ]}
              onPress={() => !selectedWords.includes(word) && handleWordSelect(word)}
              disabled={selectedWords.includes(word)}
            >
              <Text style={[
                styles.wordButtonText,
                selectedWords.includes(word) && styles.wordButtonTextUsed
              ]}>
                {word}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.button,
          styles.primaryButton,
          selectedWords.length !== 12 && styles.buttonDisabled
        ]}
        onPress={handleVerifyMnemonic}
        disabled={selectedWords.length !== 12}
      >
        <Text style={styles.buttonText}>Verify Phrase</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, styles.tertiaryButton]}
        onPress={() => setSelectedWords([])}
      >
        <Text style={styles.tertiaryButtonText}>Clear Selection</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>🎉 Wallet Created!</Text>
      <Text style={styles.stepDescription}>
        Your wallet has been successfully created and verified.
      </Text>
      
      <View style={styles.successBox}>
        <Text style={styles.successTitle}>✅ Wallet Details</Text>
        <Text style={styles.walletAddress}>Address:</Text>
        <Text style={styles.addressText}>{walletData?.address}</Text>
        <Text style={styles.successText}>
          Your wallet is now ready to use for astrological connections and NFT collecting!
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleComplete}
      >
        <Text style={styles.buttonText}>Start Using Wallet</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case CreationStep.INTRO:
        return renderIntroStep();
      case CreationStep.GENERATING:
        return renderGeneratingStep();
      case CreationStep.DISPLAY_MNEMONIC:
        return renderDisplayMnemonicStep();
      case CreationStep.BACKUP_WARNING:
        return renderBackupWarningStep();
      case CreationStep.VERIFY_MNEMONIC:
        return renderVerifyMnemonicStep();
      case CreationStep.SUCCESS:
        return renderSuccessStep();
      default:
        return renderIntroStep();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Wallet Setup</Text>
          <Text style={styles.subtitle}>
            Step {Object.values(CreationStep).indexOf(currentStep) + 1} of {Object.values(CreationStep).length}
          </Text>
        </View>

        <ErrorMessage 
          message={error} 
          onDismiss={clearError}
          type="error"
        />

        {renderCurrentStep()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  warningBox: {
    backgroundColor: '#2d1810',
    borderColor: '#ff8800',
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff8800',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#ffcc88',
    lineHeight: 20,
  },
  successBox: {
    backgroundColor: '#1a2d1a',
    borderColor: '#4caf50',
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    color: '#88cc88',
    lineHeight: 20,
    marginTop: 8,
  },
  walletAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4caf50',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: '#cccccc',
    fontFamily: 'monospace',
  },
  mnemonicContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  mnemonicWordContainer: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordNumber: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: 'bold',
    width: 20,
  },
  mnemonicWord: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 8,
  },
  selectedWordsContainer: {
    marginBottom: 30,
  },
  selectedWordsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  selectedWordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  selectedWordSlot: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderColor: '#333333',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedWordSlotFilled: {
    borderStyle: 'solid',
    borderColor: '#7c3aed',
    backgroundColor: '#2a1a3a',
  },
  selectedWord: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 8,
  },
  wordSelectionContainer: {
    marginBottom: 30,
  },
  wordSelectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wordButton: {
    width: '48%',
    backgroundColor: '#2a2a2a',
    borderColor: '#444444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  wordButtonUsed: {
    backgroundColor: '#1a1a1a',
    borderColor: '#666666',
    opacity: 0.5,
  },
  wordButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  wordButtonTextUsed: {
    color: '#888888',
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
  buttonDisabled: {
    backgroundColor: '#444444',
    opacity: 0.6,
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
}); 