import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { GlassCard, GlassButton, GlassInput, colors, spacing, typography, RatingStars } from '../..';
import Animated, { FadeIn } from 'react-native-reanimated';

const REVIEW_TAGS = [
  'Punctual', 'Hardworking', 'Professional', 'Communicative',
  'Reliable', 'Skilled', 'Friendly'
];

export default function ReviewScreen({ route }: any) {
  const { contractId } = route.params || {};
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating (1-5)');
      return;
    }

    setIsSubmitting(true);

    // Would call useCreateReview hook here
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        'Review Submitted!',
        'Thank you for your feedback.',
        [{ text: 'OK', onPress: () => {} }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(300)}>
          <Text style={styles.header}>Leave a Review</Text>

          <GlassCard title="Your Rating" style={styles.card}>
            <View style={styles.ratingContainer}>
              <RatingStars
                rating={rating}
                onRatingChange={setRating}
                size={40}
              />
              <Text style={styles.ratingText}>
                {rating > 0 ? `${rating} stars` : 'Select rating'}
              </Text>
            </View>
          </GlassCard>

          <GlassCard title="What went well?" style={styles.card}>
            <View style={styles.tagContainer}>
              {REVIEW_TAGS.map((tag) => (
                <GlassButton
                  key={tag}
                  title={tag}
                  variant={selectedTags.includes(tag) ? 'primary' : 'outline'}
                  onPress={() => toggleTag(tag)}
                  style={styles.tagButton}
                />
              ))}
            </View>
          </GlassCard>

          <GlassInput
            label="Additional Comments (Optional)"
            placeholder="Share your experience..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          <GlassButton
            title={isSubmitting ? 'Submitting...' : 'Submit Review'}
            onPress={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
            style={styles.submitButton}
          />

          <GlassButton
            title="Cancel"
            variant="outline"
            onPress={() => {}}
            style={styles.cancelButton}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: spacing.padding.md,
  },
  header: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.section,
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.margin.lg,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.margin.lg,
  },
  ratingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.margin.sm,
  },
  tagButton: {
    paddingHorizontal: spacing.padding.sm,
    marginBottom: spacing.margin.sm,
  },
  textArea: {
    minHeight: 100,
  },
  submitButton: {
    marginBottom: spacing.margin.lg,
  },
  cancelButton: {
    marginBottom: spacing.margin.lg,
  },
});
