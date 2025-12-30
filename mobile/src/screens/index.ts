// Screen exports - mix of implemented and placeholder screens

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../../theme';

const PlaceholderScreen = ({ title }: { title: string }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontFamily: typography.fontFamily.display, fontSize: 24, marginBottom: 8 },
  subtitle: { fontFamily: typography.fontFamily.body, color: colors.textLight },
});

// Auth Screens
export const SplashScreen = () => <PlaceholderScreen title="🌏 LocalLink" />;
export const OnboardingScreen = () => <PlaceholderScreen title="Onboarding" />;
export const LoginScreen = () => <PlaceholderScreen title="Login" />;
export const SignupScreen = () => <PlaceholderScreen title="Sign Up" />;

// Traveler Screens
export const ExploreMapScreen = () => <PlaceholderScreen title="Explore Map" />;
export const BookingsScreen = () => <PlaceholderScreen title="My Bookings" />;
export const ExperienceDetailScreen = () => <PlaceholderScreen title="Experience Detail" />;
export const GuideProfileScreen = () => <PlaceholderScreen title="Guide Profile" />;
export const BookingScreen = () => <PlaceholderScreen title="Booking" />;
export const BookingConfirmationScreen = () => <PlaceholderScreen title="Booking Confirmed!" />;
export const LiveExperienceScreen = () => <PlaceholderScreen title="Live Experience" />;
export const StaysScreen = () => <PlaceholderScreen title="Stays" />;
export const StayDetailScreen = () => <PlaceholderScreen title="Stay Detail" />;
export const ServicesScreen = () => <PlaceholderScreen title="Services" />;
export const SafetyScreen = () => <PlaceholderScreen title="Safety Center" />;

// Guide Screens
export const DashboardScreen = () => <PlaceholderScreen title="Guide Dashboard" />;
export const CalendarScreen = () => <PlaceholderScreen title="Calendar" />;
export const EarningsScreen = () => <PlaceholderScreen title="Earnings" />;
export const TrainingScreen = () => <PlaceholderScreen title="Training Center" />;
export const AddExperienceScreen = () => <PlaceholderScreen title="Add Experience" />;
export const MyExperiencesScreen = () => <PlaceholderScreen title="My Experiences" />;

// Shared Screens
export const MessagesScreen = () => <PlaceholderScreen title="Messages" />;
export const ChatScreen = () => <PlaceholderScreen title="Chat" />;
export const ProfileScreen = () => <PlaceholderScreen title="Profile" />;
export const EditProfileScreen = () => <PlaceholderScreen title="Edit Profile" />;
export const SettingsScreen = () => <PlaceholderScreen title="Settings" />;
