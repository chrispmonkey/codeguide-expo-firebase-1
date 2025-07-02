import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';

interface LoadingSpinnerProps {
  visible: boolean;
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
}

export function LoadingSpinner({
  visible,
  message = 'Loading...',
  size = 'large',
  color = '#7c3aed',
  overlay = true,
}: LoadingSpinnerProps) {
  if (!visible) return null;

  const content = (
    <View style={overlay ? styles.overlayContainer : styles.inlineContainer}>
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size={size} color={color} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={visible}
        statusBarTranslucent={true}
      >
        {content}
      </Modal>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  spinnerContainer: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  message: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
}); 