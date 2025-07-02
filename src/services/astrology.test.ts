import { AstrologyService, AstrologicalChart, DailyPrediction, CosmicSnapshot } from './astrology.service';
import { BirthInformation } from './profile.service';

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Test birth information
const testBirthInfo: BirthInformation = {
  birthDate: '1990-05-15',
  birthTime: '14:30',
  birthCity: 'New York',
  birthCountry: 'United States',
  birthTimezone: 'America/New_York',
  coordinates: {
    latitude: 40.7128,
    longitude: -74.0060,
  },
};

// Mock API responses
const mockChartResponse = {
  planets: [
    {
      name: 'Sun',
      full_degree: 54.5,
      norm_degree: 24.5,
      speed: 1.0,
      is_retrograde: false,
      sign: 'Taurus',
      sign_lord: 'Venus',
      nakshatra: 'Mrigashirsha',
      house: 1,
    },
    {
      name: 'Moon',
      full_degree: 156.3,
      norm_degree: 6.3,
      speed: 13.2,
      is_retrograde: false,
      sign: 'Virgo',
      sign_lord: 'Mercury',
      nakshatra: 'Hasta',
      house: 5,
    },
  ],
  houses: [
    { sign: 'Taurus', degree: 10.5, sign_lord: 'Venus' },
    { sign: 'Gemini', degree: 15.2, sign_lord: 'Mercury' },
  ],
  ascendant: {
    sign: 'Taurus',
    degree: 10.5,
  },
  midheaven: {
    sign: 'Capricorn',
    degree: 25.8,
  },
};

const mockHoroscopeResponse = {
  prediction: 'Today brings wonderful opportunities for growth and connection.',
  lucky_number: 7,
  lucky_color: 'Blue',
};

const mockSnapshotResponse = {
  moon_phase: 'Full Moon',
  moon_sign: 'Scorpio',
  daily_message: 'Intense emotions bring transformation and healing.',
  planetary_highlights: [
    'Jupiter expands consciousness',
    'Saturn teaches important lessons',
    'Venus enhances relationships',
  ],
};

