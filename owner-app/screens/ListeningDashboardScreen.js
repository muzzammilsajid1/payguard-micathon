import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { startListening } from '../smsListener';
import { writePayment, listenForPayments } from '../../shared/firebaseHelpers';

// ---------- Pulse animation hook ----------
function usePulse() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.4,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [scale]);

  return scale;
}

// ---------- Helpers ----------
function isToday(dateString) {
  const d = new Date(dateString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatTime(dateString) {
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatAmount(amount) {
  const num = Number(amount);
  if (isNaN(num)) return `Rs. ${amount}`;
  return `Rs. ${num.toLocaleString()}`;
}

// ---------- Main Screen ----------
export default function ListeningDashboardScreen({ route, db }) {
  const shopName = route?.params?.shopName || 'My Shop';
  const shopId = route?.params?.shopId || '';

  const [payments, setPayments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  const [manualPlatform, setManualPlatform] = useState('EasyPaisa');

  const pulseScale = usePulse();

  // ---- Start SMS listener & Firestore subscription ----
  useEffect(() => {
    if (!db || !shopId) return;

    const smsHandle = startListening(db, shopId);

    const unsubscribe = listenForPayments(db, shopId, (payment) => {
      setPayments((prev) => [payment, ...prev]);
    });

    return () => {
      smsHandle.stop();
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [db, shopId]);

  // Filter to today only
  const todayPayments = payments.filter((p) => isToday(p.timestamp));

  // ---- Manual payment handler ----
  const handleManualConfirm = async () => {
    if (!manualAmount.trim()) return;
    try {
      await writePayment(db, shopId, {
        platform: manualPlatform,
        amount: Number(manualAmount),
        sender: 'Manual Entry',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[Dashboard] Manual payment error:', err);
    }
    setManualAmount('');
    setManualPlatform('EasyPaisa');
    setModalVisible(false);
  };

  // ---- Renderers ----
  const renderPayment = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.platform}>{item.platform}</Text>
        <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
      </View>
      <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
      <Text style={styles.sender}>{item.sender}</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No payments yet today</Text>
    </View>
  );

  const PLATFORMS = ['EasyPaisa', 'JazzCash', 'Raast'];

  return (
    <SafeAreaView style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      {/* ---- Header ---- */}
      <View style={styles.header}>
        <Text style={styles.shopName} numberOfLines={1}>
          {shopName}
        </Text>
        <View style={styles.listeningRow}>
          <Animated.View
            style={[styles.pulseDot, { transform: [{ scale: pulseScale }] }]}
          />
          <Text style={styles.listeningText}>Listening</Text>
        </View>
      </View>

      {/* ---- Payment List ---- */}
      <FlatList
        data={todayPayments}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderPayment}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          todayPayments.length === 0 ? styles.listEmpty : styles.listContent
        }
        style={styles.list}
      />

      {/* ---- Manual Payment Button ---- */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.manualButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.manualButtonText}>Mark Payment Manually</Text>
        </TouchableOpacity>
      </View>

      {/* ---- Manual Payment Modal ---- */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Manual Payment</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Amount"
              placeholderTextColor="#aaaaaa"
              keyboardType="numeric"
              value={manualAmount}
              onChangeText={setManualAmount}
            />

            <View style={styles.platformRow}>
              {PLATFORMS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.platformChip,
                    manualPlatform === p && styles.platformChipActive,
                  ]}
                  onPress={() => setManualPlatform(p)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.platformChipText,
                      manualPlatform === p && styles.platformChipTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleManualConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  shopName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flexShrink: 1,
    marginRight: 12,
  },
  listeningRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00C853',
    marginRight: 6,
  },
  listeningText: {
    color: '#00C853',
    fontSize: 14,
    fontWeight: '600',
  },

  // List
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Card
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    marginVertical: 6,
    marginHorizontal: 4,
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  platform: {
    color: '#00C853',
    fontSize: 14,
    fontWeight: 'bold',
  },
  time: {
    color: '#aaaaaa',
    fontSize: 12,
  },
  amount: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sender: {
    color: '#aaaaaa',
    fontSize: 13,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
  },
  emptyText: {
    color: '#aaaaaa',
    fontSize: 16,
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#1e1e1e',
  },
  manualButton: {
    borderWidth: 1.5,
    borderColor: '#00C853',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  manualButtonText: {
    color: '#00C853',
    fontSize: 15,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#0f0f0f',
    color: '#ffffff',
    fontSize: 16,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  platformRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  platformChip: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#aaaaaa',
    alignItems: 'center',
  },
  platformChipActive: {
    borderColor: '#00C853',
    backgroundColor: 'rgba(0,200,83,0.12)',
  },
  platformChipText: {
    color: '#aaaaaa',
    fontSize: 13,
    fontWeight: '600',
  },
  platformChipTextActive: {
    color: '#00C853',
  },
  confirmButton: {
    backgroundColor: '#00C853',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#aaaaaa',
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
