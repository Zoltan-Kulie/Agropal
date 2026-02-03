import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './hooks/useAuth';
import { colors, spacing } from './theme';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = {
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
};
