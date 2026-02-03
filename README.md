# Agro-Force - Agricultural Job Marketplace

**Status:** Implementation in Progress

## Project Overview

Agro-Force is a greenfield mobile agricultural job marketplace connecting producers (farmers) with seasonal workers. Built with Expo (React Native 0.76+), Supabase backend, and Stripe payments.

## Tech Stack

- **Mobile:** Expo SDK 52+, React Native 0.76+ with New Architecture, TypeScript
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **Payments:** Stripe (5€ job publication fee)
- **State/Data:** TanStack Query
- **Animations:** react-native-reanimated
- **i18n:** i18next (24 languages)
- **Maps:** react-native-maps (Google Maps)
- **Push Notifications:** Expo Push Notifications

## Completed Work

### 1. Database & Backend (`supabase/`)

#### Migrations
- ✅ `20240101000000_initial_schema.sql` - All database tables with constraints
  - profiles, worker_profiles, producer_profiles
  - jobs, job_payments, applications, contracts, reviews
  - conversations, messages, reports
  - PostGIS extension for geospatial queries
  - Indexes for performance

- ✅ `20240101000001_rls_policies.sql` - Row Level Security policies
  - All tables have RLS enabled
  - No permissive policies
  - Proper role-based access control

- ✅ `20240101000002_functions.sql` - Database functions
  - `recompute_reliability_score()` - Calculates worker reliability
  - `publish_job()` - Publishes job after payment
  - `accept_application()` - Accepts worker, creates contract
  - `complete_contract()` - Completes contract, updates score
  - Helper functions for searching and suggestions

- ✅ `20240101000003_triggers.sql` - Database triggers
  - Auto-create profile on auth.users creation
  - Update conversation timestamps on messages
  - Recalculate reliability on contract/review changes
  - Notification triggers for applications

#### Edge Functions
- ✅ `functions/create-checkout-session/index.ts` - Stripe checkout session creation
- ✅ `functions/stripe-webhook/index.ts` - Stripe webhook handler

### 2. Mobile App (`mobile/`)

#### Project Setup
- ✅ `package.json` - Dependencies configured (Expo SDK 52+, React Native 0.76+)
- ✅ `app.json` - Expo configuration with New Architecture enabled
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `babel.config.js` - Babel with reanimated plugin

