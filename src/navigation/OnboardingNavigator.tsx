import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BirthInformationForm } from '../components/onboarding/BirthInformationForm';
import { AstrologicalProfile } from '../components/AstrologicalProfile';
import { CosmicInsights } from '../components/CosmicInsights';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ValidationFeedback, OnboardingErrorBoundary } from '../components';
import { 
  AstrologyService, 
  ProfileService, 
  BirthInformation,
} from '../services';
import { 
  ValidationUtils, 
  NetworkErrorHandler, 
  SecurityValidator,
  ValidationError 
} from '../utils';
import { useAuth } from '../hooks/useAuth';

const { width } = Dimensions.get('window');

export enum OnboardingStep {
  WELCOME = 'welcome',
  BIRTH_INFO = 'birth_info',
  GENERATING_PROFILE = 'generating_profile',
  PROFILE_DISPLAY = 'profile_display',
  COSMIC_INSIGHTS = 'cosmic_insights',
  SAVING_PROFILE = 'saving_profile',
  COMPLETE = 'complete'
}

export interface OnboardingNavigatorProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const OnboardingNavigator: React.FC<OnboardingNavigatorProps> = ({
  onComplete,
  onSkip,
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.WELCOME);
  const [birthData, setBirthData] = useState<BirthInformation | null>(null);
  const [astrologicalData, setAstrologicalData] = useState<any>(null);
  const [userSunSign, setUserSunSign] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<ValidationError[]>([]);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<Date | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  const astrologyService = AstrologyService.getInstance();
  const profileService = ProfileService.getInstance();

  const animateToNextStep = (nextStep: OnboardingStep) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    setCurrentStep(nextStep);
  };

  const handleBirthInfoComplete = async (birthInfo: BirthInformation) => {
    try {
      // Rate limiting check
      if (!SecurityValidator.checkSubmissionRate(lastSubmissionTime || undefined)) {
        setError('Please wait before submitting again');
        return;
      }
      setLastSubmissionTime(new Date());

      // Clear previous validation errors
      setValidationErrors([]);
      setValidationWarnings([]);
      setError(null);

      // Comprehensive validation
      const validation = ValidationUtils.validateCompleteForm({
        birthDate: birthInfo.birthDate,
        birthTime: birthInfo.birthTime,
        birthCity: birthInfo.birthCity,
        birthCountry: birthInfo.birthCountry,
        coordinates: birthInfo.coordinates,
        birthTimezone: birthInfo.birthTimezone,
      });

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setValidationWarnings(validation.warnings);
        return;
      }

      // Security validation
      if (!SecurityValidator.validateTextSafety(birthInfo.birthCity) ||
          !SecurityValidator.validateTextSafety(birthInfo.birthCountry)) {
        setError('Invalid characters detected in location data');
        return;
      }

      if (!SecurityValidator.validateLocationSecurity(birthInfo.coordinates)) {
        setError('Invalid location coordinates detected');
        return;
      }

      // Input sanitization
      const sanitizedBirthInfo: BirthInformation = {
        ...birthInfo,
        birthCity: ValidationUtils.sanitizeTextInput(birthInfo.birthCity),
        birthCountry: ValidationUtils.sanitizeTextInput(birthInfo.birthCountry),
      };

      setBirthData(sanitizedBirthInfo);
      setValidationWarnings(validation.warnings); // Show any warnings
      animateToNextStep(OnboardingStep.GENERATING_PROFILE);
      
      // Generate astrological profile with retry logic
      await generateAstrologicalProfile(sanitizedBirthInfo);
      
    } catch (err) {
      console.error('Error processing birth information:', err);
      const errorMessage = NetworkErrorHandler.handleApiError(err);
      setError(errorMessage);
    }
  };

  const generateAstrologicalProfile = async (birthInfo: BirthInformation) => {
    try {
      setIsLoading(true);
      setError(null);
      setValidationErrors([]);

      // Get basic astrological profile with retry logic
      const profileResult = await NetworkErrorHandler.retryOperation(
        () => astrologyService.getBasicProfile(birthInfo),
        3, // max retries
        1000 // delay between retries
      );
      
      if (!profileResult.success) {
        throw new Error(profileResult.error || 'Failed to generate astrological profile');
      }

      // Validate the received data
      if (!profileResult.data?.sun?.sign || !profileResult.data?.moon?.sign) {
        throw new Error('Incomplete astrological data received');
      }

      setAstrologicalData(profileResult.data);
      setUserSunSign(profileResult.data?.sun.sign || null);
      
      // Move to profile display
      setTimeout(() => {
        animateToNextStep(OnboardingStep.PROFILE_DISPLAY);
      }, 2000);
      
    } catch (err) {
      console.error('Error generating astrological profile:', err);
      const errorMessage = NetworkErrorHandler.handleApiError(err);
      
      // Add specific error handling for different scenarios
      if (errorMessage.includes('Network') || errorMessage.includes('connection')) {
        setError('Unable to connect to astrology services. Please check your internet connection and try again.');
      } else if (errorMessage.includes('timeout')) {
        setError('The request is taking longer than expected. Please try again.');
      } else {
        setError(errorMessage);
      }
      
      // Go back to birth info form for user to retry
      setTimeout(() => {
        setCurrentStep(OnboardingStep.BIRTH_INFO);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileViewed = () => {
    animateToNextStep(OnboardingStep.COSMIC_INSIGHTS);
  };

  const handleCosmicInsightsViewed = async () => {
    if (!user || !birthData || !astrologicalData) {
      setError('Missing required data for profile creation');
      return;
    }

    try {
      setCurrentStep(OnboardingStep.SAVING_PROFILE);
      setIsLoading(true);
      setError(null);
      setValidationErrors([]);

      // Validate user authentication
      if (!user.uid || !user.email) {
        throw new Error('User authentication data is incomplete');
      }

      // Create user profile with encrypted birth data
      const profileData = {
        birthInformation: birthData,
        displayName: user.displayName || user.email?.split('@')[0],
        preferences: {
          notifications: true,
          shareProfile: false,
          showBirthTime: false,
        },
      };

      // Save profile with retry logic
      const result = await NetworkErrorHandler.retryOperation(
        () => profileService.createProfile(user, profileData),
        2, // fewer retries for profile creation
        2000 // longer delay for database operations
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save profile');
      }

      // Verify the profile was created successfully
      const verificationResult = await profileService.hasProfile(user);
      if (!verificationResult) {
        throw new Error('Profile was created but could not be verified');
      }

      // Complete onboarding
      animateToNextStep(OnboardingStep.COMPLETE);
      
      // Auto-complete after showing success
      setTimeout(() => {
        onComplete();
      }, 3000);
      
    } catch (err) {
      console.error('Error saving profile:', err);
      const errorMessage = NetworkErrorHandler.handleApiError(err);
      
      // Provide specific guidance based on error type
      if (errorMessage.includes('authentication') || errorMessage.includes('Authentication')) {
        setError('Authentication error. Please sign out and sign in again.');
      } else if (errorMessage.includes('encrypt') || errorMessage.includes('security')) {
        setError('Security error while protecting your data. Please try again.');
      } else if (errorMessage.includes('Network') || errorMessage.includes('connection')) {
        setError('Unable to save your profile. Please check your connection and try again.');
      } else {
        setError(`Failed to save profile: ${errorMessage}`);
      }
      
      // Go back to cosmic insights for user to retry
      setTimeout(() => {
        setCurrentStep(OnboardingStep.COSMIC_INSIGHTS);
      }, 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepProgress = () => {
    const steps = Object.values(OnboardingStep);
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeTitle}>Welcome to Astrophysicals</Text>
        <Text style={styles.welcomeSubtitle}>
          Discover your cosmic blueprint and connect with others through the magic of astrology
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🌟</Text>
            <Text style={styles.featureText}>Discover your Sun, Moon & Rising signs</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🌙</Text>
            <Text style={styles.featureText}>Get daily cosmic insights & horoscopes</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💫</Text>
            <Text style={styles.featureText}>Connect with cosmic compatibility</Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <Pressable 
            style={styles.primaryButton}
            onPress={() => animateToNextStep(OnboardingStep.BIRTH_INFO)}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>
          {onSkip && (
            <Pressable onPress={onSkip}>
              <Text style={styles.secondaryButton}>Skip for now</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );

  const renderBirthInfoStep = () => (
    <View style={styles.stepContainer}>
      <BirthInformationForm
        onComplete={handleBirthInfoComplete}
        onBack={() => animateToNextStep(OnboardingStep.WELCOME)}
      />
    </View>
  );

  const renderGeneratingProfileStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.loadingContent}>
        <LoadingSpinner visible={true} />
        <Text style={styles.loadingTitle}>Reading the Stars</Text>
        <Text style={styles.loadingSubtitle}>
          We're calculating your unique astrological profile based on your birth information...
        </Text>
        <View style={styles.loadingSteps}>
          <Text style={styles.loadingStep}>✓ Processing birth chart</Text>
          <Text style={styles.loadingStep}>✓ Calculating planetary positions</Text>
          <Text style={styles.loadingStep}>⏳ Generating cosmic insights</Text>
        </View>
      </View>
    </View>
  );

  const renderProfileDisplayStep = () => (
    <View style={styles.stepContainer}>
      {birthData && (
        <>
          <AstrologicalProfile
            birthInformation={birthData}
            onProfileReady={setAstrologicalData}
            showCosmicSnapshot={false}
          />
          <View style={styles.stepFooter}>
            <Pressable style={styles.primaryButton} onPress={handleProfileViewed}>
              <Text style={styles.primaryButtonText}>Explore Daily Insights</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );

  const renderCosmicInsightsStep = () => (
    <View style={styles.stepContainer}>
      <CosmicInsights
        userSunSign={userSunSign || undefined}
        showDailyHoroscope={true}
        showCosmicSnapshot={true}
      />
      <View style={styles.stepFooter}>
        <Pressable style={styles.primaryButton} onPress={handleCosmicInsightsViewed}>
          <Text style={styles.primaryButtonText}>Save My Profile</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderSavingProfileStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.loadingContent}>
        <LoadingSpinner visible={true} />
        <Text style={styles.loadingTitle}>Securing Your Cosmic Profile</Text>
        <Text style={styles.loadingSubtitle}>
          We're encrypting and safely storing your astrological information...
        </Text>
      </View>
    </View>
  );

  const renderCompleteStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.completeContent}>
        <Text style={styles.completeIcon}>🎉</Text>
        <Text style={styles.completeTitle}>Your Cosmic Journey Begins!</Text>
        <Text style={styles.completeSubtitle}>
          Your astrological profile has been created and secured. You're ready to connect with the universe and discover meaningful cosmic connections.
        </Text>
        <View style={styles.completeFeatures}>
          <Text style={styles.completeFeature}>✨ Profile saved securely</Text>
          <Text style={styles.completeFeature}>🔮 Daily insights enabled</Text>
          <Text style={styles.completeFeature}>💫 Ready for cosmic connections</Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case OnboardingStep.WELCOME:
        return renderWelcomeStep();
      case OnboardingStep.BIRTH_INFO:
        return renderBirthInfoStep();
      case OnboardingStep.GENERATING_PROFILE:
        return renderGeneratingProfileStep();
      case OnboardingStep.PROFILE_DISPLAY:
        return renderProfileDisplayStep();
      case OnboardingStep.COSMIC_INSIGHTS:
        return renderCosmicInsightsStep();
      case OnboardingStep.SAVING_PROFILE:
        return renderSavingProfileStep();
      case OnboardingStep.COMPLETE:
        return renderCompleteStep();
      default:
        return renderWelcomeStep();
    }
  };

  const handleErrorBoundaryError = (error: Error, errorInfo: any) => {
    console.error('OnboardingNavigator Error Boundary:', error, errorInfo);
    // In a real app, you might want to log this to an error reporting service
  };

  return (
    <OnboardingErrorBoundary onError={handleErrorBoundaryError}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
        
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getStepProgress()}%` }
              ]} 
            />
          </View>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <ErrorMessage 
              message={error} 
              onDismiss={() => setError(null)}
            />
          </View>
        )}

        {/* Validation Feedback */}
        {(validationErrors.length > 0 || validationWarnings.length > 0) && (
          <View style={styles.validationContainer}>
            <ValidationFeedback
              errors={validationErrors}
              warnings={validationWarnings}
              showWarnings={true}
              onDismissError={(index) => {
                const newErrors = [...validationErrors];
                newErrors.splice(index, 1);
                setValidationErrors(newErrors);
              }}
            />
          </View>
        )}

        {/* Main Content */}
        <Animated.View 
          style={[
            styles.contentContainer,
            { opacity: fadeAnim },
          ]}
        >
          {renderCurrentStep()}
        </Animated.View>
      </SafeAreaView>
    </OnboardingErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  errorContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  validationContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  contentContainer: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  
  // Welcome Step
  welcomeContent: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#E5E7EB',
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12,
  },
  
  // Loading Steps
  loadingContent: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loadingSteps: {
    width: '100%',
    gap: 12,
  },
  loadingStep: {
    fontSize: 16,
    color: '#E5E7EB',
    paddingLeft: 8,
  },
  
  // Step Footer
  stepFooter: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Complete Step
  completeContent: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  completeIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  completeSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  completeFeatures: {
    gap: 12,
  },
  completeFeature: {
    fontSize: 16,
    color: '#10B981',
    textAlign: 'center',
  },
}); 