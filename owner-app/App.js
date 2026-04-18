import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import LoginScreen from './screens/LoginScreen';
import ShopSetupScreen from './screens/ShopSetupScreen';
import ListeningDashboardScreen from './screens/ListeningDashboardScreen';
import { initFirebase } from '../shared/firebaseHelpers';

// ---------- Firebase Config from .env ----------
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const Stack = createStackNavigator();

export default function App() {
  const [db, setDb] = useState(null);
  const [user, setUser] = useState(undefined); // undefined = still checking

  useEffect(() => {
    // Initialize Firebase and store the Firestore instance
    const database = initFirebase(firebaseConfig);
    setDb(database);

    // Watch auth state
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // null if logged out, user object if logged in
    });

    return unsubscribe;
  }, []);

  // ---------- Loading splash while auth state resolves ----------
  if (user === undefined || db === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Starting PayGuard...</Text>
        <ActivityIndicator size="large" color="#00C853" style={styles.spinner} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? 'ListeningDashboard' : 'Login'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} db={db} />}
        </Stack.Screen>

        <Stack.Screen name="ShopSetup">
          {(props) => <ShopSetupScreen {...props} db={db} />}
        </Stack.Screen>

        <Stack.Screen name="ListeningDashboard">
          {(props) => <ListeningDashboardScreen {...props} db={db} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  spinner: {
    marginTop: 8,
  },
});