describe('AstrologyService', () => {
  let astrologyService: AstrologyService;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    astrologyService = AstrologyService.getInstance();
    astrologyService.clearCache();
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AstrologyService.getInstance();
      const instance2 = AstrologyService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getBirthChart', () => {
    it('should successfully fetch birth chart data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChartResponse,
      } as Response);

      const result = await astrologyService.getBirthChart(testBirthInfo);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.planets).toHaveLength(2);
      expect(result.data?.planets[0].name).toBe('Sun');
      expect(result.data?.planets[0].sign).toBe('Taurus');
      expect(result.data?.ascendant.sign).toBe('Taurus');
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      } as Response);

      const result = await astrologyService.getBirthChart(testBirthInfo);

      expect(result.success).toBe(false);
      expect(result.error).toContain('API request failed: 400');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await astrologyService.getBirthChart(testBirthInfo);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should cache successful responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChartResponse,
      } as Response);

      // First request
      await astrologyService.getBirthChart(testBirthInfo);
      
      // Second request should use cache
      const result = await astrologyService.getBirthChart(testBirthInfo);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
    });
  });

  describe('getBasicProfile', () => {
    it('should extract Sun, Moon, and Rising signs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChartResponse,
      } as Response);

      const result = await astrologyService.getBasicProfile(testBirthInfo);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        sun: {
          sign: 'Taurus',
          degree: 24.5,
          house: 1,
        },
        moon: {
          sign: 'Virgo',
          degree: 6.3,
          house: 5,
        },
        rising: {
          sign: 'Taurus',
          degree: 10.5,
        },
      });
    });

    it('should handle missing planetary data', async () => {
      const incompleteResponse = {
        planets: [{ name: 'Sun', sign: 'Taurus' }], // Missing Moon
        ascendant: { sign: 'Taurus', degree: 10.5 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => incompleteResponse,
      } as Response);

      const result = await astrologyService.getBasicProfile(testBirthInfo);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Essential planetary data not found');
    });
  });

  describe('getDailyHoroscope', () => {
    it('should fetch daily horoscope for a sign', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHoroscopeResponse,
      } as Response);

      const result = await astrologyService.getDailyHoroscope('Taurus');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        sign: 'Taurus',
        prediction: 'Today brings wonderful opportunities for growth and connection.',
        luckyNumber: 7,
        luckyColor: 'Blue',
      });
    });

    it('should provide fallback data on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const result = await astrologyService.getDailyHoroscope('Gemini');

      expect(result.success).toBe(false);
      expect(result.error).toContain('API request failed');
    });
  });

  describe('getCosmicSnapshot', () => {
    it('should fetch current cosmic snapshot', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSnapshotResponse,
      } as Response);

      const result = await astrologyService.getCosmicSnapshot();

      expect(result.success).toBe(true);
      expect(result.data?.moonPhase).toBe('Full Moon');
      expect(result.data?.moonSign).toBe('Scorpio');
      expect(result.data?.planetaryHighlights).toHaveLength(3);
    });

    it('should provide fallback cosmic snapshot on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const result = await astrologyService.getCosmicSnapshot();

      expect(result.success).toBe(true); // Should fallback gracefully
      expect(result.data?.moonPhase).toBe('Waxing Crescent');
      expect(result.data?.dailyMessage).toContain('universe encourages connection');
    });
  });

  describe('getCompatibility', () => {
    it('should calculate compatibility between signs', async () => {
      const mockCompatibilityResponse = {
        compatibility_score: 85,
        description: 'Excellent cosmic harmony',
        strengths: ['Deep understanding', 'Shared values'],
        challenges: ['Different approaches to goals'],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCompatibilityResponse,
      } as Response);

      const result = await astrologyService.getCompatibility('Taurus', 'Virgo');

      expect(result.success).toBe(true);
      expect(result.data?.compatibility).toBe(85);
      expect(result.data?.description).toBe('Excellent cosmic harmony');
      expect(result.data?.strengths).toContain('Deep understanding');
    });

    it('should use fallback compatibility calculation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      } as Response);

      const result = await astrologyService.getCompatibility('Taurus', 'Virgo');

      expect(result.success).toBe(true); // Should fallback
      expect(result.data?.compatibility).toBeGreaterThan(0);
      expect(result.data?.description).toBeDefined();
    });

    it('should calculate higher compatibility for same element signs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      } as Response);

      // Fire signs should have high compatibility
      const result = await astrologyService.getCompatibility('Aries', 'Leo');

      expect(result.success).toBe(true);
      expect(result.data?.compatibility).toBe(85); // Same element
    });

    it('should calculate moderate compatibility for complementary elements', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      } as Response);

      // Fire and Air should have good compatibility
      const result = await astrologyService.getCompatibility('Aries', 'Gemini');

      expect(result.success).toBe(true);
      expect(result.data?.compatibility).toBe(80); // Fire + Air
    });
  });

  describe('Cache Management', () => {
    it('should clear cache when requested', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChartResponse,
      } as Response);

      // Make first request
      await astrologyService.getBirthChart(testBirthInfo);
      
      // Clear cache
      astrologyService.clearCache();
      
      // Make second request - should hit API again
      await astrologyService.getBirthChart(testBirthInfo);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Data Transformation', () => {
    it('should properly transform API data to internal format', async () => {
      const complexApiResponse = {
        planets: [
          {
            name: 'Sun',
            full_degree: 54.5,
            norm_degree: 24.5,
            speed: 1.0,
            is_retrograde: false,
            sign: 'Taurus',
            sign_lord: 'Venus',
            nakshatra: 'Mrigashirsha',
            house: 1,
          },
        ],
        houses: [
          { sign: 'Taurus', degree: 10.5, sign_lord: 'Venus' },
          { sign: 'Gemini', degree: 15.2, sign_lord: 'Mercury' },
        ],
        ascendant: { sign: 'Taurus', degree: 10.5 },
        midheaven: { sign: 'Capricorn', degree: 25.8 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => complexApiResponse,
      } as Response);

      const result = await astrologyService.getBirthChart(testBirthInfo);

      expect(result.success).toBe(true);
      expect(result.data?.planets[0]).toEqual({
        name: 'Sun',
        fullDegree: 54.5,
        normDegree: 24.5,
        speed: 1.0,
        isRetrograde: false,
        sign: 'Taurus',
        signLord: 'Venus',
        nakshatra: 'Mrigashirsha',
        house: 1,
      });
      expect(result.data?.houses).toHaveLength(2);
      expect(result.data?.ascendant.sign).toBe('Taurus');
      expect(result.data?.midheaven.sign).toBe('Capricorn');
    });

    it('should handle missing optional fields in API response', async () => {
      const minimalApiResponse = {
        planets: [{ name: 'Sun' }], // Missing most fields
        houses: [{}], // Empty house
        ascendant: {}, // Missing fields
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => minimalApiResponse,
      } as Response);

      const result = await astrologyService.getBirthChart(testBirthInfo);

      expect(result.success).toBe(true);
      expect(result.data?.planets[0].name).toBe('Sun');
      expect(result.data?.planets[0].fullDegree).toBe(0); // Default value
      expect(result.data?.ascendant.sign).toBe('Aries'); // Fallback value
    });
  });

  describe('Connection Testing', () => {
    it('should test API connectivity', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      } as Response);

      const result = await astrologyService.testConnection();

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('should handle connection test failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await astrologyService.testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection test failed');
    });
  });

  describe('Date and Time Parsing', () => {
    it('should correctly parse birth date and time', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChartResponse,
      } as Response);

      await astrologyService.getBirthChart(testBirthInfo);

      // Verify the API was called with correct parsed date/time
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(requestBody.day).toBe(15);
      expect(requestBody.month).toBe(5);
      expect(requestBody.year).toBe(1990);
      expect(requestBody.hour).toBe(14);
      expect(requestBody.minute).toBe(30);
      expect(requestBody.latitude).toBe(40.7128);
      expect(requestBody.longitude).toBe(-74.0060);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON responses', async () => {
             mockFetch.mockResolvedValueOnce({
         ok: true,
         json: async () => {
           throw new Error('Invalid JSON');
         },
       } as unknown as Response);

      const result = await astrologyService.getBirthChart(testBirthInfo);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });

    it('should handle network timeouts', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'));

      const result = await astrologyService.getCosmicSnapshot();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Request timeout');
    });
  });
});

