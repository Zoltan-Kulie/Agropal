import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { useHaptics } from '../../hooks/useHaptics';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: any;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
}) => {
  const scale = useSharedValue(1);
  const { triggerHaptic } = useHaptics();

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: spacing.radius.md,
      overflow: 'hidden' as const,
    };

    switch (variant) {
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.secondary,
        };
      case 'accent':
        return {
          ...baseStyle,
          backgroundColor: colors.accent,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: spacing.border.normal,
          borderColor: colors.borderHighlight,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: colors.primary,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.padding.xs,
          paddingHorizontal: spacing.padding.lg,
        };
      case 'large':
        return {
          paddingVertical: spacing.padding.lg,
          paddingHorizontal: spacing.padding.xl,
        };
      default:
        return {
          paddingVertical: spacing.padding.md,
          paddingHorizontal: spacing.padding.xl,
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') {
      return colors.textPrimary;
    }
    return colors.background;
  };

  const handlePress = () => {
    if (disabled || loading) return;

    triggerHaptic('light');

    scale.value = withSequence(
      withSpring(0.98, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );

    runOnJS(onPress)();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  return (
    <AnimatedPressable
      style={[
        styles.container,
        getButtonStyle(),
        getSizeStyle(),
        animatedStyle,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.margin.sm,
  },
  icon: {
    justifyContent: 'center',
  },
  text: {
    ...typography.button,
    fontWeight: '600',
  },
});
