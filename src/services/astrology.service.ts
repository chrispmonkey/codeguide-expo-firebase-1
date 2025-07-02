import { BirthInformation } from './profile.service';

// API Configuration
const ASTROLOGY_API_BASE_URL = 'https://api.vedicastroapi.com/v3-json';
const ASTROLOGY_API_USER_ID = process.env.ASTROLOGY_API_USER_ID || 'demo_user';
const ASTROLOGY_API_KEY = process.env.ASTROLOGY_API_KEY || 'demo_key';

// Astrological Data Interfaces
export interface PlanetPosition {
  name: string;
  fullDegree: number;
  normDegree: number;
  speed: number;
  isRetrograde: boolean;
  sign: string;
  signLord: string;
  nakshatra: string;
  house: number;
}

export interface HousePosition {
  house: number;
  sign: string;
  degree: number;
  signLord: string;
}

export interface AstrologicalChart {
  planets: PlanetPosition[];
  houses: HousePosition[];
  ascendant: {
    sign: string;
    degree: number;
  };
  midheaven: {
    sign: string;
    degree: number;
  };
}

export interface DailyPrediction {
  sign: string;
  prediction: string;
  luckyNumber: number;
  luckyColor: string;
  compatibility?: string[];
}

export interface CosmicSnapshot {
  date: string;
  moonPhase: string;
  moonSign: string;
  dailyMessage: string;
  planetaryHighlights: string[];
}

export interface AstrologyApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface ChartRequest {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * AstrologyService handles communication with external astrology APIs
 * to fetch birth chart data, daily predictions, and cosmic insights
 */
export class AstrologyService {
  private static instance: AstrologyService;
  private baseURL: string;
  private userId: string;
  private apiKey: string;
  private requestCache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.baseURL = ASTROLOGY_API_BASE_URL;
    this.userId = ASTROLOGY_API_USER_ID;
    this.apiKey = ASTROLOGY_API_KEY;
    this.requestCache = new Map();
  }

  public static getInstance(): AstrologyService {
    if (!AstrologyService.instance) {
      AstrologyService.instance = new AstrologyService();
    }
    return AstrologyService.instance;
  }

