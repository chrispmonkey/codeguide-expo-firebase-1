import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AstrologyService, CosmicSnapshot } from '../services/astrology.service';
import { BirthInformation } from '../services/profile.service';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

const { width } = Dimensions.get('window');

// Zodiac sign data for display
const ZODIAC_INFO = {
  Aries: { symbol: '♈', element: 'Fire', colors: ['#FF6B6B', '#FF8E8E'] },
  Taurus: { symbol: '♉', element: 'Earth', colors: ['#4ECDC4', '#45B7B8'] },
  Gemini: { symbol: '♊', element: 'Air', colors: ['#45B7D1', '#96CEB4'] },
  Cancer: { symbol: '♋', element: 'Water', colors: ['#96CEB4', '#FFEAA7'] },
  Leo: { symbol: '♌', element: 'Fire', colors: ['#FFEAA7', '#DDA0DD'] },
  Virgo: { symbol: '♍', element: 'Earth', colors: ['#DDA0DD', '#98D8C8'] },
  Libra: { symbol: '♎', element: 'Air', colors: ['#F7DC6F', '#BB8FCE'] },
  Scorpio: { symbol: '♏', element: 'Water', colors: ['#943126', '#B03A2E'] },
  Sagittarius: { symbol: '♐', element: 'Fire', colors: ['#D2691E', '#FF8C00'] },
  Capricorn: { symbol: '♑', element: 'Earth', colors: ['#2F4F4F', '#708090'] },
  Aquarius: { symbol: '♒', element: 'Air', colors: ['#4169E1', '#87CEEB'] },
  Pisces: { symbol: '♓', element: 'Water', colors: ['#9370DB', '#DA70D6'] },
};

export interface AstrologicalProfileProps {
  birthInformation: BirthInformation;
  onProfileReady?: (profile: any) => void;
  showCosmicSnapshot?: boolean;
  isCompact?: boolean;
}

interface AstrologicalData {
  sun: { sign: string; degree: number; house: number };
  moon: { sign: string; degree: number; house: number };
  rising: { sign: string; degree: number };
}

