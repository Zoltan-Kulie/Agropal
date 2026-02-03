import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-i18next/getLocales';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to Agro-Force',
      phoneEntry: 'Enter your phone number',
      otpVerify: 'Verify your phone',
      roleSelect: 'Select your role',
      worker: 'Worker',
      producer: 'Producer',
      leader: 'Team Leader',
      // Navigation
      jobs: 'Jobs',
      applied: 'Applied',
      contracts: 'Contracts',
      chat: 'Chat',
      profile: 'Profile',
      settings: 'Settings',
      // Common
      review: 'Review',
      messages: 'Messages',
      // Job Feed
      jobFeed: 'Find Jobs',
      jobDetail: 'Job Details',
      apply: 'Apply',
      // Producer
      dashboard: 'Dashboard',
      createJob: 'Create Job',
      applicants: 'Applicants',
      // Stats
      activeJobs: 'Active Jobs',
      completedJobs: 'Completed Jobs',
      totalContracts: 'Total Contracts',
      totalEarned: 'Total Earned',
    },
  },
  el: {
    translation: {
      welcome: 'Καλωρίσασμα στο Agro-Force',
      phoneEntry: 'Εισάγετε τον αριθμό σας',
      otpVerify: 'Επαληθεύστε το τηλέφωνό σας',
      roleSelect: 'Επιλέξτε τον ρόλο σας',
      worker: 'Εργάτης',
      producer: 'Παραγωγός',
      leader: 'Ομαδάρχης',
      // Navigation
      jobs: 'Εργασίες',
      applied: 'Υποβληθείσες',
      contracts: 'Συμβόλαι',
      chat: 'Συνομιλίες',
      profile: 'Προφίλ',
      settings: 'Ρυθμίσεις',
      // Common
      review: 'Αξιολόγηση',
      messages: 'Μηνύματα',
      // Job Feed
      jobFeed: 'Εύρεση Εργασιών',
      jobDetail: 'Λεπτομέρειες Εργασίας',
      apply: 'Αίτηση',
      // Producer
      dashboard: 'Πίνακας',
      createJob: 'Δημιουργία Εργασίας',
      applicants: 'Υποψήφιοι',
      // Stats
      activeJobs: 'Ενεργές Εργασίες',
      completedJobs: 'Ολοκληρωμένες Εργασίες',
      totalContracts: 'Σύνολο Συμβολαίων',
      totalEarned: 'Συνολικά Κερδισμένα',
    },
  },
};

i18n.use(initReactI18next, {
  resources,
  lng: 'el',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: true,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
