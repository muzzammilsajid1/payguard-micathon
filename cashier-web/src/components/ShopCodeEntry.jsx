import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../shared/firebaseConfig";

function ShopCodeEntry({ setScreen, setShopId }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function testFirebase() {
      try {
        console.log("Testing Firebase connection...");
        const shopsSnap = await getDocs(collection(db, "shops"));
        console.log("Shops count:", shopsSnap.size);
        shopsSnap.forEach(d => {
          console.log("Shop ID:", d.id, "Data:", JSON.stringify(d.data()));
        });
      } catch (err) {
        console.error("Firebase test error:", err);
      }
    }
    testFirebase();
  }, []);

  const handleConnect = async () => {
    setError("");
    if (code.length !== 4) {
      setError("Please enter a valid 4-digit shop code.");
      return;
    }
    setLoading(true);
    try {
      const shopsSnap = await getDocs(collection(db, "shops"));
      console.log("Connect attempt - shops found:", shopsSnap.size);
      let foundShopId = null;
      for (const shopDoc of shopsSnap.docs) {
        console.log("Checking shop:", shopDoc.id, shopDoc.data());
        const configRef = doc(db, "shops", shopDoc.id, "config", "main");
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
          const data = configSnap.data();
          console.log("Config data:", data);
          if (data.cashierCode === code) {
            foundShopId = shopDoc.id;
            break;
          }
        }
      }
      if (foundShopId) {
        setShopId(foundShopId);
        setScreen("waiting");
      } else {
        setError("No shop found with that code. Try again.");
      }
    } catch (err) {
      console.error("Firebase error:", err);
      setError("Connection failed. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>PayGuard</h1>
        <p style={styles.subtitle}>Cashier Terminal</p>
        <div style={styles.formGroup}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="Shop code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            style={styles.input}
            autoFocus
          />
          <button style={styles.button} onClick={handleConnect} disabled={loading}>
            {loading ? "Connecting..." : "Connect"}
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { width: "100%", height: "100%", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" },
  content: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  title: { fontSize: "40px", fontWeight: "bold", color: "#0f0f0f", margin: 0 },
  subtitle: { fontSize: "16px", color: "#aaaaaa", marginTop: "8px" },
  formGroup: { marginTop: "48px", display: "flex", flexDirection: "column", alignItems: "center" },
  input: { width: "280px", fontSize: "32px", textAlign: "center", letterSpacing: "8px", padding: "20px", border: "2px solid #e0e0e0", borderRadius: "12px" },
  button: { width: "280px", marginTop: "16px", padding: "18px", fontSize: "18px", fontWeight: "bold", color: "#ffffff", backgroundColor: "#00C853", borderRadius: "12px", cursor: "pointer", border: "none" },
  error: { marginTop: "16px", fontSize: "14px", color: "#FF5252" },
};

export default ShopCodeEntry;
