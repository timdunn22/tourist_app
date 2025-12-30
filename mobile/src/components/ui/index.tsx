import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

// ============ BUTTON COMPONENT ============
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) => {
  const buttonStyles = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    fullWidth && styles.buttonFullWidth,
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyles = [
    styles.buttonText,
    styles[`buttonText_${variant}`],
    styles[`buttonText_${size}`],
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} />
      ) : (
        <>
          {icon && <Text style={styles.buttonIcon}>{icon}</Text>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// ============ INPUT COMPONENT ============
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  icon?: string;
  style?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  multiline = false,
  numberOfLines = 1,
  icon,
  style,
}) => {
  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {icon && <Text style={styles.inputIcon}>{icon}</Text>}
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          placeholder={placeholder}
          placeholderTextColor={colors.textLighter}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// ============ CARD COMPONENT ============
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  padding = 'md',
}) => {
  const cardStyles = [
    styles.card,
    styles[`cardPadding_${padding}`],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

// ============ BADGE COMPONENT ============
interface BadgeProps {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent';
  size?: 'sm' | 'md';
  icon?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'sm',
  icon,
}) => {
  return (
    <View style={[styles.badge, styles[`badge_${variant}`], styles[`badge_${size}`]]}>
      {icon && <Text style={styles.badgeIcon}>{icon}</Text>}
      <Text style={[styles.badgeText, styles[`badgeText_${variant}`], styles[`badgeText_${size}`]]}>
        {text}
      </Text>
    </View>
  );
};

// ============ TRUST SCORE COMPONENT ============
interface TrustScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const TrustScore: React.FC<TrustScoreProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const getColor = () => {
    if (score >= 95) return colors.success;
    if (score >= 85) return colors.accent;
    if (score >= 70) return colors.warning;
    return colors.danger;
  };

  return (
    <View style={[styles.trustScore, styles[`trustScore_${size}`]]}>
      <Text style={[styles.trustIcon, { color: getColor() }]}>✓</Text>
      <Text style={[styles.trustValue, styles[`trustValue_${size}`], { color: getColor() }]}>
        {score}%
      </Text>
      {showLabel && size !== 'sm' && (
        <Text style={styles.trustLabel}>Trust</Text>
      )}
    </View>
  );
};

// ============ AVATAR COMPONENT ============
interface AvatarProps {
  emoji?: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  badge?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  emoji = '👤',
  imageUrl,
  size = 'md',
  badge,
}) => {
  return (
    <View style={[styles.avatarContainer, styles[`avatar_${size}`]]}>
      <View style={[styles.avatar, styles[`avatar_${size}`]]}>
        <Text style={[styles.avatarEmoji, styles[`avatarEmoji_${size}`]]}>{emoji}</Text>
      </View>
      {badge && (
        <View style={styles.avatarBadge}>
          <Text style={styles.avatarBadgeText}>{badge}</Text>
        </View>
      )}
    </View>
  );
};

// ============ RATING COMPONENT ============
interface RatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
  showCount?: boolean;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  count,
  size = 'md',
  showCount = true,
}) => {
  return (
    <View style={styles.rating}>
      <Text style={[styles.ratingStars, styles[`ratingStars_${size}`]]}>★</Text>
      <Text style={[styles.ratingValue, styles[`ratingValue_${size}`]]}>{value}</Text>
      {showCount && count !== undefined && (
        <Text style={[styles.ratingCount, styles[`ratingCount_${size}`]]}>({count})</Text>
      )}
    </View>
  );
};

// ============ DIVIDER COMPONENT ============
interface DividerProps {
  text?: string;
}

export const Divider: React.FC<DividerProps> = ({ text }) => {
  if (text) {
    return (
      <View style={styles.dividerWithText}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{text}</Text>
        <View style={styles.dividerLine} />
      </View>
    );
  }
  return <View style={styles.divider} />;
};

