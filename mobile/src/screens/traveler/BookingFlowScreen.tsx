import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import { useExperienceStore } from '../../store/experienceStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'Booking'>;

export default function BookingFlowScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { experienceId } = route.params;

  const { getExperienceById, getGuideById, addBooking } = useExperienceStore();
  const experience = getExperienceById(experienceId);
  const guide = experience ? getGuideById(experience.guideId) : undefined;

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | null>(null);

  if (!experience || !guide) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Experience not found</Text>
      </SafeAreaView>
    );
  }

  // Generate next 7 days for date selection
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en', { month: 'short' }),
      full: date.toISOString().split('T')[0],
      available: experience.availability.includes(date.toLocaleDateString('en', { weekday: 'short' })),
    };
  });

  const times = ['9:00 AM', '10:00 AM', '2:00 PM', '4:00 PM'];

  const serviceFee = Math.round(experience.price * guestCount * 0.1);
  const totalPrice = experience.price * guestCount + serviceFee;

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime || !paymentMethod) {
      Alert.alert('Missing Information', 'Please complete all required fields.');
      return;
    }

    addBooking({
      experienceId: experience.id,
      date: selectedDate,
      time: selectedTime,
      status: 'upcoming',
      people: guestCount,
      total: totalPrice,
    });

    navigation.navigate('BookingConfirmation', { bookingId: Date.now() });
  };

  const renderStep1 = () => (
    <>
      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.datesContainer}>
            {dates.map((d) => (
              <TouchableOpacity
                key={d.full}
                style={[
                  styles.dateCard,
                  selectedDate === d.full && styles.dateCardSelected,
                  !d.available && styles.dateCardDisabled,
                ]}
                onPress={() => d.available && setSelectedDate(d.full)}
                disabled={!d.available}
              >
                <Text style={[styles.dateDay, selectedDate === d.full && styles.dateDaySelected]}>
                  {d.day}
                </Text>
                <Text style={[styles.dateNumber, selectedDate === d.full && styles.dateNumberSelected]}>
                  {d.date}
                </Text>
                <Text style={[styles.dateMonth, selectedDate === d.full && styles.dateMonthSelected]}>
                  {d.month}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Time Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Time</Text>
        <View style={styles.timesGrid}>
          {times.map((time) => (
            <TouchableOpacity
              key={time}
              style={[styles.timeCard, selectedTime === time && styles.timeCardSelected]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={[styles.timeText, selectedTime === time && styles.timeTextSelected]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Guest Count */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Number of Guests</Text>
        <View style={styles.guestSelector}>
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={() => guestCount > 1 && setGuestCount(guestCount - 1)}
          >
            <Text style={styles.guestBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.guestCount}>{guestCount}</Text>
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={() => guestCount < 10 && setGuestCount(guestCount + 1)}
          >
            <Text style={styles.guestBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.guestHint}>
          Max {experience.groupSize} guests per booking
        </Text>
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <TouchableOpacity
          style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionSelected]}
          onPress={() => setPaymentMethod('card')}
        >
          <Text style={styles.paymentIcon}>💳</Text>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Credit/Debit Card</Text>
            <Text style={styles.paymentDesc}>Visa, Mastercard, Amex</Text>
          </View>
          <View style={[styles.paymentRadio, paymentMethod === 'card' && styles.paymentRadioSelected]}>
            {paymentMethod === 'card' && <View style={styles.paymentRadioInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentOption, paymentMethod === 'wallet' && styles.paymentOptionSelected]}
          onPress={() => setPaymentMethod('wallet')}
        >
          <Text style={styles.paymentIcon}>📱</Text>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Digital Wallet</Text>
            <Text style={styles.paymentDesc}>Apple Pay, Google Pay</Text>
          </View>
          <View style={[styles.paymentRadio, paymentMethod === 'wallet' && styles.paymentRadioSelected]}>
            {paymentMethod === 'wallet' && <View style={styles.paymentRadioInner} />}
          </View>
        </TouchableOpacity>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {experience.title} x {guestCount}
            </Text>
            <Text style={styles.summaryValue}>${experience.price * guestCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee (10%)</Text>
            <Text style={styles.summaryValue}>${serviceFee}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>${totalPrice}</Text>
          </View>
        </View>
      </View>

      {/* Cancellation Policy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cancellation Policy</Text>
        <View style={styles.policyCard}>
          <Text style={styles.policyText}>
            Free cancellation up to 24 hours before the experience. After that, a 50% cancellation
            fee applies.
          </Text>
        </View>
      </View>

      {/* Safety Info */}
      <View style={styles.section}>
        <View style={styles.safetyCard}>
          <Text style={styles.safetyIcon}>🛡️</Text>
          <View style={styles.safetyInfo}>
            <Text style={styles.safetyTitle}>Secure Booking</Text>
            <Text style={styles.safetyDesc}>
              Your payment is protected. GPS tracking available during the experience.
            </Text>
          </View>
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 1 ? navigation.goBack() : setStep(1)} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.steps}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Experience Summary */}
      <View style={styles.experienceSummary}>
        <View style={styles.expImage}>
          <Text style={styles.expEmoji}>{experience.image}</Text>
        </View>
        <View style={styles.expInfo}>
          <Text style={styles.expTitle}>{experience.title}</Text>
          <Text style={styles.expMeta}>
            with {guide.name} • {experience.duration}
          </Text>
          <View style={styles.expBadges}>
            {guide.badges.slice(0, 2).map((badge, i) => (
              <View key={i} style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {step === 1 ? renderStep1() : renderStep2()}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.priceValue}>${totalPrice}</Text>
        </View>
        {step === 1 ? (
          <TouchableOpacity
            style={[styles.continueBtn, (!selectedDate || !selectedTime) && styles.continueBtnDisabled]}
            onPress={() => setStep(2)}
            disabled={!selectedDate || !selectedTime}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.continueBtn, !paymentMethod && styles.continueBtnDisabled]}
            onPress={handleConfirmBooking}
            disabled={!paymentMethod}
          >
            <Text style={styles.continueBtnText}>Confirm & Pay</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  backBtn: {
    padding: spacing.sm,
  },
  backIcon: {
    fontSize: 24,
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
  },
  placeholder: {
    width: 40,
  },

  // Experience Summary
  experienceSummary: {
    flexDirection: 'row',
    padding: spacing.xl,
    backgroundColor: colors.white,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  expImage: {
    width: 80,
    height: 80,
    backgroundColor: colors.warmLight,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expEmoji: {
    fontSize: 40,
  },
  expInfo: {
    flex: 1,
  },
  expTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.lg,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  expMeta: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  expBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 10,
    color: colors.text,
  },

  content: {
    paddingBottom: 100,
  },

  // Section
  section: {
    padding: spacing.xl,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.lg,
    color: colors.text,
    marginBottom: spacing.md,
  },

  // Dates
  datesContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateCard: {
    width: 70,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
  },
  dateCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateCardDisabled: {
    opacity: 0.4,
  },
  dateDay: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  dateDaySelected: {
    color: colors.white,
  },
  dateNumber: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.xl,
    color: colors.text,
    marginVertical: spacing.xs,
  },
  dateNumberSelected: {
    color: colors.white,
  },
  dateMonth: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  dateMonthSelected: {
    color: colors.white,
  },

  // Times
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
  },
  timeCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  timeTextSelected: {
    color: colors.white,
  },

  // Guests
  guestSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  guestBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtnText: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 24,
    color: colors.text,
  },
  guestCount: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 32,
    color: colors.text,
    minWidth: 60,
    textAlign: 'center',
  },
  guestHint: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.md,
  },

  // Payment
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.warmLight,
  },
  paymentIcon: {
    fontSize: 28,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  paymentDesc: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  paymentRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentRadioSelected: {
    borderColor: colors.primary,
  },
  paymentRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },

  // Summary
  summaryCard: {
    backgroundColor: colors.backgroundAlt,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  summaryValue: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    marginBottom: 0,
  },
  summaryTotalLabel: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.lg,
    color: colors.text,
  },
  summaryTotalValue: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.lg,
    color: colors.primary,
  },

  // Policy
  policyCard: {
    backgroundColor: colors.backgroundAlt,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  policyText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    lineHeight: 20,
  },

  // Safety
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: '#DCFCE7',
    borderRadius: borderRadius.md,
  },
  safetyIcon: {
    fontSize: 28,
  },
  safetyInfo: {
    flex: 1,
  },
  safetyTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  safetyDesc: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.lg,
  },
  priceContainer: {},
  priceLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  priceValue: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.xl,
    color: colors.text,
  },
  continueBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.full,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: colors.white,
  },
});
