import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner, ErrorMessage } from '../components';

interface WalletRecoveryScreenProps {
  navigation?: any;
}

// Common BIP-39 words for suggestions (first 100 for demo)
const COMMON_WORDS = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
  'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
  'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actual', 'adapt',
  'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance', 'advice',
  'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent', 'agree',
  'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol',
  'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha',
  'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among', 'amount',
  'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry', 'animal',
  'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique', 'anxiety',
  'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch',
  'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army',
  'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art', 'article', 'artist',
  'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist', 'assume', 'asthma',
  'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction', 'audit',
  'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado', 'avoid'
];

export function WalletRecoveryScreen({ navigation }: WalletRecoveryScreenProps) {
  const { recoverWallet, isLoading, error, clearError } = useAuth();

  const [inputWords, setInputWords] = useState<string[]>(Array(12).fill(''));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, []);

  // Update suggestions based on current input
  useEffect(() => {
    if (currentInput.length > 0) {
      const filtered = COMMON_WORDS.filter(word =>
        word.toLowerCase().startsWith(currentInput.toLowerCase())
      ).slice(0, 6); // Limit to 6 suggestions
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [currentInput]);

  const handleWordInput = (text: string) => {
    setCurrentInput(text);
  };

  const handleWordSelect = (word: string) => {
    const newWords = [...inputWords];
    newWords[currentWordIndex] = word;
    setInputWords(newWords);
    setCurrentInput('');
    setSuggestions([]);
    
    // Move to next word if not at the end
    if (currentWordIndex < 11) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  const handleWordSlotPress = (index: number) => {
    setCurrentWordIndex(index);
    setCurrentInput(inputWords[index] || '');
  };

  const handleWordClear = (index: number) => {
    const newWords = [...inputWords];
    newWords[index] = '';
    setInputWords(newWords);
    setCurrentWordIndex(index);
    setCurrentInput('');
  };

  const handlePasteFromClipboard = async () => {
    try {
      // In a real app, you'd use Clipboard.getString()
      // For demo purposes, we'll simulate
      Alert.prompt(
        'Paste Recovery Phrase',
        'Paste your 12-word recovery phrase here (words separated by spaces):',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Paste',
            onPress: (text) => {
              if (text) {
                const words = text.trim().split(/\s+/).slice(0, 12);
                const paddedWords = [...words, ...Array(12 - words.length).fill('')];
                setInputWords(paddedWords);
                setCurrentWordIndex(words.length < 12 ? words.length : 11);
              }
            }
          }
        ],
        'plain-text'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to access clipboard');
    }
  };

  const handleRecoverWallet = async () => {
    const mnemonic = inputWords.join(' ').trim();
    
    if (inputWords.filter(word => word.length > 0).length !== 12) {
      Alert.alert('Error', 'Please enter all 12 words of your recovery phrase');
      return;
    }

    try {
      setIsValidating(true);
      const result = await recoverWallet(mnemonic);
      
      if (result.success) {
        Alert.alert(
          'Wallet Recovered',
          'Your wallet has been successfully recovered!',
                      [{ text: 'Continue' }] // AppNavigator will handle routing automatically
        );
      } else {
        Alert.alert(
          'Recovery Failed',
          result.errors?.join('\n') || 'Invalid recovery phrase. Please check your words and try again.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to recover wallet. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Words',
      'Are you sure you want to clear all entered words?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setInputWords(Array(12).fill(''));
            setCurrentWordIndex(0);
            setCurrentInput('');
            setSuggestions([]);
          }
        }
      ]
    );
  };

  const renderWordSlot = (word: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.wordSlot,
        index === currentWordIndex && styles.wordSlotActive,
        word.length > 0 && styles.wordSlotFilled
      ]}
      onPress={() => handleWordSlotPress(index)}
    >
      <Text style={styles.wordNumber}>{index + 1}</Text>
      <Text style={[
        styles.wordText,
        word.length === 0 && styles.wordTextEmpty
      ]}>
        {word || '---'}
      </Text>
      {word.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => handleWordClear(index)}
        >
          <Text style={styles.clearButtonText}>×</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleWordSelect(item)}
    >
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Recover Wallet</Text>
          <Text style={styles.subtitle}>
            Enter your 12-word recovery phrase to restore your wallet
          </Text>
        </View>

        <ErrorMessage 
          message={error} 
          onDismiss={clearError}
          type="error"
        />

        {/* Security warning */}
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>🔒 Security Notice</Text>
          <Text style={styles.warningText}>
            Only enter your recovery phrase on trusted devices. 
            Never share it with anyone or enter it on suspicious websites.
          </Text>
        </View>

        {/* Word input section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Recovery Phrase</Text>
          
          {/* Word slots grid */}
          <View style={styles.wordsGrid}>
            {inputWords.map((word, index) => renderWordSlot(word, index))}
          </View>

          {/* Current word input */}
          <View style={styles.currentInputContainer}>
            <Text style={styles.inputLabel}>
              Word {currentWordIndex + 1}:
            </Text>
            <TextInput
              style={styles.wordInput}
              value={currentInput}
              onChangeText={handleWordInput}
              placeholder="Type or select word"
              placeholderTextColor="#666666"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={true}
              onSubmitEditing={() => {
                if (currentInput && suggestions.includes(currentInput)) {
                  handleWordSelect(currentInput);
                }
              }}
            />
          </View>

          {/* Word suggestions */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsLabel}>Suggestions:</Text>
              <FlatList
                data={suggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.suggestionsList}
              />
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handlePasteFromClipboard}
            >
              <Text style={styles.secondaryButtonText}>📋 Paste Phrase</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.tertiaryButton]}
              onPress={handleClearAll}
            >
              <Text style={styles.tertiaryButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {/* Recover button */}
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              inputWords.filter(word => word.length > 0).length !== 12 && styles.buttonDisabled
            ]}
            onPress={handleRecoverWallet}
            disabled={inputWords.filter(word => word.length > 0).length !== 12 || isLoading}
          >
            <Text style={styles.buttonText}>
              {isValidating ? 'Validating...' : 'Recover Wallet'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {inputWords.filter(word => word.length > 0).length} / 12 words entered
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(inputWords.filter(word => word.length > 0).length / 12) * 100}%` }
              ]}
            />
          </View>
        </View>
      </ScrollView>

      <LoadingSpinner
        visible={isLoading && !isValidating}
        message="Recovering wallet..."
      />
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  warningBox: {
    backgroundColor: '#2d1810',
    borderColor: '#ff8800',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
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
  inputSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  wordSlot: {
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
    position: 'relative',
  },
  wordSlotActive: {
    borderColor: '#7c3aed',
    borderStyle: 'solid',
    backgroundColor: '#2a1a3a',
  },
  wordSlotFilled: {
    borderStyle: 'solid',
    borderColor: '#4caf50',
    backgroundColor: '#1a2d1a',
  },
  wordNumber: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: 'bold',
    width: 20,
  },
  wordText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 8,
    flex: 1,
  },
  wordTextEmpty: {
    color: '#666666',
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  currentInputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  wordInput: {
    backgroundColor: '#1a1a1a',
    borderColor: '#7c3aed',
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  suggestionsContainer: {
    marginBottom: 20,
  },
  suggestionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444444',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  suggestionText: {
    color: '#ffffff',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#7c3aed',
    marginHorizontal: 0,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#7c3aed',
    borderWidth: 1,
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#666666',
    borderWidth: 1,
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
    fontSize: 14,
    fontWeight: '600',
  },
  tertiaryButtonText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
  },
}); 