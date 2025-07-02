import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BirthFormData } from './BirthInformationForm';

// Mock location data - replace with real API in production
interface LocationSuggestion {
  id: string;
  name: string;
  country: string;
  region?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
}

// Mock location service - replace with real geocoding API
const MOCK_LOCATIONS: LocationSuggestion[] = [
  {
    id: '1',
    name: 'New York',
    country: 'United States',
    region: 'New York',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
    timezone: 'America/New_York',
  },
  {
    id: '2',
    name: 'Los Angeles',
    country: 'United States',
    region: 'California',
    coordinates: { latitude: 34.0522, longitude: -118.2437 },
    timezone: 'America/Los_Angeles',
  },
  {
    id: '3',
    name: 'London',
    country: 'United Kingdom',
    region: 'England',
    coordinates: { latitude: 51.5074, longitude: -0.1278 },
    timezone: 'Europe/London',
  },
  {
    id: '4',
    name: 'Paris',
    country: 'France',
    region: 'Île-de-France',
    coordinates: { latitude: 48.8566, longitude: 2.3522 },
    timezone: 'Europe/Paris',
  },
  {
    id: '5',
    name: 'Tokyo',
    country: 'Japan',
    region: 'Kantō',
    coordinates: { latitude: 35.6762, longitude: 139.6503 },
    timezone: 'Asia/Tokyo',
  },
  {
    id: '6',
    name: 'Sydney',
    country: 'Australia',
    region: 'New South Wales',
    coordinates: { latitude: -33.8688, longitude: 151.2093 },
    timezone: 'Australia/Sydney',
  },
  {
    id: '7',
    name: 'Toronto',
    country: 'Canada',
    region: 'Ontario',
    coordinates: { latitude: 43.6532, longitude: -79.3832 },
    timezone: 'America/Toronto',
  },
  {
    id: '8',
    name: 'Berlin',
    country: 'Germany',
    region: 'Berlin',
    coordinates: { latitude: 52.5200, longitude: 13.4050 },
    timezone: 'Europe/Berlin',
  },
];

export interface BirthLocationStepProps {
  formData: BirthFormData;
  updateFormData: (updates: Partial<BirthFormData>) => void;
  validationErrors: string[];
  isValidating: boolean;
}

