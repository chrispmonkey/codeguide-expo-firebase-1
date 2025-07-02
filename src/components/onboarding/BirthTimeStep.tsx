import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Switch,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { BirthFormData } from './BirthInformationForm';

export interface BirthTimeStepProps {
  formData: BirthFormData;
  updateFormData: (updates: Partial<BirthFormData>) => void;
  validationErrors: string[];
  isValidating: boolean;
}

export const BirthTimeStep: React.FC<BirthTimeStepProps> = ({
  formData,
  updateFormData,
  validationErrors,
  isValidating,
}) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Convert string time to Date object for picker
  const getTimeAsDate = (): Date => {
    if (formData.birthTime) {
      const [hours, minutes] = formData.birthTime.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
    // Default to 12:00 PM
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    return date;
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    
    if (selectedTime) {
      // Convert to HH:MM format
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      
      updateFormData({ 
        birthTime: formattedTime,
        unknownTime: false,
        estimatedTime: false,
      });
    }
  };

  const handleUnknownTimeToggle = (value: boolean) => {
    if (value) {
      // User doesn't know their birth time
      updateFormData({
        unknownTime: true,
        birthTime: '12:00', // Default noon
        estimatedTime: true,
      });
    } else {
      // User wants to set a specific time
      updateFormData({
        unknownTime: false,
        estimatedTime: false,
      });
    }
  };

  const formatDisplayTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const hasErrors = validationErrors.length > 0;
  const isUnknownTime = formData.unknownTime || false;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="time" size={32} color="#8B5CF6" />
        </View>
        <Text style={styles.title}>What time were you born?</Text>
        <Text style={styles.subtitle}>
          Your birth time determines your Rising sign and the precise house positions in your chart
        </Text>
      </View>

      {/* Unknown Time Toggle */}
      <View style={styles.unknownTimeSection}>
        <View style={styles.toggleContainer}>
          <View style={styles.toggleContent}>
            <Ionicons name="help-circle-outline" size={20} color="#9CA3AF" />
            <Text style={styles.toggleLabel}>I don't know my exact birth time</Text>
          </View>
          <Switch
            value={isUnknownTime}
            onValueChange={handleUnknownTimeToggle}
            trackColor={{ false: '#374151', true: '#8B5CF6' }}
            thumbColor={isUnknownTime ? '#FFFFFF' : '#9CA3AF'}
            ios_backgroundColor="#374151"
          />
        </View>
        
        {isUnknownTime && (
          <View style={styles.unknownTimeNote}>
            <Text style={styles.unknownTimeText}>
              💡 No worries! We'll use 12:00 PM as an estimate. Your Rising sign may be less accurate, 
              but we can still calculate your Sun and Moon signs perfectly.
            </Text>
          </View>
        )}
      </View>

      {/* Time Picker Section */}
      {!isUnknownTime && (
        <View style={styles.pickerSection}>
          <Text style={styles.sectionLabel}>Birth Time</Text>
          
          <Pressable
            style={[
              styles.timeButton,
              hasErrors && styles.timeButtonError,
              isValidating && styles.timeButtonValidating,
            ]}
            onPress={() => setShowTimePicker(true)}
          >
            <View style={styles.timeButtonContent}>
              <Ionicons 
                name="time-outline" 
                size={20} 
                color={hasErrors ? "#EF4444" : "#8B5CF6"} 
              />
              <Text style={[
                styles.timeButtonText,
                hasErrors && styles.timeButtonTextError,
              ]}>
                {formData.birthTime ? formatDisplayTime(formData.birthTime) : 'Select your birth time'}
              </Text>
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={hasErrors ? "#EF4444" : "#9CA3AF"} 
              />
            </View>
          </Pressable>

          {/* Native Time Picker */}
          {showTimePicker && (
            <DateTimePicker
              value={getTimeAsDate()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              style={styles.timePicker}
            />
          )}
        </View>
      )}

      {/* Educational Content */}
      <View style={styles.educationalSection}>
        <View style={styles.educationalCard}>
          <View style={styles.educationalHeader}>
            <Ionicons name="information-circle" size={20} color="#8B5CF6" />
            <Text style={styles.educationalTitle}>Why Birth Time Matters</Text>
          </View>
          
          <View style={styles.educationalContent}>
            <View style={styles.educationalItem}>
              <Text style={styles.educationalBullet}>⬆️</Text>
              <Text style={styles.educationalText}>
                Determines your <Text style={styles.highlight}>Rising sign</Text> - how others see you
              </Text>
            </View>
            
            <View style={styles.educationalItem}>
              <Text style={styles.educationalBullet}>🏠</Text>
              <Text style={styles.educationalText}>
                Precise <Text style={styles.highlight}>house positions</Text> for all planets
              </Text>
            </View>
            
            <View style={styles.educationalItem}>
              <Text style={styles.educationalBullet}>🎯</Text>
              <Text style={styles.educationalText}>
                Accurate <Text style={styles.highlight}>Midheaven</Text> and life path indicators
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Estimate Section */}
      {isUnknownTime && (
        <View style={styles.estimateSection}>
          <View style={styles.estimateCard}>
            <View style={styles.estimateHeader}>
              <Ionicons name="time-outline" size={20} color="#F59E0B" />
              <Text style={styles.estimateTitle}>Using 12:00 PM Estimate</Text>
            </View>
            <Text style={styles.estimateText}>
              This gives you the most neutral Rising sign calculation. If you find your birth time later, 
              you can always update your profile for more precise readings.
            </Text>
          </View>
        </View>
      )}

      {/* Tips Section */}
      {!isUnknownTime && !formData.birthTime && (
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Finding Your Birth Time</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipText}>• Check your birth certificate</Text>
            <Text style={styles.tipText}>• Ask family members who were present</Text>
            <Text style={styles.tipText}>• Contact the hospital where you were born</Text>
            <Text style={styles.tipText}>• Even an approximate time is better than none</Text>
          </View>
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
    marginBottom: 32,
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
  unknownTimeSection: {
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#E5E7EB',
    marginLeft: 8,
    flex: 1,
  },
  unknownTimeNote: {
    marginTop: 12,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  unknownTimeText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
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
  timeButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4B5563',
    padding: 16,
  },
  timeButtonError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  timeButtonValidating: {
    opacity: 0.8,
  },
  timeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginHorizontal: 12,
  },
  timeButtonTextError: {
    color: '#DC2626',
  },
  timePicker: {
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
  estimateSection: {
    marginBottom: 24,
  },
  estimateCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  estimateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  estimateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  estimateText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  tipsSection: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 12,
  },
  tipsList: {
    gap: 6,
  },
  tipText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 18,
  },
}); 