  /**
   * Make authenticated request to astrology API
   */
  private async makeRequest<T>(
    endpoint: string, 
    data: any = {}
  ): Promise<AstrologyApiResponse<T>> {
    try {
      // Check cache first
      const cacheKey = `${endpoint}_${JSON.stringify(data)}`;
      const cached = this.requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return {
          success: true,
          data: cached.data
        };
      }

      const requestBody = {
        ...data,
        api_key: this.apiKey,
        user_id: this.userId,
      };

      const response = await fetch(`${this.baseURL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `API request failed: ${response.status} ${response.statusText}`,
          status: response.status,
        };
      }

      const responseData = await response.json();

      // Cache successful responses
      this.requestCache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now()
      });

      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      console.error('Astrology API request failed:', error);
      return {
        success: false,
        error: `Network error: ${error}`,
      };
    }
  }

  /**
   * Convert birth information to API format
   */
  private formatBirthData(birthInfo: BirthInformation): ChartRequest {
    return {
      birthDate: birthInfo.birthDate,
      birthTime: birthInfo.birthTime,
      latitude: birthInfo.coordinates.latitude,
      longitude: birthInfo.coordinates.longitude,
      timezone: birthInfo.birthTimezone || 'UTC',
    };
  }

  /**
   * Parse birth date for API (day, month, year)
   */
  private parseBirthDate(birthDate: string) {
    const [year, month, day] = birthDate.split('-').map(Number);
    return { day, month, year };
  }

  /**
   * Parse birth time for API (hour, minute)
   */
  private parseBirthTime(birthTime: string) {
    const [hour, minute] = birthTime.split(':').map(Number);
    return { hour, minute };
  }

  /**
   * Get complete birth chart data
   */
  async getBirthChart(birthInfo: BirthInformation): Promise<AstrologyApiResponse<AstrologicalChart>> {
    try {
      const { day, month, year } = this.parseBirthDate(birthInfo.birthDate);
      const { hour, minute } = this.parseBirthTime(birthInfo.birthTime);

      const requestData = {
        day,
        month,
        year,
        hour,
        minute,
        latitude: birthInfo.coordinates.latitude,
        longitude: birthInfo.coordinates.longitude,
        timezone: this.getTimezoneOffset(birthInfo.birthTimezone || 'UTC'),
      };

      const response = await this.makeRequest<any>('birth_chart/birth_details', requestData);

      if (!response.success) {
        return response;
      }

      // Transform API response to our format
      const chart = this.transformChartData(response.data);
      
      return {
        success: true,
        data: chart,
      };
    } catch (error) {
      console.error('Error fetching birth chart:', error);
      return {
        success: false,
        error: `Failed to fetch birth chart: ${error}`,
      };
    }
  }

  /**
   * Get simplified astrological profile (Sun, Moon, Rising)
   */
  async getBasicProfile(birthInfo: BirthInformation): Promise<AstrologyApiResponse<{
    sun: { sign: string; degree: number; house: number };
    moon: { sign: string; degree: number; house: number };
    rising: { sign: string; degree: number };
  }>> {
    try {
      const chartResponse = await this.getBirthChart(birthInfo);
      
      if (!chartResponse.success || !chartResponse.data) {
        return {
          success: false,
          error: chartResponse.error || 'Failed to get chart data',
        };
      }

      const chart = chartResponse.data;
      const sun = chart.planets.find(p => p.name === 'Sun');
      const moon = chart.planets.find(p => p.name === 'Moon');
      const ascendant = chart.ascendant;

      if (!sun || !moon) {
        return {
          success: false,
          error: 'Essential planetary data not found',
        };
      }

      return {
        success: true,
        data: {
          sun: {
            sign: sun.sign,
            degree: sun.normDegree,
            house: sun.house,
          },
          moon: {
            sign: moon.sign,
            degree: moon.normDegree,
            house: moon.house,
          },
          rising: {
            sign: ascendant.sign,
            degree: ascendant.degree,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching basic profile:', error);
      return {
        success: false,
        error: `Failed to fetch basic profile: ${error}`,
      };
    }
  }

  /**
   * Get daily horoscope for a zodiac sign
   */
  async getDailyHoroscope(sign: string): Promise<AstrologyApiResponse<DailyPrediction>> {
    try {
      const response = await this.makeRequest<any>('horoscope/daily', {
        zodiac: sign.toLowerCase(),
      });

      if (!response.success) {
        return response;
      }

      return {
        success: true,
        data: {
          sign,
          prediction: response.data?.prediction || 'Cosmic energies are aligned for you today.',
          luckyNumber: response.data?.lucky_number || Math.floor(Math.random() * 100) + 1,
          luckyColor: response.data?.lucky_color || 'Purple',
        },
      };
    } catch (error) {
      console.error('Error fetching daily horoscope:', error);
      return {
        success: false,
        error: `Failed to fetch daily horoscope: ${error}`,
      };
    }
  }

  /**
   * Get current cosmic snapshot
   */
  async getCosmicSnapshot(): Promise<AstrologyApiResponse<CosmicSnapshot>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [year, month, day] = today.split('-').map(Number);

      const response = await this.makeRequest<any>('utilities/daily_snapshot', {
        day,
        month,
        year,
      });

      if (!response.success) {
        // Fallback cosmic snapshot
        return {
          success: true,
          data: {
            date: today,
            moonPhase: 'Waxing Crescent',
            moonSign: 'Pisces',
            dailyMessage: 'The universe encourages connection and authentic expression today.',
            planetaryHighlights: [
              'Mercury enhances communication',
              'Venus brings harmony to relationships',
              'Mars energizes creative pursuits'
            ],
          },
        };
      }

      return {
        success: true,
        data: {
          date: today,
          moonPhase: response.data?.moon_phase || 'Waxing Crescent',
          moonSign: response.data?.moon_sign || 'Pisces',
          dailyMessage: response.data?.daily_message || 'The stars align favorably for new connections.',
          planetaryHighlights: response.data?.planetary_highlights || [
            'Cosmic energies support meaningful encounters'
          ],
        },
      };
    } catch (error) {
      console.error('Error fetching cosmic snapshot:', error);
      return {
        success: false,
        error: `Failed to fetch cosmic snapshot: ${error}`,
      };
    }
  }

  /**
   * Calculate compatibility between two signs
   */
  async getCompatibility(sign1: string, sign2: string): Promise<AstrologyApiResponse<{
    compatibility: number;
    description: string;
    strengths: string[];
    challenges: string[];
  }>> {
    try {
      const response = await this.makeRequest<any>('match_making/basic_match', {
        sign1: sign1.toLowerCase(),
        sign2: sign2.toLowerCase(),
      });

      if (!response.success) {
        // Fallback compatibility calculation
        const score = this.calculateBasicCompatibility(sign1, sign2);
        return {
          success: true,
          data: {
            compatibility: score,
            description: this.getCompatibilityDescription(score),
            strengths: ['Shared cosmic understanding', 'Complementary energies'],
            challenges: ['Different communication styles', 'Varying life rhythms'],
          },
        };
      }

      return {
        success: true,
        data: {
          compatibility: response.data?.compatibility_score || 75,
          description: response.data?.description || 'A harmonious cosmic connection',
          strengths: response.data?.strengths || ['Natural understanding'],
          challenges: response.data?.challenges || ['Minor differences'],
        },
      };
    } catch (error) {
      console.error('Error calculating compatibility:', error);
      return {
        success: false,
        error: `Failed to calculate compatibility: ${error}`,
      };
    }
  }

  /**
   * Transform API chart data to our format
   */
  private transformChartData(apiData: any): AstrologicalChart {
    const planets: PlanetPosition[] = (apiData.planets || []).map((planet: any) => ({
      name: planet.name || '',
      fullDegree: planet.full_degree || 0,
      normDegree: planet.norm_degree || 0,
      speed: planet.speed || 0,
      isRetrograde: planet.is_retrograde || false,
      sign: planet.sign || '',
      signLord: planet.sign_lord || '',
      nakshatra: planet.nakshatra || '',
      house: planet.house || 1,
    }));

    const houses: HousePosition[] = (apiData.houses || []).map((house: any, index: number) => ({
      house: index + 1,
      sign: house.sign || '',
      degree: house.degree || 0,
      signLord: house.sign_lord || '',
    }));

    return {
      planets,
      houses,
      ascendant: {
        sign: apiData.ascendant?.sign || 'Aries',
        degree: apiData.ascendant?.degree || 0,
      },
      midheaven: {
        sign: apiData.midheaven?.sign || 'Capricorn',
        degree: apiData.midheaven?.degree || 0,
      },
    };
  }

  /**
   * Calculate basic compatibility fallback
   */
  private calculateBasicCompatibility(sign1: string, sign2: string): number {
    const elements = {
      'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
      'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
      'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
      'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water',
    };

    const element1 = elements[sign1 as keyof typeof elements];
    const element2 = elements[sign2 as keyof typeof elements];

    if (element1 === element2) return 85; // Same element
    if ((element1 === 'Fire' && element2 === 'Air') || (element1 === 'Air' && element2 === 'Fire')) return 80;
    if ((element1 === 'Earth' && element2 === 'Water') || (element1 === 'Water' && element2 === 'Earth')) return 78;
    return 65; // Challenging aspects
  }

  /**
   * Get compatibility description
   */
  private getCompatibilityDescription(score: number): string {
    if (score >= 85) return 'Exceptional cosmic harmony and deep understanding';
    if (score >= 75) return 'Strong connection with natural compatibility';
    if (score >= 65) return 'Good potential with effort and understanding';
    return 'Challenging but growth-oriented connection';
  }

  /**
   * Get timezone offset for API
   */
  private getTimezoneOffset(timezone: string): number {
    try {
      const now = new Date();
      const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
      const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
      return (targetTime.getTime() - utc.getTime()) / 3600000; // Convert to hours
    } catch {
      return 0; // Default to UTC
    }
  }

  /**
   * Clear request cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    this.requestCache.clear();
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<AstrologyApiResponse<boolean>> {
    try {
      const response = await this.makeRequest<any>('utilities/test_connection', {});
      return {
        success: response.success,
        data: response.success,
        error: response.error,
      };
    } catch (error) {
      return {
        success: false,
        error: `Connection test failed: ${error}`,
      };
    }
  }
} 