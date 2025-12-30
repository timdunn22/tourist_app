import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import { useAuthStore } from '../store/authStore';
import { colors, typography } from '../theme';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Traveler Screens
import HomeScreen from '../screens/traveler/HomeScreen';
import ExploreMapScreen from '../screens/traveler/ExploreMapScreen';
import BookingsScreen from '../screens/traveler/BookingsScreen';
import ExperienceDetailScreen from '../screens/traveler/ExperienceDetailScreen';
import GuideProfileScreen from '../screens/traveler/GuideProfileScreen';
import BookingScreen from '../screens/traveler/BookingScreen';
import BookingConfirmationScreen from '../screens/traveler/BookingConfirmationScreen';
import LiveExperienceScreen from '../screens/traveler/LiveExperienceScreen';
import StaysScreen from '../screens/traveler/StaysScreen';
import StayDetailScreen from '../screens/traveler/StayDetailScreen';
import ServicesScreen from '../screens/traveler/ServicesScreen';

// Guide Screens
import DashboardScreen from '../screens/guide/DashboardScreen';
import CalendarScreen from '../screens/guide/CalendarScreen';
import EarningsScreen from '../screens/guide/EarningsScreen';
import TrainingScreen from '../screens/guide/TrainingScreen';
import AddExperienceScreen from '../screens/guide/AddExperienceScreen';
import MyExperiencesScreen from '../screens/guide/MyExperiencesScreen';

// Shared Screens
import MessagesScreen from '../screens/shared/MessagesScreen';
import ChatScreen from '../screens/shared/ChatScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import EditProfileScreen from '../screens/shared/EditProfileScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';

// Types
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  TravelerTabs: undefined;
  GuideTabs: undefined;
  ExperienceDetail: { experienceId: number };
  GuideProfile: { guideId: number };
  Booking: { experienceId: number };
  BookingConfirmation: { bookingId: number };
  LiveExperience: { bookingId: number };
  StayDetail: { stayId: number };
  Chat: { recipientId: number; recipientName: string };
  EditProfile: undefined;
  Settings: undefined;
  AddExperience: { experienceId?: number };
  Training: undefined;
};

export type TravelerTabParamList = {
  Home: undefined;
  Explore: undefined;
  Bookings: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type GuideTabParamList = {
  Dashboard: undefined;
  Calendar: undefined;
  Messages: undefined;
  Earnings: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const TravelerTab = createBottomTabNavigator<TravelerTabParamList>();
const GuideTab = createBottomTabNavigator<GuideTabParamList>();

// Tab Icon Component
const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
);

// Traveler Tab Navigator
function TravelerTabNavigator() {
  return (
    <TravelerTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <TravelerTab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <TravelerTab.Screen 
        name="Explore" 
        component={ExploreMapScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🗺️" focused={focused} />,
        }}
      />
      <TravelerTab.Screen 
        name="Bookings" 
        component={BookingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} />,
        }}
      />
      <TravelerTab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="💬" focused={focused} />,
        }}
      />
      <TravelerTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </TravelerTab.Navigator>
  );
}

// Guide Tab Navigator
function GuideTabNavigator() {
  return (
    <GuideTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <GuideTab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
          tabBarLabel: 'Home',
        }}
      />
      <GuideTab.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} />,
        }}
      />
      <GuideTab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="💬" focused={focused} />,
        }}
      />
      <GuideTab.Screen 
        name="Earnings" 
        component={EarningsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="💰" focused={focused} />,
        }}
      />
      <GuideTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </GuideTab.Navigator>
  );
}

// Root Navigator
export default function RootNavigator() {
  const { isAuthenticated, userType, hasOnboarded } = useAuthStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        // Auth Flow
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : userType === 'traveler' ? (
        // Traveler Flow
        <>
          <Stack.Screen name="TravelerTabs" component={TravelerTabNavigator} />
          <Stack.Screen name="ExperienceDetail" component={ExperienceDetailScreen} />
          <Stack.Screen name="GuideProfile" component={GuideProfileScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
          <Stack.Screen name="LiveExperience" component={LiveExperienceScreen} />
          <Stack.Screen name="StayDetail" component={StayDetailScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      ) : (
        // Guide Flow
        <>
          <Stack.Screen name="GuideTabs" component={GuideTabNavigator} />
          <Stack.Screen name="AddExperience" component={AddExperienceScreen} />
          <Stack.Screen name="Training" component={TrainingScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 24,
    height: 80,
  },
  tabLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 11,
    marginTop: 4,
  },
});
