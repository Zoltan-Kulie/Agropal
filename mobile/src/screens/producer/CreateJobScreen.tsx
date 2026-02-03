import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useCreateJob } from '../../hooks/useJobs';
import { GlassCard, GlassInput, GlassButton, colors, spacing, typography } from '../..';
import Animated, { FadeIn } from 'react-native-reanimated';

const CROP_TYPES = [
  'Olives', 'Grapes', 'Citrus', 'Fruits', 'Vegetables',
  'Cereals', 'Nuts', 'Tobacco', 'Cotton', 'Flowers'
];

export default function CreateJobScreen({ route, navigation }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cropType, setCropType] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [workersNeeded, setWorkersNeeded] = useState(1);
  const [dailyPay, setDailyPay] = useState('');
  const [accommodation, setAccommodation] = useState(false);
  const [food, setFood] = useState(false);
  const [transport, setTransport] = useState(false);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);

  const { mutate: createJob, isPending } = useCreateJob();

  const handleSubmit = async () => {
    if (!title || !cropType || !startDate || !endDate || !workersNeeded || !dailyPay) {
      alert('Please fill in all required fields');
      return;
    }

    const job = {
      title,
      description,
      crop_type: cropType,
      location_label: locationLabel,
      start_date: startDate,
      end_date: endDate,
      workers_needed: workersNeeded,
      daily_pay_eur: parseFloat(dailyPay),
      accommodation,
      food,
      transport,
      required_skills: requiredSkills,
    };

    try {
      const data = await createJob(job);
      if (data) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'JobPublish', params: { jobId: data.id } }],
        });
      }
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Failed to create job'));
    }
  };

  const toggleSkill = (skill: string) => {
    setRequiredSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(300)}>
          <Text style={styles.header}>Create New Job</Text>

          <GlassCard title="Job Information" style={styles.card}>
            <GlassInput
              label="Job Title *"
              placeholder="e.g., Olive Harvest Assistant"
              value={title}
              onChangeText={setTitle}
            />

            <GlassInput
              label="Description"
              placeholder="Describe the work..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />

            <GlassInput
              label="Crop Type *"
              placeholder="Select crop type"
              value={cropType}
              onChangeText={setCropType}
            />

            <GlassInput
              label="Location *"
              placeholder="Farm address or region"
              value={locationLabel}
              onChangeText={setLocationLabel}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <GlassInput
                  label="Start Date *"
                  placeholder="YYYY-MM-DD"
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>
              <View style={styles.halfWidth}>
                <GlassInput
                  label="End Date *"
                  placeholder="YYYY-MM-DD"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <GlassInput
                  label="Workers Needed *"
                  placeholder="Number of workers"
                  keyboardType="number-pad"
                  value={workersNeeded.toString()}
                  onChangeText={(text) => setWorkersNeeded(parseInt(text) || 1)}
                />
              </View>
              <View style={styles.halfWidth}>
                <GlassInput
                  label="Daily Pay (€) *"
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={dailyPay}
                  onChangeText={setDailyPay}
                />
              </View>
            </View>
          </GlassCard>

          <GlassCard title="Perks (Optional)" style={styles.card}>
            <View style={styles.perksRow}>
              <View style={styles.perkItem}>
                <Text style={styles.perkText}>🏠 Accommodation</Text>
                <GlassButton
                  title={accommodation ? 'Yes' : 'No'}
                  variant={accommodation ? 'primary' : 'outline'}
                  onPress={() => setAccommodation(!accommodation)}
                  style={styles.perkButton}
                />
              </View>
              <View style={styles.perkItem}>
                <Text style={styles.perkText}>🍽️ Food</Text>
                <GlassButton
                  title={food ? 'Yes' : 'No'}
                  variant={food ? 'primary' : 'outline'}
                  onPress={() => setFood(!food)}
                  style={styles.perkButton}
                />
              </View>
              <View style={styles.perkItem}>
                <Text style={styles.perkText}>🚗 Transport</Text>
                <GlassButton
                  title={transport ? 'Yes' : 'No'}
                  variant={transport ? 'primary' : 'outline'}
                  onPress={() => setTransport(!transport)}
                  style={styles.perkButton}
                />
              </View>
            </View>
          </GlassCard>

          <GlassCard title="Required Skills" style={styles.card}>
            <View style={styles.skillsContainer}>
              {['Harvesting', 'Pruning', 'Sorting', 'Driving', 'Machinery'].map((skill) => (
                <GlassButton
                  key={skill}
                  title={skill}
                  variant={requiredSkills.includes(skill) ? 'primary' : 'outline'}
                  onPress={() => toggleSkill(skill)}
                  style={styles.skillButton}
                />
              ))}
            </View>
          </GlassCard>

          <View style={styles.buttonRow}>
            <GlassButton
              title="Cancel"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            />
            <GlassButton
              title={isPending ? 'Creating...' : 'Create Job'}
              onPress={handleSubmit}
              loading={isPending}
              style={styles.submitButton}
            />
          </View>
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
  },
  card: {
    marginBottom: spacing.margin.lg,
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.margin.md,
  },
  halfWidth: {
    flex: 1,
  },
  perksRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  perkItem: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.margin.xs,
  },
  perkText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  perkButton: {
    paddingHorizontal: spacing.padding.md,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.margin.xs,
  },
  skillButton: {
    paddingHorizontal: spacing.padding.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.margin.xl,
    paddingHorizontal: spacing.section,
  },
  submitButton: {
    flex: 2,
  },
  cancelButton: {
    flex: 1,
  },
});