export const BirthLocationStep: React.FC<BirthLocationStepProps> = ({
  formData,
  updateFormData,
  validationErrors,
  isValidating,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  // Mock search function - replace with real geocoding API
  const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!query.trim()) return [];
    
    return MOCK_LOCATIONS.filter(location =>
      location.name.toLowerCase().includes(query.toLowerCase()) ||
      location.country.toLowerCase().includes(query.toLowerCase()) ||
      location.region?.toLowerCase().includes(query.toLowerCase())
    );
  };

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchLocations(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Location search error:', error);
        Alert.alert('Search Error', 'Unable to search locations. Please try again.');
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLocationSelect = (location: LocationSuggestion) => {
    const displayName = `${location.name}, ${location.country}`;
    setSearchQuery(displayName);
    setShowSuggestions(false);
    Keyboard.dismiss();
    
    updateFormData({
      birthCity: location.name,
      birthCountry: location.country,
      birthTimezone: location.timezone,
      coordinates: location.coordinates,
    });
  };

  const handleSearchFocus = () => {
    setShowSuggestions(suggestions.length > 0 && searchQuery.length >= 2);
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow selection
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    updateFormData({ 
      birthCity: undefined, 
      birthCountry: undefined, 
      birthTimezone: undefined,
      coordinates: undefined 
    });
    searchInputRef.current?.focus();
  };

  const hasErrors = validationErrors.length > 0;
  const hasSelectedLocation = formData.birthCity && formData.birthCountry;

  const renderLocationItem = ({ item }: { item: LocationSuggestion }) => (
    <Pressable
      style={styles.suggestionItem}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.suggestionContent}>
        <View style={styles.suggestionHeader}>
          <Ionicons name="location" size={16} color="#8B5CF6" />
          <Text style={styles.suggestionName}>{item.name}</Text>
        </View>
        <Text style={styles.suggestionDetails}>
          {item.region && `${item.region}, `}{item.country}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </Pressable>
  );

  // Initialize search query with existing location
  useEffect(() => {
    if (formData.birthCity && formData.birthCountry && !searchQuery) {
      setSearchQuery(`${formData.birthCity}, ${formData.birthCountry}`);
    }
  }, [formData.birthCity, formData.birthCountry, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="earth" size={32} color="#8B5CF6" />
        </View>
        <Text style={styles.title}>Where were you born?</Text>
        <Text style={styles.subtitle}>
          Your birth location determines the local planetary positions and timezone for accurate calculations
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionLabel}>Birth Location</Text>
        
        <View style={[
          styles.searchContainer,
          hasErrors && styles.searchContainerError,
          isValidating && styles.searchContainerValidating,
        ]}>
          <Ionicons 
            name="search" 
            size={20} 
            color={hasErrors ? "#EF4444" : "#9CA3AF"} 
            style={styles.searchIcon}
          />
          
          <TextInput
            ref={searchInputRef}
            style={[
              styles.searchInput,
              hasErrors && styles.searchInputError,
            ]}
            placeholder="Search for your birth city..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            autoCapitalize="words"
            autoComplete="off"
            autoCorrect={false}
          />

          {isSearching && (
            <ActivityIndicator 
              size="small" 
              color="#8B5CF6" 
              style={styles.searchSpinner}
            />
          )}

          {searchQuery.length > 0 && !isSearching && (
            <Pressable onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.id}
              renderItem={renderLocationItem}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* No Results Message */}
        {showSuggestions && suggestions.length === 0 && !isSearching && searchQuery.length >= 2 && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              No locations found for "{searchQuery}". Try a different search term.
            </Text>
          </View>
        )}
      </View>

      {/* Selected Location Display */}
      {hasSelectedLocation && (
        <View style={styles.selectedLocationSection}>
          <View style={styles.selectedLocationCard}>
            <View style={styles.selectedLocationHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.selectedLocationTitle}>Selected Location</Text>
            </View>
            
            <View style={styles.selectedLocationContent}>
              <Text style={styles.selectedLocationName}>{formData.birthCity}, {formData.birthCountry}</Text>
              <Text style={styles.selectedLocationCoords}>
                📍 {formData.coordinates?.latitude.toFixed(4)}, {formData.coordinates?.longitude.toFixed(4)}
              </Text>
              <Text style={styles.selectedLocationTimezone}>
                🕒 {formData.birthTimezone}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Educational Content */}
      <View style={styles.educationalSection}>
        <View style={styles.educationalCard}>
          <View style={styles.educationalHeader}>
            <Ionicons name="information-circle" size={20} color="#8B5CF6" />
            <Text style={styles.educationalTitle}>Why Location Matters</Text>
          </View>
          
          <View style={styles.educationalContent}>
            <View style={styles.educationalItem}>
              <Text style={styles.educationalBullet}>🌍</Text>
              <Text style={styles.educationalText}>
                Determines the <Text style={styles.highlight}>local sky view</Text> at your birth time
              </Text>
            </View>
            
            <View style={styles.educationalItem}>
              <Text style={styles.educationalBullet}>🕒</Text>
              <Text style={styles.educationalText}>
                Adjusts for your <Text style={styles.highlight}>timezone</Text> and daylight saving time
              </Text>
            </View>
            
            <View style={styles.educationalItem}>
              <Text style={styles.educationalBullet}>🏠</Text>
              <Text style={styles.educationalText}>
                Calculates accurate <Text style={styles.highlight}>house cusps</Text> and angles
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search Tips */}
      {!hasSelectedLocation && searchQuery.length === 0 && (
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Search Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipText}>• Try searching by city name (e.g., "New York")</Text>
            <Text style={styles.tipText}>• Include state or country if needed</Text>
            <Text style={styles.tipText}>• Use your nearest major city if your exact birthplace isn't listed</Text>
            <Text style={styles.tipText}>• Even a nearby location will give accurate results</Text>
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
  searchSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4B5563',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  searchContainerValidating: {
    opacity: 0.8,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    padding: 0,
  },
  searchInputError: {
    color: '#DC2626',
  },
  searchSpinner: {
    marginLeft: 8,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: '#374151',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4B5563',
    maxHeight: 240,
    overflow: 'hidden',
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  suggestionDetails: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 24,
  },
  noResultsContainer: {
    padding: 16,
    backgroundColor: '#374151',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  noResultsText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  selectedLocationSection: {
    marginBottom: 24,
  },
  selectedLocationCard: {
    backgroundColor: '#065F46',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  selectedLocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D1FAE5',
    marginLeft: 8,
  },
  selectedLocationContent: {
    gap: 6,
  },
  selectedLocationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  selectedLocationCoords: {
    fontSize: 14,
    color: '#A7F3D0',
    fontFamily: 'monospace',
  },
  selectedLocationTimezone: {
    fontSize: 14,
    color: '#A7F3D0',
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