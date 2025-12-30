import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function GuideDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();

  const guide = {
    name: 'Pemba Sherpa',
    level: 'Professional Guide',
    levelNum: 2,
    trustScore: 98,
    rating: 4.9,
    reviews: 127,
    badges: ['Platform Trained', 'Female-Safe', 'First Aid Ready'],
  };

  const stats = {
    todayEarnings: 75,
    weekEarnings: 345,
    monthEarnings: 1420,
    pendingPayout: 890,
    totalTours: 342,
    responseRate: 98,
    acceptanceRate: 95,
  };

  const upcomingBookings = [
    { id: 1, title: 'Hidden Temple Walk', traveler: 'Sarah M.', date: 'Today', time: '9:00 AM', guests: 2, status: 'confirmed' },
    { id: 2, title: 'Hidden Temple Walk', traveler: 'John D.', date: 'Tomorrow', time: '10:00 AM', guests: 4, status: 'pending' },
    { id: 3, title: 'Hidden Temple Walk', traveler: 'Emma L.', date: 'Dec 26', time: '9:00 AM', guests: 1, status: 'confirmed' },
  ];

  const trainingProgress = {
    completed: 3,
    total: 5,
    nextModule: 'Heritage Expert Certification',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>{guide.name} 👋</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>

        {/* Trust Score Card */}
        <View style={styles.trustCard}>
          <View style={styles.trustInfo}>
            <View style={styles.trustScoreContainer}>
              <Text style={styles.trustScoreValue}>{guide.trustScore}</Text>
              <Text style={styles.trustScoreLabel}>Trust Score</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustLevel}>
              <Text style={styles.trustLevelBadge}>Level {guide.levelNum}</Text>
              <Text style={styles.trustLevelText}>{guide.level}</Text>
            </View>
          </View>
          <View style={styles.trustBadges}>
            {guide.badges.map((badge, i) => (
              <View key={i} style={styles.badge}>
                <Text style={styles.badgeText}>✓ {badge}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>${stats.todayEarnings}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statValue}>${stats.weekEarnings}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏳</Text>
            <Text style={styles.statValue}>${stats.pendingPayout}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{guide.rating}</Text>
            <Text style={styles.statLabel}>{guide.reviews} reviews</Text>
          </View>
        </View>

        {/* Upcoming Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {upcomingBookings.map((booking) => (
            <TouchableOpacity key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingTitle}>{booking.title}</Text>
                <Text style={styles.bookingMeta}>
                  {booking.traveler} • {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                </Text>
                <View style={styles.bookingTime}>
                  <Text style={styles.bookingDate}>{booking.date}</Text>
                  <Text style={styles.bookingTimeText}>{booking.time}</Text>
                </View>
              </View>
              <View style={styles.bookingActions}>
                <View style={[styles.statusBadge, booking.status === 'confirmed' && styles.statusConfirmed]}>
                  <Text style={[styles.statusText, booking.status === 'confirmed' && styles.statusTextConfirmed]}>
                    {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </Text>
                </View>
                {booking.status === 'pending' && (
                  <TouchableOpacity style={styles.acceptBtn}>
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Performance</Text>
          <View style={styles.performanceCard}>
            <View style={styles.perfItem}>
              <View style={styles.perfHeader}>
                <Text style={styles.perfLabel}>Response Rate</Text>
                <Text style={styles.perfValue}>{stats.responseRate}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${stats.responseRate}%` }]} />
              </View>
            </View>
            <View style={styles.perfItem}>
              <View style={styles.perfHeader}>
                <Text style={styles.perfLabel}>Acceptance Rate</Text>
                <Text style={styles.perfValue}>{stats.acceptanceRate}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${stats.acceptanceRate}%` }]} />
              </View>
            </View>
            <View style={styles.perfItem}>
              <View style={styles.perfHeader}>
                <Text style={styles.perfLabel}>Total Tours Completed</Text>
                <Text style={styles.perfValue}>{stats.totalTours}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Training Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Progress</Text>
          <TouchableOpacity style={styles.trainingCard} onPress={() => navigation.navigate('Training')}>
            <View style={styles.trainingHeader}>
              <View style={styles.trainingProgress}>
                <Text style={styles.trainingProgressText}>
                  {trainingProgress.completed}/{trainingProgress.total}
                </Text>
                <Text style={styles.trainingProgressLabel}>Completed</Text>
              </View>
              <View style={styles.trainingNext}>
                <Text style={styles.trainingNextLabel}>Next Up:</Text>
                <Text style={styles.trainingNextModule}>{trainingProgress.nextModule}</Text>
              </View>
            </View>
            <View style={styles.trainingProgressBar}>
              <View style={[styles.trainingProgressFill, { width: `${(trainingProgress.completed / trainingProgress.total) * 100}%` }]} />
            </View>
            <Text style={styles.trainingCta}>Complete training to unlock more features →</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('AddExperience', {})}>
              <Text style={styles.quickActionIcon}>➕</Text>
              <Text style={styles.quickActionLabel}>Add Experience</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionLabel}>View Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Text style={styles.quickActionIcon}>💬</Text>
              <Text style={styles.quickActionLabel}>Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Text style={styles.quickActionIcon}>⚙️</Text>
              <Text style={styles.quickActionLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  greeting: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.md,
    color: colors.textLight,
  },
  name: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.xl,
    color: colors.text,
  },
  notifBtn: {
    position: 'relative',
    padding: spacing.sm,
  },
  notifIcon: {
    fontSize: 24,
  },
  notifBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },

  // Trust Card
  trustCard: {
    marginHorizontal: spacing.xl,
    marginVertical: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  trustInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  trustScoreContainer: {
    alignItems: 'center',
    flex: 1,
  },
  trustScoreValue: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 48,
    color: colors.white,
  },
  trustScoreLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  trustDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing.lg,
  },
  trustLevel: {
    flex: 1,
    alignItems: 'center',
  },
  trustLevelBadge: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.xl,
    color: colors.white,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  trustLevelText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  trustBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 11,
    color: colors.white,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.xl,
    color: colors.text,
  },
  statLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },

  // Section
  section: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.lg,
    color: colors.text,
    marginBottom: spacing.md,
  },
  seeAll: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },

  // Booking Card
  bookingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  bookingMeta: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  bookingTime: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  bookingDate: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  bookingTimeText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  bookingActions: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.warning + '20',
  },
  statusConfirmed: {
    backgroundColor: colors.success + '20',
  },
  statusText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 11,
    color: colors.warning,
  },
  statusTextConfirmed: {
    color: colors.success,
  },
  acceptBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  acceptBtnText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.white,
  },

  // Performance
  performanceCard: {
    backgroundColor: colors.backgroundAlt,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  perfItem: {
    marginBottom: spacing.md,
  },
  perfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  perfLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  perfValue: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },

  // Training
  trainingCard: {
    backgroundColor: colors.warmLight,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  trainingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  trainingProgress: {
    alignItems: 'center',
  },
  trainingProgressText: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.xl,
    color: colors.primary,
  },
  trainingProgressLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  trainingNext: {},
  trainingNextLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  trainingNextModule: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  trainingProgressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  trainingProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  trainingCta: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    textAlign: 'center',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickAction: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 10,
    color: colors.text,
    textAlign: 'center',
  },
});
