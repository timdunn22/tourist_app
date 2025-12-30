import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { Card, Badge, TrustScore, Rating, SectionHeader, Avatar } from '../../components/ui';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import { useExperienceStore } from '../../store/experienceStore';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const categories = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'culture', label: 'Culture', icon: '🏛️' },
  { id: 'food', label: 'Food', icon: '🍜' },
  { id: 'adventure', label: 'Adventure', icon: '🏔️' },
  { id: 'wellness', label: 'Wellness', icon: '🧘' },
  { id: 'stays', label: 'Stays', icon: '🏠' },
  { id: 'help', label: 'Help Me', icon: '🤝' },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const { experiences, services, stays } = useExperienceStore();

  const filteredExperiences = experiences.filter(exp => {
    const matchesCategory = activeCategory === 'all' || exp.category === activeCategory;
    const matchesSearch = 
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.guide.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.locationBar}>
        <Text style={styles.locationIcon}>📍</Text>
        <View>
          <Text style={styles.locationLabel}>Your Location</Text>
          <Text style={styles.locationText}>Kathmandu, Nepal</Text>
        </View>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.notificationBtn}>
        <Text style={styles.notificationIcon}>🔔</Text>
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationCount}>2</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="What do you want to experience?"
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterBtn}>
          <Text>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategories = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesContainer}
    >
      {categories.map(cat => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.categoryChip,
            activeCategory === cat.id && styles.categoryChipActive,
          ]}
          onPress={() => setActiveCategory(cat.id)}
        >
          <Text style={styles.categoryIcon}>{cat.icon}</Text>
          <Text style={[
            styles.categoryLabel,
            activeCategory === cat.id && styles.categoryLabelActive,
          ]}>
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderFeatured = () => (
    <TouchableOpacity 
      style={styles.featuredCard}
      onPress={() => navigation.navigate('ExperienceDetail', { experienceId: 3 })}
      activeOpacity={0.9}
    >
      <View style={styles.featuredImage}>
        <Text style={styles.featuredEmoji}>🌄</Text>
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>⭐ Featured</Text>
        </View>
        <View style={styles.featuredOverlay}>
          <Text style={styles.featuredTitle}>Sunrise Hike to Nagarkot</Text>
          <Text style={styles.featuredSubtitle}>Watch the sun rise over the Himalayas</Text>
          <View style={styles.featuredMeta}>
            <Text style={styles.featuredMetaText}>⭐ 5.0</Text>
            <Text style={styles.featuredMetaText}>•</Text>
            <Text style={styles.featuredMetaText}>$45</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderExperienceCard = ({ item }: { item: typeof experiences[0] }) => (
    <TouchableOpacity
      style={styles.experienceCard}
      onPress={() => navigation.navigate('ExperienceDetail', { experienceId: item.id })}
      activeOpacity={0.9}
    >
      <View style={styles.expImageContainer}>
        <Text style={styles.expEmoji}>{item.image}</Text>
        <View style={styles.trustBadge}>
          <Text style={styles.trustIcon}>✓</Text>
          <Text style={styles.trustText}>{item.trustScore}%</Text>
        </View>
      </View>
      
      <View style={styles.expContent}>
        <Text style={styles.expTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.expGuide}>with {item.guide}</Text>
        
        <View style={styles.expBadges}>
          {item.badges.slice(0, 2).map((badge, idx) => (
            <View key={idx} style={styles.smallBadge}>
              <Text style={styles.smallBadgeText}>{badge}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.expFooter}>
          <View style={styles.expRating}>
            <Text style={styles.expStar}>⭐</Text>
            <Text style={styles.expRatingText}>{item.rating}</Text>
            <Text style={styles.expReviews}>({item.reviews})</Text>
          </View>
          <View style={styles.expPricing}>
            <Text style={styles.expPrice}>${item.price}</Text>
            <Text style={styles.expDuration}>/ {item.duration}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderServiceCard = ({ item }: { item: typeof services[0] }) => (
    <TouchableOpacity style={styles.serviceCard} activeOpacity={0.9}>
      <Text style={styles.serviceIcon}>{item.icon}</Text>
      <Text style={styles.serviceTitle}>{item.title}</Text>
      <View style={styles.serviceMeta}>
        <Text style={styles.servicePrice}>${item.price}</Text>
        <Text style={styles.serviceTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderStayCard = ({ item }: { item: typeof stays[0] }) => (
    <TouchableOpacity 
      style={styles.stayCard}
      onPress={() => navigation.navigate('StayDetail', { stayId: item.id })}
      activeOpacity={0.9}
    >
      <View style={styles.stayImage}>
        <Text style={styles.stayEmoji}>{item.image}</Text>
      </View>
      <View style={styles.stayInfo}>
        <Text style={styles.stayTitle}>{item.title}</Text>
        <Text style={styles.stayType}>{item.type} • {item.location}</Text>
        <View style={styles.stayBadges}>
          {item.badges.slice(0, 2).map((badge, idx) => (
            <View key={idx} style={styles.smallBadge}>
              <Text style={styles.smallBadgeText}>{badge}</Text>
            </View>
          ))}
        </View>
        <View style={styles.stayMeta}>
          <Text style={styles.stayRating}>⭐ {item.rating}</Text>
          <Text style={styles.stayPrice}>From ${item.price}/night</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (activeCategory === 'help') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help Me Now</Text>
          <Text style={styles.sectionSubtitle}>On-demand local assistance</Text>
          <View style={styles.servicesGrid}>
            {services.map(service => (
              <View key={service.id} style={styles.serviceGridItem}>
                {renderServiceCard({ item: service })}
              </View>
            ))}
          </View>
        </View>
      );
    }

    if (activeCategory === 'stays') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Places to Stay</Text>
          <Text style={styles.sectionSubtitle}>Verified local accommodations</Text>
          {stays.map(stay => (
            <View key={stay.id}>
              {renderStayCard({ item: stay })}
            </View>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Experiences</Text>
          <TouchableOpacity 
            style={styles.mapBtn}
            onPress={() => navigation.navigate('TravelerTabs', { screen: 'Explore' } as any)}
          >
            <Text>🗺️</Text>
            <Text style={styles.mapBtnText}>Map</Text>
          </TouchableOpacity>
        </View>
        
        {renderFeatured()}
        
        <View style={styles.experiencesGrid}>
          {filteredExperiences.map(exp => (
            <View key={exp.id}>
              {renderExperienceCard({ item: exp })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderSearchBar()}
        {renderCategories()}
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  locationIcon: {
    fontSize: 20,
  },
  locationLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
  locationText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  dropdownArrow: {
    fontSize: 10,
    color: colors.textLight,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.white,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: 10,
    color: colors.white,
  },

  // Search
  searchContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.md,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  filterBtn: {
    padding: spacing.sm,
  },

  // Categories
  categoriesContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  categoryLabelActive: {
    color: colors.white,
  },

  // Section
  section: {
    paddingHorizontal: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.xl,
    color: colors.text,
  },
  sectionSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
  },
  mapBtnText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },

  // Featured
  featuredCard: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  featuredImage: {
    height: 200,
    backgroundColor: colors.warmLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  featuredEmoji: {
    fontSize: 80,
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.warm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  featuredBadgeText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.xs,
    color: colors.secondary,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingTop: spacing.xxxl,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  featuredTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.xl,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  featuredSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  featuredMetaText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.white,
  },

  // Experience Card
  experiencesGrid: {
    gap: spacing.lg,
  },
  experienceCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  expImageContainer: {
    height: 140,
    backgroundColor: colors.warmLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  expEmoji: {
    fontSize: 56,
  },
  trustBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  trustIcon: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '700',
  },
  trustText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 11,
    color: colors.success,
  },
  expContent: {
    padding: spacing.md,
  },
  expTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  expGuide: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  expBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  smallBadge: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  smallBadgeText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 10,
    color: colors.text,
  },
  expFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  expStar: {
    fontSize: 14,
  },
  expRatingText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  expReviews: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  expPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  expPrice: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: typography.fontSize.lg,
    color: colors.primary,
  },
  expDuration: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },

  // Services
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  serviceGridItem: {
    width: (width - spacing.xl * 2 - spacing.md) / 2,
  },
  serviceCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  serviceTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  serviceMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  servicePrice: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  serviceTime: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },

  // Stays
  stayCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  stayImage: {
    width: 64,
    height: 64,
    backgroundColor: colors.warmLight,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stayEmoji: {
    fontSize: 36,
  },
  stayInfo: {
    flex: 1,
  },
  stayTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginBottom: 2,
  },
  stayType: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  stayBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  stayMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stayRating: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  stayPrice: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
});
