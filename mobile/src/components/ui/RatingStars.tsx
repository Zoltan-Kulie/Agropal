import React from 'react';
import { View, Text, Pressable, ViewStyle, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { useHaptics } from '../../hooks/useHaptics';

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
  style?: ViewStyle;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onRatingChange,
  size = 24,
  readonly = false,
  style,
}) => {
  const { triggerHaptic } = useHaptics();

  const handlePress = (value: number) => {
    if (readonly || !onRatingChange) return;
    triggerHaptic('light');
    onRatingChange(value);
  };

  const Star = ({ filled }: { filled: boolean }) => {
    return (
      <Pressable
        onPress={() => handlePress(filled ? 0 : rating + 1)}
        disabled={readonly}
        style={styles.starContainer}
      >
        <Text
          style={[
            styles.star,
            {
              fontSize: size,
              color: filled ? colors.accent : colors.borderHighlight,
            },
          ]}
        >
          {filled ? '★' : '☆'}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star key={value} filled={value <= rating} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    marginHorizontal: spacing.margin.xs / 2,
  },
  star: {
    lineHeight: size,
  },
});
