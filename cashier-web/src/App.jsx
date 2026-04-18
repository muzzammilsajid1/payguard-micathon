import { useState, useRef, useEffect } from "react";
import { initFirebase } from "../../shared/firebaseHelpers";
import ShopCodeEntry from "./components/ShopCodeEntry";
import WaitingState from "./components/WaitingState";
import PaymentConfirmed from "./components/PaymentConfirmed";
import TimeoutWarning from "./components/TimeoutWarning";

function App() {
  const [screen, setScreen] = useState("entry");
  const [shopId, setShopId] = useState(null);
  const [payment, setPayment] = useState(null);
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
  }, []);

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
