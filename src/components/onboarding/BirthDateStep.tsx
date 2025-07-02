import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { BirthFormData } from './BirthInformationForm';

export interface BirthDateStepProps {
  formData: BirthFormData;
  updateFormData: (updates: Partial<BirthFormData>) => void;
  validationErrors: string[];
  isValidating: boolean;
}

export const BirthDateStep: React.FC<BirthDateStepProps> = ({
  formData,
  updateFormData,
  validationErrors,
  isValidating,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Convert string date to Date object or use default
  const currentDate = formData.birthDate ? new Date(formData.birthDate) : new Date(1990, 4, 15); // May 15, 1990
  
  // Date boundaries
  const maxDate = new Date(); // Today
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120); // 120 years ago

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      // Convert to YYYY-MM-DD format
      const formattedDate = selectedDate.toISOString().split('T')[0];
      updateFormData({ birthDate: formattedDate });
    }
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const hasErrors = validationErrors.length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="calendar" size={32} color="#8B5CF6" />
        </View>
        <Text style={styles.title}>When were you born?</Text>
        <Text style={styles.subtitle}>
          Your birth date helps determine your Sun sign and the foundation of your astrological chart
        </Text>
      </View>

      {/* Date Picker Section */}
      <View style={styles.pickerSection}>
        <Text style={styles.sectionLabel}>Birth Date</Text>
        
        <Pressable
          style={[
            styles.dateButton,
            hasErrors && styles.dateButtonError,
            isValidating && styles.dateButtonValidating,
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={styles.dateButtonContent}>
            <Ionicons 
              name="calendar-outline" 
              size={20} 
              color={hasErrors ? "#EF4444" : "#8B5CF6"} 
            />
            <Text style={[
              styles.dateButtonText,
              hasErrors && styles.dateButtonTextError,
            ]}>
              {formData.birthDate ? formatDisplayDate(currentDate) : 'Select your birth date'}
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={hasErrors ? "#EF4444" : "#9CA3AF"} 
            />
          </View>
        </Pressable>

        {/* Native Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={currentDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={maxDate}
            minimumDate={minDate}
            style={styles.datePicker}
          />
        )}
      </View>

      {/* Educational Content */}
      <View style={styles.educationalSection}>
        <View style={styles.educationalCard}>
          <View style={styles.educationalHeader}>
            <Ionicons name="information-circle" size={20} color="#8B5CF6" />
            <Text style={styles.educationalTitle}>Why Birth Date Matters</Text>
          </View>
          
          <View style={styles.educationalContent}>
            <View style={styles.educationalItem}>
              <Text style={styles.educationalBullet}>☀️</Text>
              <Text style={styles.educationalText}>
                Determines your <Text style={styles.highlight}>Sun sign</Text> - your core personality
              </Text>
            </View>
            
            <View style={styles.educationalItem}>
              <Text style={styles.educationalBullet}>🏠</Text>
              <Text style={styles.educationalText}>
                Influences <Text style={styles.highlight}>house positions</Text> of planets
              </Text>
            </View>
            
            <View style={styles.educationalItem}>
              <Text style={styles.educationalBullet}>⭐</Text>
              <Text style={styles.educationalText}>
                Creates the foundation for your <Text style={styles.highlight}>complete chart</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Example Section */}
      {!formData.birthDate && (
        <View style={styles.exampleSection}>
          <Text style={styles.exampleTitle}>Example</Text>
          <Text style={styles.exampleText}>
            If you were born on May 15, 1990, your Sun sign would likely be Taurus ♉
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  pickerSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4B5563',
    padding: 16,
  },
  dateButtonError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  dateButtonValidating: {
    opacity: 0.8,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginHorizontal: 12,
  },
  dateButtonTextError: {
    color: '#DC2626',
  },
  datePicker: {
    backgroundColor: '#374151',
    marginTop: 8,
  },
  educationalSection: {
    marginBottom: 24,
  },
  educationalCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  educationalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  educationalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    marginLeft: 8,
  },
  educationalContent: {
    gap: 12,
  },
  educationalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  educationalBullet: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  educationalText: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  highlight: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  exampleSection: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
}); 