// ============ SECTION HEADER COMPONENT ============
interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText,
  onAction,
}) => {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionText && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============ STYLES ============
const styles = StyleSheet.create({
  // Button styles
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  button_primary: {
    backgroundColor: colors.primary,
  },
  button_secondary: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button_danger: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  button_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  button_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  button_lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  buttonText_primary: {
    color: colors.white,
  },
  buttonText_secondary: {
    color: colors.text,
  },
  buttonText_danger: {
    color: colors.danger,
  },
  buttonText_ghost: {
    color: colors.primary,
  },
  buttonText_sm: {
    fontSize: typography.fontSize.sm,
  },
  buttonText_md: {
    fontSize: typography.fontSize.base,
  },
  buttonText_lg: {
    fontSize: typography.fontSize.lg,
  },
  buttonIcon: {
    fontSize: 18,
  },

  // Input styles
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
  },
  inputError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.base,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  errorText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.danger,
    marginTop: spacing.xs,
  },

  // Card styles
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  cardPadding_none: {
    padding: 0,
  },
  cardPadding_sm: {
    padding: spacing.sm,
  },
  cardPadding_md: {
    padding: spacing.lg,
  },
  cardPadding_lg: {
    padding: spacing.xl,
  },

  // Badge styles
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  badge_default: {
    backgroundColor: colors.backgroundAlt,
  },
  badge_success: {
    backgroundColor: colors.successLight,
  },
  badge_warning: {
    backgroundColor: colors.warningLight,
  },
  badge_danger: {
    backgroundColor: colors.dangerLight,
  },
  badge_accent: {
    backgroundColor: colors.accentLight,
  },
  badge_sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  badge_md: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  badgeIcon: {
    fontSize: 12,
  },
  badgeText: {
    fontFamily: typography.fontFamily.bodyMedium,
  },
  badgeText_default: {
    color: colors.text,
  },
  badgeText_success: {
    color: colors.success,
  },
  badgeText_warning: {
    color: colors.warning,
  },
  badgeText_danger: {
    color: colors.danger,
  },
  badgeText_accent: {
    color: colors.accentDark,
  },
  badgeText_sm: {
    fontSize: typography.fontSize.xs,
  },
  badgeText_md: {
    fontSize: typography.fontSize.sm,
  },

  // Trust Score styles
  trustScore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  trustScore_sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  trustScore_md: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  trustScore_lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  trustIcon: {
    fontWeight: '700',
  },
  trustValue: {
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  trustValue_sm: {
    fontSize: typography.fontSize.xs,
  },
  trustValue_md: {
    fontSize: typography.fontSize.sm,
  },
  trustValue_lg: {
    fontSize: typography.fontSize.md,
  },
  trustLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },

  // Avatar styles
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: colors.white,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  avatar_sm: {
    width: 36,
    height: 36,
  },
  avatar_md: {
    width: 52,
    height: 52,
  },
  avatar_lg: {
    width: 80,
    height: 80,
  },
  avatar_xl: {
    width: 110,
    height: 110,
  },
  avatarEmoji: {},
  avatarEmoji_sm: {
    fontSize: 20,
  },
  avatarEmoji_md: {
    fontSize: 28,
  },
  avatarEmoji_lg: {
    fontSize: 44,
  },
  avatarEmoji_xl: {
    fontSize: 60,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.success,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },

  // Rating styles
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingStars: {
    color: colors.warm,
  },
  ratingStars_sm: {
    fontSize: typography.fontSize.sm,
  },
  ratingStars_md: {
    fontSize: typography.fontSize.base,
  },
  ratingValue: {
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text,
  },
  ratingValue_sm: {
    fontSize: typography.fontSize.sm,
  },
  ratingValue_md: {
    fontSize: typography.fontSize.base,
  },
  ratingCount: {
    fontFamily: typography.fontFamily.body,
    color: colors.textLight,
  },
  ratingCount_sm: {
    fontSize: typography.fontSize.xs,
  },
  ratingCount_md: {
    fontSize: typography.fontSize.sm,
  },

  // Divider styles
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  dividerWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },

  // Section Header styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.lg,
    color: colors.text,
  },
  sectionAction: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
});