// Integration test helper for manual testing
export const testAstrologyIntegration = async (): Promise<void> => {
  console.log('🔮 Testing Astrology Service Integration...');
  
  const astrologyService = AstrologyService.getInstance();
  
  try {
    // Test connection
    console.log('Testing API connection...');
    const connectionTest = await astrologyService.testConnection();
    console.log('Connection test:', connectionTest);
    
    // Test basic profile
    console.log('Testing basic profile...');
    const profileResult = await astrologyService.getBasicProfile(testBirthInfo);
    console.log('Basic profile:', profileResult);
    
    // Test daily horoscope
    console.log('Testing daily horoscope...');
    const horoscopeResult = await astrologyService.getDailyHoroscope('Taurus');
    console.log('Daily horoscope:', horoscopeResult);
    
    // Test cosmic snapshot
    console.log('Testing cosmic snapshot...');
    const snapshotResult = await astrologyService.getCosmicSnapshot();
    console.log('Cosmic snapshot:', snapshotResult);
    
    // Test compatibility
    console.log('Testing compatibility...');
    const compatibilityResult = await astrologyService.getCompatibility('Taurus', 'Virgo');
    console.log('Compatibility:', compatibilityResult);
    
    console.log('✅ Astrology service integration test completed');
  } catch (error) {
    console.error('❌ Astrology service integration test failed:', error);
  }
}; 