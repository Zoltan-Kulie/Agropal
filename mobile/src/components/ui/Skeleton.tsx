import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  borderRadius?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  style,
  borderRadius = 8,
}) => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.glassTint,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

export const SkeletonText: React.FC<{ width?: string; style?: ViewStyle }> = ({
  width = '100%',
  style,
}) => {
  return <Skeleton width={width} height={16} borderRadius={4} style={style} />;
};

export const SkeletonAvatar: React.FC<{ size?: number; style?: ViewStyle }> = ({
  size = 48,
  style,
}) => {
  return <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />;
};

export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[{ padding: 16, gap: 12 }, style]}>
      <SkeletonAvatar size={48} />
      <SkeletonText width="80%" />
      <SkeletonText width="60%" />
    </View>
  );
};
