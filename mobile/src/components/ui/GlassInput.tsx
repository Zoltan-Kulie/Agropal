import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}) => {
  const borderColor = error ? colors.error : colors.borderHighlight;
  const backgroundColor = error ? 'rgba(229, 115, 115, 0.1)' : colors.glassTint;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor,
          },
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.primary}
          {...props}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.margin.lg,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.margin.xs,
    marginLeft: spacing.margin.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassTint,
    borderRadius: spacing.radius.md,
    borderWidth: spacing.border.normal,
    borderColor: colors.borderHighlight,
    paddingHorizontal: spacing.padding.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.padding.sm,
  },
  iconLeft: {
    marginRight: spacing.margin.sm,
  },
  iconRight: {
    marginLeft: spacing.margin.sm,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.margin.xs,
    marginLeft: spacing.margin.xs,
  },
});
