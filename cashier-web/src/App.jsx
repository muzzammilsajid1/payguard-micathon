import { useState, useRef, useEffect } from "react";
import { initFirebase } from "../../shared/firebaseHelpers";
import ShopCodeEntry from "./components/ShopCodeEntry";
import WaitingState from "./components/WaitingState";
import PaymentConfirmed from "./components/PaymentConfirmed";
import TimeoutWarning from "./components/TimeoutWarning";

// -------------------------------------------------------
// Inject spin keyframe for the DB-ready loading spinner.
// Same pattern as ShopCodeEntry.jsx and WaitingState.jsx.
// -------------------------------------------------------
const spinKeyframes = `
  @keyframes spin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.textContent = spinKeyframes;
  document.head.appendChild(styleEl);
}

function App() {
  const [screen, setScreen] = useState("entry");
  const [shopId, setShopId] = useState(null);
  const [payment, setPayment] = useState(null);
  // Guards against passing db={null} to child components before Firebase is ready
  const [dbReady, setDbReady] = useState(false);
  const dbRef = useRef(null);

  useEffect(() => {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    const db = initFirebase(firebaseConfig);
    dbRef.current = db;
    // Signal that db is ready — re-render will now show screens with a valid db
    setDbReady(true);
  }, []);

  // Block all screen rendering until Firebase is initialized.
  // In practice this is one frame, but it closes the race condition entirely.
  if (!dbReady) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid #333",
            borderTopColor: "#00C853",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (screen === "entry") {
    return (
      <ShopCodeEntry
        db={dbRef.current}
        setScreen={setScreen}
        setShopId={setShopId}
      />
    );
  }

  if (screen === "waiting") {
    return (
      <WaitingState
        db={dbRef.current}
        shopId={shopId}
        setScreen={setScreen}
        setPayment={setPayment}
      />
    );
  }

  if (screen === "confirmed") {
    return <PaymentConfirmed payment={payment} setScreen={setScreen} />;
  }

  if (screen === "timeout") {
    return <TimeoutWarning setScreen={setScreen} />;
  }

  return null;
}

export default App;
