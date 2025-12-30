import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Linking,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, borderRadius, typography, shadows } from '../../theme';

interface TrustedContact {
  id: number;
  name: string;
  phone: string;
  relationship: string;
}

export default function SafetyScreen() {
  const navigation = useNavigation();
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [contacts, setContacts] = useState<TrustedContact[]>([
    { id: 1, name: 'Mom', phone: '+1-555-123-4567', relationship: 'Mother' },
    { id: 2, name: 'Travel Insurance', phone: '+1-800-555-0123', relationship: 'Insurance' },
  ]);

  const triggerPanicAlert = () => {
    Vibration.vibrate([0, 200, 100, 200]);
    setIsPanicMode(true);

    Alert.alert(
      'Panic Alert Sent',
      'Your location has been shared with your emergency contacts and LocalLink support team. Someone will contact you shortly.',
      [
        { text: 'Cancel Alert', onPress: () => setIsPanicMode(false), style: 'cancel' },
        { text: 'Keep Active', style: 'destructive' },
      ]
    );
  };

  const callEmergency = () => {
    Alert.alert(
      'Call Emergency Services?',
      'This will dial 100 (Nepal Police)',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL('tel:100') },
      ]
    );
  };

  const quickActions = [
    { id: 1, icon: '🆘', label: 'Emergency\nSupport', action: () => Alert.alert('Connecting...', 'A support agent will call you shortly.') },
    { id: 2, icon: '📍', label: 'Share\nLocation', action: () => Alert.alert('Location Shared', 'Your live location is now being shared.') },
    { id: 3, icon: '🏥', label: 'Nearest\nHospital', action: () => Alert.alert('Finding...', 'Searching for nearby hospitals.') },
    { id: 4, icon: '🚓', label: 'Call\nPolice', action: callEmergency },
  ];

  const safetyTips = [
    { icon: '🌙', title: 'Night Safety', desc: 'Avoid isolated areas after 10pm. Use verified transport.' },
    { icon: '💰', title: 'Money Safety', desc: 'Keep valuables hidden. Use in-app payments when possible.' },
    { icon: '📱', title: 'Stay Connected', desc: 'Keep your phone charged and data active at all times.' },
    { icon: '🗣️', title: 'Trust Your Instincts', desc: 'If something feels wrong, leave the situation.' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Center</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Panic Button */}
        <View style={styles.panicSection}>
          <Text style={styles.panicLabel}>Emergency? Press & Hold</Text>
          <TouchableOpacity
            style={[styles.panicButton, isPanicMode && styles.panicButtonActive]}
            onLongPress={triggerPanicAlert}
            delayLongPress={1000}
            activeOpacity={0.8}
          >
            <Text style={styles.panicIcon}>{isPanicMode ? '🔴' : '🆘'}</Text>
            <Text style={styles.panicText}>
              {isPanicMode ? 'ALERT ACTIVE' : 'HOLD FOR HELP'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.panicHint}>
            Hold for 1 second to send panic alert to your contacts
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickAction}
                onPress={action.action}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trusted Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trusted Contacts</Text>
            <TouchableOpacity style={styles.addBtn}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {contacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactInfo}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactInitial}>{contact.name.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactMeta}>{contact.relationship} • {contact.phone}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => Linking.openURL(`tel:${contact.phone}`)}
              >
                <Text style={styles.callBtnText}>📞</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Check-In Feature */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check-In</Text>
          <View style={styles.checkInCard}>
            <View style={styles.checkInInfo}>
              <Text style={styles.checkInIcon}>📍</Text>
              <View>
                <Text style={styles.checkInTitle}>Share your status</Text>
                <Text style={styles.checkInDesc}>Let contacts know you're safe</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.checkInBtn}
              onPress={() => Alert.alert('Check-In Sent', 'Your contacts have been notified that you are safe.')}
            >
              <Text style={styles.checkInBtnText}>I'm Safe</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          {safetyTips.map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDesc}>{tip.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Local Emergency Numbers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local Emergency Numbers</Text>
          <View style={styles.emergencyNumbers}>
            {[
              { label: 'Police', number: '100' },
              { label: 'Tourist Police', number: '1144' },
              { label: 'Ambulance', number: '102' },
              { label: 'Fire', number: '101' },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.emergencyItem}
                onPress={() => Linking.openURL(`tel:${item.number}`)}
              >
                <Text style={styles.emergencyLabel}>{item.label}</Text>
                <Text style={styles.emergencyNumber}>{item.number}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.lg,
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingBottom: 100,
  },

  // Panic Section
  panicSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  panicLabel: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  panicButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#EF4444',
    ...shadows.lg,
  },
  panicButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
  },
  panicIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  panicText: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.md,
    color: '#EF4444',
  },
  panicHint: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.lg,
    textAlign: 'center',
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
  addBtn: {
    padding: spacing.sm,
  },
  addBtnText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickAction: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 10,
    color: colors.text,
    textAlign: 'center',
  },

  // Contacts
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitial: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.lg,
    color: colors.white,
  },
  contactName: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  contactMeta: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtnText: {
    fontSize: 20,
  },

  // Check-In
  checkInCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  checkInInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkInIcon: {
    fontSize: 28,
  },
  checkInTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  checkInDesc: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  checkInBtn: {
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
  },
  checkInBtnText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.white,
  },

  // Tips
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tipIcon: {
    fontSize: 24,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tipDesc: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },

  // Emergency Numbers
  emergencyNumbers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  emergencyItem: {
    width: '47%',
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  emergencyLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emergencyNumber: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.xl,
    color: '#EF4444',
  },
});