#### Design System (`src/theme/`)
- ✅ `colors.ts` - Olive Horizon palette (Primary: #8BCF9B, Accent: #E6A95C)
- ✅ `spacing.ts` - 4px base unit spacing system
- ✅ `typography.ts` - Font sizes, weights, line heights
- ✅ `index.ts` - Theme exports

#### UI Components (`src/components/ui/`)
- ✅ `GlassCard.tsx` - Glassmorphism card with animation
- ✅ `GlassButton.tsx` - Primary/secondary/accent/outline buttons with haptics
- ✅ `GlassInput.tsx` - Form inputs with validation styles
- ✅ `GlassModal.tsx` - Full-screen modal with animations
- ✅ `GlassBottomSheet.tsx` - iOS-style bottom sheet with gestures
- ✅ `Avatar.tsx` - User avatar with initials fallback
- ✅ `RatingStars.tsx` - Interactive 1-5 star rating
- ✅ `Skeleton.tsx` - Loading skeletons (text, avatar, card)

#### Hooks (`src/hooks/`)
- ✅ `useHaptics.ts` - Haptic feedback utility

#### Services (`src/services/`)
- ✅ `supabase.ts` - Supabase client with auth helpers

#### Types (`src/types/`)
- ✅ `database.ts` - Full TypeScript types for all database tables

## Remaining Work

### High Priority (Core Features)

1. **Navigation Structure**
   - Create AuthNavigator (phone, OTP, role selection)
   - Create WorkerTabs (Jobs, Applied, Contracts, Chat, Profile)
   - Create ProducerTabs (Jobs, Applicants, Contracts, Chat, Profile)
   - Set up React Navigation v7

2. **Custom Hooks**
   - `useAuth.ts` - Authentication state and methods
   - `useJobs.ts` - Job CRUD operations with TanStack Query
   - `useApplications.ts` - Application management
   - `useContracts.ts` - Contract operations
   - `useChat.ts` - Realtime messaging
   - `useProfile.ts` - Profile management

3. **Auth Screens** (`src/screens/auth/`)
   - PhoneEntryScreen.tsx
   - OTPVerifyScreen.tsx
   - RoleSelectScreen.tsx

4. **Worker Screens** (`src/screens/worker/`)
   - JobFeedScreen.tsx
   - JobDetailScreen.tsx
   - ApplyScreen.tsx
   - MyApplicationsScreen.tsx
   - ContractsScreen.tsx
   - ProfileScreen.tsx

5. **Producer Screens** (`src/screens/producer/`)
   - DashboardScreen.tsx
   - CreateJobScreen.tsx
   - JobPublishScreen.tsx
   - ApplicantsScreen.tsx
   - ContractsScreen.tsx
   - ProfileScreen.tsx

6. **Common Screens** (`src/screens/common/`)
   - SettingsScreen.tsx
   - ReviewScreen.tsx
   - ChatListScreen.tsx
   - ChatScreen.tsx

### Medium Priority (Features)

7. **i18n Setup** (`src/i18n/`)
   - Configure i18next
   - Create locale files for 24 languages:
     - el (Greek - default), en (English - fallback)
     - fr, de, es, it, pt, nl, pl, ro, bg
     - sv, da, fi, cs, sk, hu, hr, sl
     - et, lv, lt, ga, mt

8. **Realtime Chat**
   - Supabase Realtime subscriptions
   - Message streaming
   - Typing indicators (optional)

9. **Push Notifications**
   - Expo Push Notifications setup
   - Token registration
   - Notification handlers for:
     - New applications
     - Application status changes
     - New messages
     - Contract updates

10. **Google Maps Integration**
    - Display job locations
    - User location picker
    - Harvest route suggestions
    - Geocoding API

11. **WOW Features**
    - Reliability Score display
    - Harvest Route suggestions (geospatial queries)
    - One-tap Rehire (invite past workers)
    - Emergency Workers toggle/filter

### Low Priority (Polish)

12. **Animations**
    - Screen transitions
    - Loading states
    - Button press effects
    - Smooth animations (220-320ms ease-out)

13. **Testing & Verification**
    - Unit tests for hooks
    - Integration tests for flows
    - E2E tests for critical paths
    - RLS policy verification

## Project Structure

```
Agropal/
├── mobile/                      # Expo React Native app
│   ├── src/
│   │   ├── app/                # App entry, providers
│   │   ├── components/
│   │   │   ├── ui/            # Design system components ✅
│   │   │   └── common/        # Common components (JobCard, etc.)
│   │   ├── navigation/         # Navigation structure
│   │   ├── screens/            # All screens
│   │   │   ├── auth/
│   │   │   ├── worker/
│   │   │   ├── producer/
│   │   │   └── common/
│   │   ├── hooks/             # Custom hooks (partially done)
│   │   ├── services/           # Supabase client ✅
│   │   ├── i18n/             # Internationalization
│   │   ├── theme/             # Design system ✅
│   │   ├── types/             # TypeScript types ✅
│   │   └── utils/             # Utility functions
│   ├── assets/
│   ├── package.json ✅
│   ├── app.json ✅
│   ├── tsconfig.json ✅
│   └── babel.config.js ✅
│
├── supabase/                   # Supabase backend
│   ├── migrations/             # Database migrations ✅
│   │   ├── 20240101000000_initial_schema.sql ✅
│   │   ├── 20240101000001_rls_policies.sql ✅
│   │   ├── 20240101000002_functions.sql ✅
│   │   └── 20240101000003_triggers.sql ✅
│   └── functions/              # Edge Functions ✅
│       ├── create-checkout-session/index.ts ✅
│       └── stripe-webhook/index.ts ✅
│
└── README.md
```

## Next Steps

To continue implementation:

1. Install dependencies:
   ```bash
   cd mobile
   npm install
   ```

2. Set up environment variables in `mobile/.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Continue with:
   - Navigation structure
   - Custom hooks
   - Auth screens
   - Worker/Producer screens

## Notes

- React Native 0.76+ requires New Architecture (enabled by default)
- All database tables have RLS with no permissive policies
- Payment flow requires Stripe API keys in Supabase Edge Functions
- i18n will support 24 languages with Greek (el) as default

## Definition of Done Checklist

From spec Section 11:

- [ ] Producer publishes job after payment
- [ ] Worker applies
- [ ] Producer accepts
- [ ] Contract created
- [ ] Chat works
- [ ] Reviews + reliability score update
- [ ] Multi-language works
- [ ] RLS verified
