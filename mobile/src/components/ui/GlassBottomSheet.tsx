import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Text, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  GestureDetector,
  Gesture,
} from 'react-native-reanimated';

interface GlassBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  height?: number | string;
  style?: ViewStyle;
}

export const GlassBottomSheet: React.FC<GlassBottomSheetProps> = ({
  visible,
  onClose,
  children,
  title,
  height = '60%',
  style,
}) => {
  const translateY = useSharedValue(1000);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20 });
    } else {
      translateY.value = withSpring(1000, { damping: 20 });
    }
  }, [visible]);

  const pan = Gesture.Pan()
    .onStart(() => {
      // Pan started
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
        translateY.value = withSpring(1000, { damping: 20 }, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 20 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleBackdropPress = () => {
    translateY.value = withSpring(1000, { damping: 20 }, () => {
      runOnJS(onClose)();
    });
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <View />
      </Pressable>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.sheet,
            { height },
            animatedStyle,
            style,
          ]}
        >
          <View style={styles.handle} />
          {title && <Text style={styles.title}>{title}</Text>}
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.radius.xl,
    borderTopRightRadius: spacing.radius.xl,
    borderWidth: spacing.border.thin,
    borderColor: colors.borderHighlight,
    padding: spacing.padding.xl,
    paddingBottom: spacing.padding.xxxl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.borderHighlight,
    alignSelf: 'center',
    borderRadius: spacing.radius.full,
    marginBottom: spacing.margin.lg,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.margin.lg,
    textAlign: 'center',
  },
});
