import React from 'react';
import { View, ViewStyle, StyleSheet, Pressable } from 'react-native';
import { colors, spacing } from '../../theme';
import Animated, { useAnimatedStyle, withSpring, interpolateColor } from 'react-native-reanimated';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  glassIntensity?: 'low' | 'medium' | 'high';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  disabled = false,
  glassIntensity = 'medium',
}) => {
  const getGlassStyle = () => {
    switch (glassIntensity) {
      case 'low':
        return {
          backgroundColor: colors.glassTintDark,
          borderColor: colors.borderHighlightDark,
        };
      case 'high':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.16)',
          borderColor: 'rgba(255, 255, 255, 0.24)',
        };
      default:
        return {
          backgroundColor: colors.glassTint,
          borderColor: colors.borderHighlight,
        };
    }
  };

  const animated = useAnimatedStyle(() => {
    const scale = withSpring(!disabled ? 1 : 0.95);
    return {
      transform: [{ scale }],
    };
  });

  const Card = onPress ? Animated.createAnimatedComponent(Pressable) : View;

  return (
    <Card
      style={[
        styles.container,
        getGlassStyle(),
        style,
        onPress && animated,
      ]}
      onPress={onPress}
      disabled={disabled || !onPress}
    >
      {children}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glassTint,
    borderRadius: spacing.radius.lg,
    borderWidth: spacing.border.thin,
    borderColor: colors.borderHighlight,
    padding: spacing.padding.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
