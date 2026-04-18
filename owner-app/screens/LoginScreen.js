import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (isNewAccount) => {
    setError('');
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      if (isNewAccount) {
        await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      } else {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      }
      navigation.replace('ShopSetup');
    } catch (err) {
      const msg = firebaseErrorMessage(err.code);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* ---- Branding ---- */}
        <Text style={styles.title}>PayGuard</Text>
        <Text style={styles.subtitle}>Owner App</Text>

        {/* ---- Inputs ---- */}
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#aaaaaa"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaaaaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* ---- Login Button ---- */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => handleAuth(false)}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* ---- Create Account ---- */}
        <TouchableOpacity
          onPress={() => handleAuth(true)}
          activeOpacity={0.7}
          disabled={loading}
        >
          <Text style={styles.createAccountText}>
            New here? <Text style={styles.createAccountHighlight}>Create Account</Text>
          </Text>
        </TouchableOpacity>

        {/* ---- Error Message ---- */}
        {error !== '' && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ---------- Helpers ----------
function firebaseErrorMessage(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try logging in.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Authentication failed. Please try again.';
  }
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaaaaa',
    marginBottom: 40,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    fontSize: 16,
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#00C853',
    width: '100%',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createAccountText: {
    color: '#aaaaaa',
    fontSize: 14,
    marginBottom: 20,
  },
  createAccountHighlight: {
    color: '#00C853',
    fontWeight: '600',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
});
