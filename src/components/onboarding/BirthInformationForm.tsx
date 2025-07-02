import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Platform,
  Alert,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BirthInformation } from '../../services/profile.service';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';
import { BirthDateStep } from './BirthDateStep';
import { BirthTimeStep } from './BirthTimeStep';
import { BirthLocationStep } from './BirthLocationStep';

export type BirthFormStep = 'date' | 'time' | 'location';

export interface BirthFormData extends Partial<BirthInformation> {
  // Additional form-specific fields
  unknownTime?: boolean;
  estimatedTime?: boolean;
}

export interface BirthInformationFormProps {
  onComplete: (birthData: BirthInformation) => void;
  onBack?: () => void;
  initialData?: Partial<BirthInformation>;
  isLoading?: boolean;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const BirthInformationForm: React.FC<BirthInformationFormProps> = ({
  onComplete,
  onBack,
  initialData = {},
  isLoading = false,
  error,
}) => {
  const [currentStep, setCurrentStep] = useState<BirthFormStep>('date');
  const [formData, setFormData] = useState<BirthFormData>(initialData);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const steps: BirthFormStep[] = ['date', 'time', 'location'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Form validation functions
  const validateBirthDate = (date?: string): ValidationResult => {
    const errors: string[] = [];

    if (!date) {
      errors.push('Birth date is required');
      return { isValid: false, errors };
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      errors.push('Please enter a valid date');
      return { isValid: false, errors };
    }

    const birthDate = new Date(date);
    const today = new Date();
    const maxAge = new Date();
    maxAge.setFullYear(maxAge.getFullYear() - 120);

    if (birthDate > today) {
      errors.push('Birth date cannot be in the future');
    }

    if (birthDate < maxAge) {
      errors.push('Please enter a valid birth date');
    }

    return { isValid: errors.length === 0, errors };
  };

  const validateBirthTime = (time?: string, unknownTime?: boolean): ValidationResult => {
    const errors: string[] = [];

    if (unknownTime) {
      return { isValid: true, errors }; // Unknown time is acceptable
    }

    if (!time) {
      errors.push('Birth time is required (or mark as unknown)');
      return { isValid: false, errors };
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      errors.push('Please enter a valid time (HH:MM format)');
    }

    return { isValid: errors.length === 0, errors };
  };

  const validateBirthLocation = (
    city?: string,
    country?: string,
    coordinates?: { latitude: number; longitude: number }
  ): ValidationResult => {
    const errors: string[] = [];

    if (!city) {
      errors.push('Birth city is required');
    }

    if (!country) {
      errors.push('Birth country is required');
    }

    if (!coordinates || 
        typeof coordinates.latitude !== 'number' || 
        typeof coordinates.longitude !== 'number') {
      errors.push('Please select a valid location');
    } else {
      if (coordinates.latitude < -90 || coordinates.latitude > 90) {
        errors.push('Invalid location coordinates');
      }
      if (coordinates.longitude < -180 || coordinates.longitude > 180) {
        errors.push('Invalid location coordinates');
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const validateCurrentStep = (): boolean => {
    setIsValidating(true);
    let validation: ValidationResult;

    switch (currentStep) {
      case 'date':
        validation = validateBirthDate(formData.birthDate);
        break;
      case 'time':
        validation = validateBirthTime(formData.birthTime, formData.unknownTime);
        break;
      case 'location':
        validation = validateBirthLocation(
          formData.birthCity,
          formData.birthCountry,
          formData.coordinates
        );
        break;
      default:
        validation = { isValid: false, errors: ['Unknown step'] };
    }

    setValidationErrors(validation.errors);
    setIsValidating(false);

    return validation.isValid;
  };

  const updateFormData = (updates: Partial<BirthFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear validation errors when user updates data
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleNext = () => {
    Keyboard.dismiss();

    if (!validateCurrentStep()) {
      return;
    }

    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex]);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    Keyboard.dismiss();

    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
      setValidationErrors([]); // Clear errors when going back
    } else if (onBack) {
      onBack();
    }
  };

  const handleComplete = () => {
    // Final validation of all data
    const dateValidation = validateBirthDate(formData.birthDate);
    const timeValidation = validateBirthTime(formData.birthTime, formData.unknownTime);
    const locationValidation = validateBirthLocation(
      formData.birthCity,
      formData.birthCountry,
      formData.coordinates
    );

    const allErrors = [
      ...dateValidation.errors,
      ...timeValidation.errors,
      ...locationValidation.errors,
    ];

    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      Alert.alert(
        'Please Complete All Fields',
        'Some required information is missing or invalid. Please check your entries.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Prepare final birth information
    const birthInformation: BirthInformation = {
      birthDate: formData.birthDate!,
      birthTime: formData.unknownTime ? '12:00' : formData.birthTime!,
      birthCity: formData.birthCity!,
      birthCountry: formData.birthCountry!,
      birthTimezone: formData.birthTimezone || 'UTC',
      coordinates: formData.coordinates!,
    };

    onComplete(birthInformation);
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>
        Step {currentStepIndex + 1} of {steps.length}
      </Text>
    </View>
  );

  const renderStepContent = () => {
    const stepProps = {
      formData,
      updateFormData,
      validationErrors,
      isValidating,
    };

    switch (currentStep) {
      case 'date':
        return <BirthDateStep {...stepProps} />;
      case 'time':
        return <BirthTimeStep {...stepProps} />;
      case 'location':
        return <BirthLocationStep {...stepProps} />;
      default:
        return null;
    }
  };

  const isLastStep = currentStepIndex === steps.length - 1;
  const canGoNext = !isValidating && !isLoading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with progress */}
          <View style={styles.header}>
            <Pressable 
              style={styles.backButton}
              onPress={handleBack}
              disabled={isLoading}
            >
              <Ionicons name="chevron-back" size={24} color="#E9D5FF" />
            </Pressable>
            
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Your Birth Information</Text>
              {renderProgressBar()}
            </View>
          </View>

          {/* Error display */}
          {error && (
            <View style={styles.errorContainer}>
              <ErrorMessage 
                message={error} 
                onDismiss={() => {}}
              />
            </View>
          )}

          {/* Step content */}
          <View style={styles.stepContent}>
            {renderStepContent()}
          </View>

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <View style={styles.validationErrors}>
              {validationErrors.map((error, index) => (
                <Text key={index} style={styles.errorText}>
                  • {error}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Footer with navigation */}
        <View style={styles.footer}>
          <Pressable
            style={[
              styles.navigationButton,
              styles.nextButton,
              (!canGoNext || validationErrors.length > 0) && styles.buttonDisabled
            ]}
            onPress={handleNext}
            disabled={!canGoNext || validationErrors.length > 0}
          >
            {isLoading ? (
              <LoadingSpinner visible={true} size="small" color="#1F2937" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {isLastStep ? 'Complete' : 'Continue'}
                </Text>
                <Ionicons 
                  name={isLastStep ? "checkmark" : "chevron-forward"} 
                  size={20} 
                  color="#1F2937" 
                />
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  stepContent: {
    flex: 1,
    paddingBottom: 20,
  },
  validationErrors: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  errorContainer: {
    marginBottom: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#1F2937',
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButton: {
    backgroundColor: '#8B5CF6',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  buttonDisabled: {
    backgroundColor: '#6B7280',
    opacity: 0.6,
  },
}); 