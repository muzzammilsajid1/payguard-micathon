import { useState, useEffect, useRef } from "react";
import { listenForPayments, getShopConfig } from "../shared/firebaseHelpers";

// -------------------------------------------------------
// Inject pulse keyframes into the document head.
// Matches the same pattern used in ShopCodeEntry.jsx.
// -------------------------------------------------------
const pulseKeyframes = `
  @keyframes pulse {
    0%   { transform: scale(1);   opacity: 1; }
    50%  { transform: scale(1.3); opacity: 0.6; }
    100% { transform: scale(1);   opacity: 1; }
  }
  @keyframes pulseRing {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(1.6); opacity: 0; }
  }
`;

if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.textContent = pulseKeyframes;
  document.head.appendChild(styleEl);
}

function WaitingState({ db, shopId, setScreen, setPayment }) {
  const [shopName, setShopName] = useState("");
  const unsubscribeRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Fetch human-readable shop name to avoid showing raw Firebase UID
    getShopConfig(db, shopId).then((config) => {
      if (config?.shopName) setShopName(config.shopName);
    });

    // Start listening for payments
    const unsubscribe = listenForPayments(db, shopId, (paymentData) => {
      setPayment(paymentData);
      setScreen("confirmed");
    });
    unsubscribeRef.current = unsubscribe;

    // Start 120-second timeout countdown
    const startTime = Date.now();
    const intervalId = setInterval(() => {
      if (Date.now() - startTime >= 120000) {
        setScreen("timeout");
      }
    }, 1000);
    timerRef.current = intervalId;

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [db, shopId, setScreen, setPayment]);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Pulsing circle indicator with ripple ring */}
        <div style={styles.pulseOuter}>
          {/* Ripple ring — expands and fades behind the inner dot */}
          <div style={styles.pulseRing} />
          {/* Inner dot — scales up and down */}
          <div style={styles.pulseInner} />
        </div>

        <h1 style={styles.heading}>Waiting for payment...</h1>
        <p style={styles.shopInfo}>{shopName || "Connected"}</p>
      </div>

      <p style={styles.footerText}>PayGuard is listening in real time</p>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1a1a1a",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  pulseOuter: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    border: "3px solid #00C853",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "32px",
    position: "relative",
    overflow: "visible",
  },
  pulseRing: {
    position: "absolute",
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    border: "3px solid #00C853",
    animation: "pulseRing 1.5s ease-out infinite",
  },
  pulseInner: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#00C853",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#ffffff",
    margin: 0,
  },
  shopInfo: {
    fontSize: "16px",
    color: "#aaaaaa",
    marginTop: "12px",
  },
  footerText: {
    position: "absolute",
    bottom: "32px",
    fontSize: "13px",
    color: "#aaaaaa",
  },
};

export default WaitingState;
