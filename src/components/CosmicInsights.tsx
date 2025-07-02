import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AstrologyService, DailyPrediction, CosmicSnapshot } from '../services/astrology.service';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

export interface CosmicInsightsProps {
  userSunSign?: string;
  showDailyHoroscope?: boolean;
  showCosmicSnapshot?: boolean;
  isCompact?: boolean;
}

const MOON_PHASES = {
  'New Moon': { emoji: '🌑', description: 'A time for new beginnings and setting intentions' },
  'Waxing Crescent': { emoji: '🌒', description: 'Focus on growth and building momentum' },
  'First Quarter': { emoji: '🌓', description: 'Take action and overcome challenges' },
  'Waxing Gibbous': { emoji: '🌔', description: 'Refine your plans and stay persistent' },
  'Full Moon': { emoji: '🌕', description: 'Peak energy for manifestation and release' },
  'Waning Gibbous': { emoji: '🌖', description: 'Time for gratitude and sharing wisdom' },
  'Last Quarter': { emoji: '🌗', description: 'Release what no longer serves you' },
  'Waning Crescent': { emoji: '🌘', description: 'Rest, reflect, and prepare for renewal' },
};

export const CosmicInsights: React.FC<CosmicInsightsProps> = ({
  userSunSign,
  showDailyHoroscope = true,
  showCosmicSnapshot = true,
  isCompact = false,
}) => {
  const [dailyHoroscope, setDailyHoroscope] = useState<DailyPrediction | null>(null);
  const [cosmicSnapshot, setCosmicSnapshot] = useState<CosmicSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);

  const astrologyService = AstrologyService.getInstance();

  useEffect(() => {
    loadCosmicData();
  }, [userSunSign]);

  useEffect(() => {
    if (dailyHoroscope || cosmicSnapshot) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [dailyHoroscope, cosmicSnapshot]);

  const loadCosmicData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Load daily horoscope if user has a sun sign
      if (showDailyHoroscope && userSunSign) {
        const horoscopeResult = await astrologyService.getDailyHoroscope(userSunSign);
        if (horoscopeResult.success && horoscopeResult.data) {
          setDailyHoroscope(horoscopeResult.data);
        }
      }

      // Load cosmic snapshot
      if (showCosmicSnapshot) {
        const snapshotResult = await astrologyService.getCosmicSnapshot();
        if (snapshotResult.success && snapshotResult.data) {
          setCosmicSnapshot(snapshotResult.data);
        }
      }

    } catch (err) {
      console.error('Error loading cosmic data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cosmic insights');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    astrologyService.clearCache();
    loadCosmicData(true);
  };

  const getMoonPhaseInfo = (phase: string) => {
    return MOON_PHASES[phase as keyof typeof MOON_PHASES] || {
      emoji: '🌙',
      description: 'The moon influences our emotions and intuition',
    };
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner visible={true} />
        <Text style={styles.loadingText}>Reading cosmic energies...</Text>
      </View>
    );
  }

  if (error && !dailyHoroscope && !cosmicSnapshot) {
    return (
      <View style={styles.errorContainer}>
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError(null)}
        />
        <Pressable style={styles.retryButton} onPress={() => loadCosmicData()}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (isCompact) {
    return (
      <View style={styles.compactContainer}>
        {dailyHoroscope && (
          <View style={styles.compactCard}>
            <Text style={styles.compactTitle}>Today's Energy</Text>
            <Text style={styles.compactText} numberOfLines={2}>
              {dailyHoroscope.prediction}
            </Text>
          </View>
        )}
        
        {cosmicSnapshot && (
          <View style={styles.compactCard}>
            <Text style={styles.compactTitle}>
              {getMoonPhaseInfo(cosmicSnapshot.moonPhase).emoji} Moon Phase
            </Text>
            <Text style={styles.compactText}>
              {cosmicSnapshot.moonPhase} in {cosmicSnapshot.moonSign}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#8B5CF6"
          colors={['#8B5CF6']}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cosmic Insights</Text>
        <Text style={styles.headerSubtitle}>
          Today's celestial guidance and cosmic influences
        </Text>
      </View>

      {/* Daily Horoscope */}
      {dailyHoroscope && (
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <View style={styles.horoscopeCard}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Ionicons name="star" size={24} color="#8B5CF6" />
                <Text style={styles.cardTitle}>Daily Horoscope</Text>
              </View>
              <Text style={styles.signBadge}>{dailyHoroscope.sign}</Text>
            </View>
            
            <Text style={styles.horoscopePrediction}>
              {dailyHoroscope.prediction}
            </Text>
            
            <View style={styles.horoscopeMetrics}>
              <View style={styles.metric}>
                <Ionicons name="diamond" size={16} color="#8B5CF6" />
                <Text style={styles.metricLabel}>Lucky Number</Text>
                <Text style={styles.metricValue}>{dailyHoroscope.luckyNumber}</Text>
              </View>
              
              <View style={styles.metric}>
                <View style={[styles.colorDot, { backgroundColor: dailyHoroscope.luckyColor.toLowerCase() }]} />
                <Text style={styles.metricLabel}>Lucky Color</Text>
                <Text style={styles.metricValue}>{dailyHoroscope.luckyColor}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}
      
      {/* Cosmic Snapshot */}
      {cosmicSnapshot && (
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <View style={styles.cosmicCard}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Ionicons name="planet" size={24} color="#8B5CF6" />
                <Text style={styles.cardTitle}>Cosmic Weather</Text>
              </View>
              <Text style={styles.dateBadge}>
                {new Date(cosmicSnapshot.date).toLocaleDateString()}
              </Text>
            </View>
            
            <Text style={styles.cosmicMessage}>
              {cosmicSnapshot.dailyMessage}
            </Text>
            
            {/* Moon Phase Section */}
            <View style={styles.moonSection}>
              <View style={styles.moonHeader}>
                <Text style={styles.moonEmoji}>{getMoonPhaseInfo(cosmicSnapshot.moonPhase).emoji}</Text>
                <View style={styles.moonInfo}>
                  <Text style={styles.moonPhase}>
                    {cosmicSnapshot.moonPhase} in {cosmicSnapshot.moonSign}
                  </Text>
                  <Text style={styles.moonDescription}>
                    {getMoonPhaseInfo(cosmicSnapshot.moonPhase).description}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Planetary Highlights */}
            {cosmicSnapshot.planetaryHighlights.length > 0 && (
              <View style={styles.highlightsSection}>
                <Text style={styles.highlightsTitle}>✨ Planetary Highlights</Text>
                {cosmicSnapshot.planetaryHighlights.map((highlight, index) => (
                  <View key={index} style={styles.highlight}>
                    <View style={styles.highlightDot} />
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      )}
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
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 16,
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  horoscopeCard: {
    backgroundColor: '#374151',
    padding: 20,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  cosmicCard: {
    backgroundColor: '#1E3A8A',
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  signBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dateBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  horoscopePrediction: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 20,
  },
  horoscopeMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cosmicMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  moonSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  moonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moonEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  moonInfo: {
    flex: 1,
  },
  moonPhase: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  moonDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
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
  highlightDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    marginRight: 12,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  // Compact view styles
  compactContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  compactCard: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  compactText: {
    fontSize: 12,
    color: '#E5E7EB',
    lineHeight: 16,
  },
}); 