export const AstrologicalProfile: React.FC<AstrologicalProfileProps> = ({
  birthInformation,
  onProfileReady,
  showCosmicSnapshot = true,
  isCompact = false,
}) => {
  const [astrologicalData, setAstrologicalData] = useState<AstrologicalData | null>(null);
  const [cosmicSnapshot, setCosmicSnapshot] = useState<CosmicSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSign, setSelectedSign] = useState<'sun' | 'moon' | 'rising'>('sun');
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  const astrologyService = AstrologyService.getInstance();

  useEffect(() => {
    loadAstrologicalData();
  }, [birthInformation]);

  useEffect(() => {
    if (astrologicalData || cosmicSnapshot) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [astrologicalData, cosmicSnapshot]);

  const loadAstrologicalData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load basic astrological profile
      const profileResult = await astrologyService.getBasicProfile(birthInformation);
      if (!profileResult.success) {
        throw new Error(profileResult.error || 'Failed to load astrological profile');
      }

      setAstrologicalData(profileResult.data!);

      // Load cosmic snapshot if requested
      if (showCosmicSnapshot) {
        const snapshotResult = await astrologyService.getCosmicSnapshot();
        if (snapshotResult.success) {
          setCosmicSnapshot(snapshotResult.data!);
        }
      }

      // Notify parent component
      if (onProfileReady && profileResult.data) {
        onProfileReady(profileResult.data);
      }

    } catch (err) {
      console.error('Error loading astrological data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load astrological data');
    } finally {
      setIsLoading(false);
    }
  };

  const getZodiacInfo = (sign: string) => {
    return ZODIAC_INFO[sign as keyof typeof ZODIAC_INFO] || {
      symbol: '⭐',
      element: 'Unknown',
      colors: ['#8B5CF6', '#A78BFA']
    };
  };

  const formatDegree = (degree: number): string => {
    return `${Math.floor(degree)}°${Math.floor((degree % 1) * 60)}'`;
  };

  const getSignDescription = (type: 'sun' | 'moon' | 'rising', sign: string): string => {
    const descriptions = {
      sun: {
        Aries: 'Bold, pioneering, and energetic. You lead with confidence and courage.',
        Taurus: 'Stable, reliable, and grounded. You appreciate beauty and comfort.',
        Gemini: 'Curious, communicative, and adaptable. You thrive on variety and learning.',
        Cancer: 'Nurturing, intuitive, and protective. You value home and emotional security.',
        Leo: 'Creative, confident, and generous. You naturally shine and inspire others.',
        Virgo: 'Practical, analytical, and helpful. You excel at improving and perfecting.',
        Libra: 'Harmonious, diplomatic, and charming. You seek balance and beautiful partnerships.',
        Scorpio: 'Intense, transformative, and mysterious. You dive deep into life\'s mysteries.',
        Sagittarius: 'Adventurous, philosophical, and optimistic. You seek truth and expansion.',
        Capricorn: 'Ambitious, disciplined, and responsible. You build lasting structures.',
        Aquarius: 'Innovative, independent, and humanitarian. You envision a better future.',
        Pisces: 'Compassionate, intuitive, and artistic. You connect with the universal flow.',
      },
      moon: {
        Aries: 'Your emotions are intense and direct. You need freedom and quick action.',
        Taurus: 'You find emotional security in stability and sensual pleasures.',
        Gemini: 'Your feelings change quickly. You need variety and mental stimulation.',
        Cancer: 'Deeply emotional and nurturing. Home and family are your emotional anchors.',
        Leo: 'You need recognition and appreciation. Your emotions are warm and generous.',
        Virgo: 'You process emotions analytically. You find comfort in routine and helping.',
        Libra: 'You need harmony and beauty. Relationships are key to your emotional well-being.',
        Scorpio: 'Your emotions run deep and intense. You need transformation and truth.',
        Sagittarius: 'You need freedom and adventure. Your emotions are optimistic and expansive.',
        Capricorn: 'You need structure and achievement. Emotions are controlled and practical.',
        Aquarius: 'You need independence and innovation. Your emotions are unique and detached.',
        Pisces: 'Deeply sensitive and empathetic. You absorb others\' emotions easily.',
      },
      rising: {
        Aries: 'You appear energetic, direct, and pioneering. Others see you as a natural leader.',
        Taurus: 'You appear calm, reliable, and grounded. Others see you as stable and trustworthy.',
        Gemini: 'You appear curious, talkative, and adaptable. Others see you as intelligent and witty.',
        Cancer: 'You appear nurturing, sensitive, and protective. Others see you as caring and intuitive.',
        Leo: 'You appear confident, creative, and warm. Others see you as charismatic and generous.',
        Virgo: 'You appear organized, helpful, and analytical. Others see you as practical and reliable.',
        Libra: 'You appear charming, diplomatic, and balanced. Others see you as harmonious and fair.',
        Scorpio: 'You appear intense, mysterious, and powerful. Others see you as magnetic and deep.',
        Sagittarius: 'You appear optimistic, adventurous, and wise. Others see you as inspiring and free.',
        Capricorn: 'You appear serious, responsible, and ambitious. Others see you as capable and mature.',
        Aquarius: 'You appear unique, innovative, and independent. Others see you as progressive and friendly.',
        Pisces: 'You appear gentle, compassionate, and dreamy. Others see you as spiritual and artistic.',
      },
    };

    return descriptions[type][sign as keyof typeof descriptions[type]] || 
           'A unique cosmic influence shapes this aspect of your personality.';
  };

  const renderSignCard = (
    type: 'sun' | 'moon' | 'rising',
    data: { sign: string; degree: number; house?: number },
    title: string,
    subtitle: string
  ) => {
    const zodiacInfo = getZodiacInfo(data.sign);
    const isSelected = selectedSign === type;

    return (
      <Pressable
        style={[styles.signCard, isSelected && styles.signCardSelected]}
        onPress={() => setSelectedSign(type)}
      >
        <LinearGradient
          colors={zodiacInfo.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.signGradient}
        >
          <View style={styles.signHeader}>
            <Text style={styles.signSymbol}>{zodiacInfo.symbol}</Text>
            <View style={styles.signInfo}>
              <Text style={styles.signTitle}>{title}</Text>
              <Text style={styles.signSubtitle}>{subtitle}</Text>
            </View>
          </View>
          
          <View style={styles.signDetails}>
            <Text style={styles.signName}>{data.sign}</Text>
            <Text style={styles.signDegree}>{formatDegree(data.degree)}</Text>
            {data.house && <Text style={styles.signHouse}>House {data.house}</Text>}
          </View>
          
          <View style={styles.signElement}>
            <Text style={styles.elementText}>{zodiacInfo.element}</Text>
          </View>
        </LinearGradient>
      </Pressable>
    );
  };

  const renderSelectedSignDetails = () => {
    if (!astrologicalData) return null;

    const selectedData = astrologicalData[selectedSign];
    const zodiacInfo = getZodiacInfo(selectedData.sign);
    const description = getSignDescription(selectedSign, selectedData.sign);

    return (
      <Animated.View
        style={[
          styles.signDetailsCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[...zodiacInfo.colors, zodiacInfo.colors[0]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.detailsGradient}
        >
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsSymbol}>{zodiacInfo.symbol}</Text>
            <View>
              <Text style={styles.detailsSign}>{selectedData.sign}</Text>
              <Text style={styles.detailsType}>
                {selectedSign === 'sun' ? 'Your Core Self' : 
                 selectedSign === 'moon' ? 'Your Inner World' : 
                 'How Others See You'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.detailsDescription}>{description}</Text>
          
          <View style={styles.detailsMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{formatDegree(selectedData.degree)}</Text>
              <Text style={styles.metricLabel}>Degree</Text>
            </View>
            {selectedData.house && (
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{selectedData.house}</Text>
                <Text style={styles.metricLabel}>House</Text>
              </View>
            )}
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{zodiacInfo.element}</Text>
              <Text style={styles.metricLabel}>Element</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderCosmicSnapshot = () => {
    if (!cosmicSnapshot || !showCosmicSnapshot) return null;

    return (
      <Animated.View
        style={[
          styles.cosmicCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cosmicGradient}
        >
          <View style={styles.cosmicHeader}>
            <Ionicons name="planet" size={24} color="#FFFFFF" />
            <Text style={styles.cosmicTitle}>Today's Cosmic Weather</Text>
          </View>
          
          <Text style={styles.cosmicMessage}>{cosmicSnapshot.dailyMessage}</Text>
          
          <View style={styles.cosmicDetails}>
            <View style={styles.cosmicItem}>
              <Ionicons name="moon" size={16} color="#E0E0E0" />
              <Text style={styles.cosmicText}>
                {cosmicSnapshot.moonPhase} in {cosmicSnapshot.moonSign}
              </Text>
            </View>
          </View>
          
          {cosmicSnapshot.planetaryHighlights.length > 0 && (
            <View style={styles.highlightsSection}>
              <Text style={styles.highlightsTitle}>Planetary Highlights</Text>
              {cosmicSnapshot.planetaryHighlights.slice(0, 3).map((highlight, index) => (
                <View key={index} style={styles.highlight}>
                  <Text style={styles.highlightBullet}>✦</Text>
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner visible={true} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError(null)}
        />
        <Pressable style={styles.retryButton} onPress={loadAstrologicalData}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (!astrologicalData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.noDataText}>No astrological data available</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Astrological Profile</Text>
        <Text style={styles.headerSubtitle}>
          Discover the cosmic influences that shape your unique personality
        </Text>
      </View>

      {/* Main Signs Grid */}
      <View style={styles.signsGrid}>
        {renderSignCard(
          'sun',
          astrologicalData.sun,
          'Sun Sign',
          'Your Core Self'
        )}
        {renderSignCard(
          'moon',
          astrologicalData.moon,
          'Moon Sign',
          'Your Inner World'
        )}
        {renderSignCard(
          'rising',
          astrologicalData.rising,
          'Rising Sign',
          'Your Outer Expression'
        )}
      </View>

      {/* Selected Sign Details */}
      {renderSelectedSignDetails()}

      {/* Cosmic Snapshot */}
      {renderCosmicSnapshot()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 20,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  signsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  signCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  signCardSelected: {
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  signGradient: {
    padding: 20,
  },
  signHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  signSymbol: {
    fontSize: 32,
    color: '#FFFFFF',
    marginRight: 16,
  },
  signInfo: {
    flex: 1,
  },
  signTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  signSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  signDetails: {
    marginBottom: 12,
  },
  signName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  signDegree: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  signHouse: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  signElement: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  elementText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signDetailsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  detailsGradient: {
    padding: 24,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsSymbol: {
    fontSize: 40,
    color: '#FFFFFF',
    marginRight: 16,
  },
  detailsSign: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  detailsType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  detailsDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 20,
  },
  detailsMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  cosmicCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cosmicGradient: {
    padding: 24,
  },
  cosmicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cosmicTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  cosmicMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  cosmicDetails: {
    marginBottom: 20,
  },
  cosmicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cosmicText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 8,
  },
  highlightsSection: {
    marginTop: 8,
  },
  highlightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  highlightBullet: {
    fontSize: 12,
    color: '#FFFFFF',
    marginRight: 8,
    marginTop: 2,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
}); 