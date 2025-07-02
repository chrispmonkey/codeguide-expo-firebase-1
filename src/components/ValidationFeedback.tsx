import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ValidationError } from '../utils/validation.utils';

export interface ValidationFeedbackProps {
  errors: ValidationError[];
  warnings: ValidationError[];
  showWarnings?: boolean;
  onDismissError?: (index: number) => void;
  style?: any;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  errors,
  warnings,
  showWarnings = true,
  onDismissError,
  style,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (errors.length > 0 || (showWarnings && warnings.length > 0)) {
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
  }, [errors.length, warnings.length, showWarnings, fadeAnim]);

  if (errors.length === 0 && (!showWarnings || warnings.length === 0)) {
    return null;
  }

  const renderValidationItem = (
    item: ValidationError, 
    index: number, 
    isError: boolean
  ) => (
    <View key={`${item.field}-${index}`} style={[
      styles.validationItem,
      isError ? styles.errorItem : styles.warningItem
    ]}>
      <View style={styles.itemContent}>
        <Ionicons
          name={isError ? "alert-circle" : "warning"}
          size={16}
          color={isError ? "#EF4444" : "#F59E0B"}
          style={styles.itemIcon}
        />
        <Text style={[
          styles.itemText,
          isError ? styles.errorText : styles.warningText
        ]}>
          {item.message}
        </Text>
      </View>
      
      {onDismissError && isError && (
        <TouchableOpacity
          onPress={() => onDismissError(index)}
          style={styles.dismissButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={14} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Animated.View style={[styles.container, style, { opacity: fadeAnim }]}>
      {/* Errors */}
      {errors.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text style={styles.sectionTitle}>
              {errors.length === 1 ? 'Error' : `${errors.length} Errors`}
            </Text>
          </View>
          {errors.map((error, index) => renderValidationItem(error, index, true))}
        </View>
      )}

      {/* Warnings */}
      {showWarnings && warnings.length > 0 && (
        <View style={[styles.section, errors.length > 0 && styles.sectionSpacing]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={18} color="#F59E0B" />
            <Text style={styles.sectionTitle}>
              {warnings.length === 1 ? 'Warning' : `${warnings.length} Warnings`}
            </Text>
          </View>
          {warnings.map((warning, index) => renderValidationItem(warning, index, false))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  section: {
    marginBottom: 8,
  },
  sectionSpacing: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F1D1D',
    marginLeft: 6,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  errorItem: {
    backgroundColor: '#FEE2E2',
  },
  warningItem: {
    backgroundColor: '#FEF3C7',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  itemText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  errorText: {
    color: '#7F1D1D',
  },
  warningText: {
    color: '#92400E',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default ValidationFeedback; 