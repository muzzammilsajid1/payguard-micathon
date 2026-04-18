import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import LoginScreen from './screens/LoginScreen';
import ShopSetupScreen from './screens/ShopSetupScreen';
import ListeningDashboardScreen from './screens/ListeningDashboardScreen';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCAXQ3S8vG0SlxkCVSt8tr-pPP4G74JPDY",
  authDomain: "payguard-6b2e1.firebaseapp.com",
  projectId: "payguard-6b2e1",
  storageBucket: "payguard-6b2e1.firebasestorage.app",
  messagingSenderId: "515008564050",
  appId: "1:515008564050:web:ecb37ec41c3e804a5c088b",
};

const Stack = createStackNavigator();

export default function App() {
  const [db, setDb] = useState(null);
  const [user, setUser] = useState(undefined); // undefined = still checking

  useEffect(() => {
    // Initialize Firebase and store the Firestore instance
    let app;
    if (getApps().length > 0) {
      app = getApps()[0];
    } else {
      app = initializeApp(firebaseConfig);
    }
    const database = getFirestore(app);
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
