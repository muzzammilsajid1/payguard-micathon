import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

// ---- Inlined from shared/firebaseHelpers ----
async function writeShopConfig(db, shopId, configObj) {
  try {
    // Write the parent shop document so it appears in collection queries
    const shopRef = doc(db, 'shops', shopId);
    await setDoc(shopRef, { shopId: shopId }, { merge: true });

    // Write config to subcollection
    const configRef = doc(db, 'shops', shopId, 'config', 'main');
    await setDoc(configRef, configObj, { merge: true });
  } catch (error) {
    console.error('Error writing shop config:', error);
  }
}

async function getShopConfig(db, shopId) {
  try {
    const configRef = doc(db, 'shops', shopId, 'config', 'main');
    const snap = await getDoc(configRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting shop config:', error);
    return null;
  }
}

export default function ShopSetupScreen({ navigation, db }) {
  const [shopName, setShopName] = useState('');
  const [cashierCode, setCashierCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  // Pre-fill from existing config
  useEffect(() => {
    if (!uid || !db) return;
    (async () => {
      try {
        const config = await getShopConfig(db, uid);
        if (config) {
          setShopName(config.shopName || '');
          setCashierCode(config.cashierCode || '');
        }
      } catch (err) {
        console.warn('[ShopSetup] Could not load existing config:', err);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [uid, db]);

  const handleSave = async () => {
    setError('');

    if (!shopName.trim()) {
      setError('Shop name cannot be empty.');
      return;
    }
    if (!/^\d{4}$/.test(cashierCode)) {
      setError('Cashier code must be exactly 4 digits.');
      return;
    }

    setLoading(true);
    try {
      await writeShopConfig(db, uid, {
        shopName: shopName.trim(),
        cashierCode,
      });
      navigation.replace('ListeningDashboard', {
        shopName: shopName.trim(),
        shopId: uid,
      });
    } catch (err) {
      setError('Failed to save config. Please try again.');
      console.warn('[ShopSetup] Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#00C853" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* ---- Title ---- */}
        <Text style={styles.title}>Shop Setup</Text>
        <Text style={styles.subtitle}>
          Your cashier will use this code to connect
        </Text>

        {/* ---- Shop Name ---- */}
        <Text style={styles.label}>Shop Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Ali Electronics"
          placeholderTextColor="#aaaaaa"
          value={shopName}
          onChangeText={setShopName}
        />

        {/* ---- Cashier Code ---- */}
        <Text style={styles.label}>4-Digit Cashier Code</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 1234"
          placeholderTextColor="#aaaaaa"
          keyboardType="numeric"
          maxLength={4}
          value={cashierCode}
          onChangeText={setCashierCode}
        />

        {/* ---- Save Button ---- */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Save and Start Listening</Text>
          )}
        </TouchableOpacity>

        {/* ---- Error ---- */}
        {error !== '' && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  loadingWrapper: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaaaaa',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    fontSize: 16,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#00C853',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
});
