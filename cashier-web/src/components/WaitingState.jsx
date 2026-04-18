import { useEffect, useRef } from "react";
import { listenForPayments } from "../../../shared/firebaseHelpers";

function WaitingState({ db, shopId, setScreen, setPayment }) {
  const unsubscribeRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
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
        {/* Pulsing circle indicator */}
        <div style={styles.pulseOuter}>
          <div style={styles.pulseInner} />
        </div>

        <h1 style={styles.heading}>Waiting for payment...</h1>
        <p style={styles.shopInfo}>Shop: {shopId}</p>
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
