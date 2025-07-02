import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallbackComponent?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class OnboardingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to the console and call the optional onError callback
    console.error('OnboardingErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call the optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In a real app, you might want to log this to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined 
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Ionicons name="warning" size={48} color="#EF4444" style={styles.icon} />
            
            <Text style={styles.title}>Something went wrong</Text>
            
            <Text style={styles.message}>
              We encountered an unexpected error during onboarding. This might be a temporary issue.
            </Text>

            <View style={styles.errorDetails}>
              <Text style={styles.errorTitle}>Error Details:</Text>
              <Text style={styles.errorText}>
                {this.state.error?.message || 'Unknown error occurred'}
              </Text>
              
              {__DEV__ && this.state.errorInfo && (
                <View style={styles.debugInfo}>
                  <Text style={styles.debugTitle}>Debug Information:</Text>
                  <Text style={styles.debugText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.retryButton} onPress={this.handleRetry}>
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.retryText}>Try Again</Text>
              </Pressable>
              
              <Pressable 
                style={styles.supportButton}
                onPress={() => {
                  // In a real app, this might open a support ticket or email
                  console.log('Contact support requested');
                }}
              >
                <Ionicons name="help-circle" size={20} color="#8B5CF6" />
                <Text style={styles.supportText}>Contact Support</Text>
              </Pressable>
            </View>

            <View style={styles.tips}>
              <Text style={styles.tipsTitle}>Possible solutions:</Text>
              <Text style={styles.tip}>• Check your internet connection</Text>
              <Text style={styles.tip}>• Close and reopen the app</Text>
              <Text style={styles.tip}>• Ensure you have sufficient storage space</Text>
              <Text style={styles.tip}>• Try again after a few minutes</Text>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  errorDetails: {
    width: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#F9FAFB',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  debugInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 6,
  },
  debugText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  supportText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  tips: {
    width: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  tip: {
    fontSize: 12,
    color: '#D1D5DB',
    lineHeight: 18,
    marginBottom: 2,
  },
}); 