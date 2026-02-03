import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Modal as RNModal, ViewStyle, Keyboard } from 'react-native';
import { colors, spacing } from '../../theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface GlassModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animation?: 'fade' | 'slide' | 'scale';
  style?: ViewStyle;
}

export const GlassModal: React.FC<GlassModalProps> = ({
  visible,
  onClose,
  children,
  animation = 'fade',
  style,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(100);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 220 });
      scale.value = withSpring(1, { damping: 15 });
      translateY.value = withSpring(0, { damping: 15 });
    } else {
      opacity.value = withTiming(0, { duration: 220 });
      scale.value = withTiming(0.9, { duration: 220 });
      translateY.value = withTiming(100, { duration: 220 });
    }
  }, [visible]);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => {
    switch (animation) {
      case 'scale':
        return {
          transform: [{ scale: scale.value }],
        };
      case 'slide':
        return {
          transform: [{ translateY: translateY.value }],
        };
      default:
        return {
          opacity: opacity.value,
        };
    }
  });

  const AnimatedView = Animated.View;

  const handleBackdropPress = () => {
    Keyboard.dismiss();
    onClose();
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <AnimatedView style={[styles.overlay, animatedOverlayStyle]}>
        <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
          <View />
        </Pressable>
        <AnimatedView style={[styles.content, animatedContentStyle, style]}>
          {children}
        </AnimatedView>
      </AnimatedView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.radius.xl,
    borderTopRightRadius: spacing.radius.xl,
    padding: spacing.padding.xl,
    paddingBottom: spacing.padding.xxxl,
    maxHeight: '90%',
  },
});
