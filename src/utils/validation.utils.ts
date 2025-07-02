/**
 * Comprehensive validation utilities for onboarding data
 */

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export class ValidationUtils {
  // Date validation
  static validateBirthDate(date: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Required field check
    if (!date || date.trim() === '') {
      errors.push({
        field: 'birthDate',
        message: 'Birth date is required',
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }

    // Format validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      errors.push({
        field: 'birthDate',
        message: 'Please enter date in YYYY-MM-DD format',
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }

    // Parse and validate date
    const birthDate = new Date(date);
    const today = new Date();
    const maxAge = new Date();
    maxAge.setFullYear(maxAge.getFullYear() - 150);

    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
      errors.push({
        field: 'birthDate',
        message: 'Please enter a valid date',
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }

    // Future date check
    if (birthDate > today) {
      errors.push({
        field: 'birthDate',
        message: 'Birth date cannot be in the future',
        severity: 'error'
      });
    }

    // Maximum age check
    if (birthDate < maxAge) {
      errors.push({
        field: 'birthDate',
        message: 'Please enter a birth date within the last 150 years',
        severity: 'error'
      });
    }

    // Recent date warning
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (birthDate > oneYearAgo) {
      warnings.push({
        field: 'birthDate',
        message: 'Very recent birth date - please verify accuracy',
        severity: 'warning'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Time validation
  static validateBirthTime(time: string, unknownTime: boolean = false): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Allow unknown time
    if (unknownTime) {
      warnings.push({
        field: 'birthTime',
        message: 'Birth time marked as unknown - accuracy may be reduced',
        severity: 'warning'
      });
      return { isValid: true, errors, warnings };
    }

    // Required field check
    if (!time || time.trim() === '') {
      errors.push({
        field: 'birthTime',
        message: 'Birth time is required (or mark as unknown)',
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }

    // Format validation (HH:MM or H:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      errors.push({
        field: 'birthTime',
        message: 'Please enter time in HH:MM format (24-hour)',
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }

    // Parse time components
    const [hours, minutes] = time.split(':').map(Number);

    // Validate hour range
    if (hours < 0 || hours > 23) {
      errors.push({
        field: 'birthTime',
        message: 'Hours must be between 00-23',
        severity: 'error'
      });
    }

    // Validate minute range
    if (minutes < 0 || minutes > 59) {
      errors.push({
        field: 'birthTime',
        message: 'Minutes must be between 00-59',
        severity: 'error'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Location validation
  static validateBirthLocation(
    city: string,
    country: string,
    coordinates?: { latitude: number; longitude: number },
    timezone?: string
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // City validation
    if (!city || city.trim() === '') {
      errors.push({
        field: 'birthCity',
        message: 'Birth city is required',
        severity: 'error'
      });
    } else {
      // City format validation
      const cityRegex = /^[a-zA-Z\s\-'.]+$/;
      if (!cityRegex.test(city.trim())) {
        errors.push({
          field: 'birthCity',
          message: 'City name contains invalid characters',
          severity: 'error'
        });
      }

      // Length validation
      if (city.trim().length < 2) {
        errors.push({
          field: 'birthCity',
          message: 'City name must be at least 2 characters',
          severity: 'error'
        });
      }

      if (city.trim().length > 50) {
        warnings.push({
          field: 'birthCity',
          message: 'Very long city name - please verify',
          severity: 'warning'
        });
      }
    }

    // Country validation
    if (!country || country.trim() === '') {
      errors.push({
        field: 'birthCountry',
        message: 'Birth country is required',
        severity: 'error'
      });
    } else {
      // Country format validation
      const countryRegex = /^[a-zA-Z\s\-'.]+$/;
      if (!countryRegex.test(country.trim())) {
        errors.push({
          field: 'birthCountry',
          message: 'Country name contains invalid characters',
          severity: 'error'
        });
      }

      // Length validation
      if (country.trim().length < 2) {
        errors.push({
          field: 'birthCountry',
          message: 'Country name must be at least 2 characters',
          severity: 'error'
        });
      }
    }

    // Coordinates validation
    if (!coordinates || 
        typeof coordinates.latitude !== 'number' || 
        typeof coordinates.longitude !== 'number') {
      errors.push({
        field: 'coordinates',
        message: 'Please select a valid location from the search results',
        severity: 'error'
      });
    } else {
      // Latitude range validation
      if (coordinates.latitude < -90 || coordinates.latitude > 90) {
        errors.push({
          field: 'coordinates',
          message: 'Invalid latitude coordinates',
          severity: 'error'
        });
      }

      // Longitude range validation
      if (coordinates.longitude < -180 || coordinates.longitude > 180) {
        errors.push({
          field: 'coordinates',
          message: 'Invalid longitude coordinates',
          severity: 'error'
        });
      }

      // Precision warning for very precise coordinates
      const latPrecision = coordinates.latitude.toString().split('.')[1]?.length || 0;
      const lonPrecision = coordinates.longitude.toString().split('.')[1]?.length || 0;
      
      if (latPrecision > 6 || lonPrecision > 6) {
        warnings.push({
          field: 'coordinates',
          message: 'Very precise coordinates detected - this may indicate automated input',
          severity: 'warning'
        });
      }
    }

    // Timezone validation
    if (timezone && timezone !== 'UTC') {
      try {
        // Test if timezone is valid
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
      } catch (error: unknown) {
        warnings.push({
          field: 'timezone',
          message: 'Unusual timezone detected - please verify',
          severity: 'warning'
        });
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Input sanitization
  static sanitizeTextInput(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .slice(0, 100); // Limit length
  }

  // Comprehensive form validation
  static validateCompleteForm(formData: {
    birthDate?: string;
    birthTime?: string;
    birthCity?: string;
    birthCountry?: string;
    coordinates?: { latitude: number; longitude: number };
    birthTimezone?: string;
    unknownTime?: boolean;
  }): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];

    // Validate each field
    const dateResult = this.validateBirthDate(formData.birthDate || '');
    allErrors.push(...dateResult.errors);
    allWarnings.push(...dateResult.warnings);

    const timeResult = this.validateBirthTime(formData.birthTime || '', formData.unknownTime);
    allErrors.push(...timeResult.errors);
    allWarnings.push(...timeResult.warnings);

    const locationResult = this.validateBirthLocation(
      formData.birthCity || '',
      formData.birthCountry || '',
      formData.coordinates,
      formData.birthTimezone
    );
    allErrors.push(...locationResult.errors);
    allWarnings.push(...locationResult.warnings);

    // Cross-field validation
    if (formData.birthDate && formData.birthTime && !formData.unknownTime) {
      // Check for common invalid combinations
      const birthDateTime = new Date(`${formData.birthDate}T${formData.birthTime}`);
      const now = new Date();
      
      if (birthDateTime > now) {
        allErrors.push({
          field: 'birthDateTime',
          message: 'Birth date and time combination cannot be in the future',
          severity: 'error'
        });
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
}

// Network error handling utilities
export class NetworkErrorHandler {
  static handleApiError(error: any): string {
    if (!error) return 'An unknown error occurred';

    // Network connectivity errors
    if (error.message?.includes('Network request failed') || 
        error.message?.includes('fetch')) {
      return 'Please check your internet connection and try again';
    }

    // Timeout errors
    if (error.message?.includes('timeout') || error.code === 'TIMEOUT') {
      return 'Request timed out. Please try again';
    }

    // API rate limiting
    if (error.status === 429 || error.message?.includes('rate limit')) {
      return 'Too many requests. Please wait a moment and try again';
    }

    // Server errors
    if (error.status >= 500) {
      return 'Server error. Please try again later';
    }

    // Authentication errors
    if (error.status === 401 || error.status === 403) {
      return 'Authentication error. Please sign in again';
    }

    // Validation errors from API
    if (error.status === 400) {
      return error.message || 'Invalid data provided';
    }

    // Default error message
    return error.message || 'An unexpected error occurred. Please try again';
  }

  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry on validation errors or auth errors
        if (error.status === 400 || error.status === 401 || error.status === 403) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }

    throw lastError;
  }
}

// Security validation utilities
export class SecurityValidator {
  // Check for potential XSS attempts
  static validateTextSafety(text: string): boolean {
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    return !dangerousPatterns.some(pattern => pattern.test(text));
  }

  // Validate that coordinates are reasonable for birth locations
  static validateLocationSecurity(coordinates: { latitude: number; longitude: number }): boolean {
    const { latitude, longitude } = coordinates;

    // Check for obvious fake coordinates (0,0) or other suspicious values
    if (latitude === 0 && longitude === 0) return false;
    if (latitude === longitude) return false; // Suspicious symmetry
    
    // Check for coordinates in uninhabitable areas (oceans, poles)
    // North/South poles
    if (Math.abs(latitude) > 85) return false;
    
    // Some basic ocean checks (simplified)
    const pacificOcean = longitude > -180 && longitude < -60 && latitude > -60 && latitude < 60;
    const atlanticOcean = longitude > -60 && longitude < 20 && latitude > -60 && latitude < 60;
    
    // Allow if near populated coastlines
    return true; // For now, allow all reasonable coordinates
  }

  // Rate limiting check for form submissions
  static checkSubmissionRate(lastSubmission?: Date): boolean {
    if (!lastSubmission) return true;
    
    const timeSinceLastSubmission = Date.now() - lastSubmission.getTime();
    const minInterval = 5000; // 5 seconds minimum between submissions
    
    return timeSinceLastSubmission >= minInterval;
  }
} 