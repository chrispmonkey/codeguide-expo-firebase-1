import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

interface ErrorMessageProps {
  message: string | null;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
}

export function ErrorMessage({
  message,
  onDismiss,
  type = 'error',
  dismissible = true,
}: ErrorMessageProps) {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (message) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [message, fadeAnim]);

  if (!message) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return '#ff4444';
      case 'warning':
        return '#ff8800';
      case 'info':
        return '#0088ff';
      default:
        return '#ff4444';
    }
  };

  const handlePress = () => {
    if (dismissible && onDismiss) {
      onDismiss();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor(), opacity: fadeAnim },
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        disabled={!dismissible}
        activeOpacity={dismissible ? 0.7 : 1}
      >
        <Text style={styles.message}>{message}</Text>
        {dismissible && (
          <Text style={styles.dismissText}>Tap to dismiss</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  touchable: {
    padding: 16,
  },
  message: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  dismissText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
}); 