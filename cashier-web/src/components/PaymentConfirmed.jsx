import { useState, useEffect } from "react";

function PaymentConfirmed({ payment, setScreen }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in after a brief delay
    const timeout = setTimeout(() => {
      setVisible(true);
    }, 50);
    return () => clearTimeout(timeout);
  }, []);

  const formatAmount = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return `Rs. ${amount}`;
    return `Rs. ${num.toLocaleString("en-IN")}`;
  };

  const formatTimestamp = (timestamp) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    return `${time} · ${day} ${month}`;
  };

  return (
    <div
      className="fade-in"
      style={{
        ...styles.container,
        opacity: visible ? 1 : 0,
      }}
    >
      <div style={styles.content}>
        <p style={styles.platform}>
          {payment?.platform?.toUpperCase() || "UPI"}
        </p>

        <h1 style={styles.amount}>{formatAmount(payment?.amount)}</h1>

        <p style={styles.sender}>From: {payment?.sender || "Unknown"}</p>

        <p style={styles.timestamp}>
          {formatTimestamp(payment?.timestamp || new Date())}
        </p>
      </div>

      <button style={styles.resetButton} onClick={() => setScreen("waiting")}>
        Next customer
      </button>

      <button style={styles.newShopLink} onClick={() => setScreen("entry")}>
        Change shop
      </button>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#00C853",
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
    padding: "24px",
  },
  platform: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: "3px",
    margin: 0,
    textTransform: "uppercase",
  },
  amount: {
    fontSize: "clamp(48px, 15vw, 96px)",
    fontWeight: 900,
    color: "#ffffff",
    margin: 0,
    marginTop: "16px",
    lineHeight: 1.1,
  },
  sender: {
    fontSize: "20px",
    color: "#ffffff",
    marginTop: "16px",
    margin: 0,
    paddingTop: "16px",
  },
  timestamp: {
    fontSize: "16px",
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: "8px",
    margin: 0,
    paddingTop: "8px",
  },
  resetButton: {
    position: "fixed",
    bottom: "56px",
    right: "24px",
    backgroundColor: "transparent",
    border: "1px solid #ffffff",
    color: "#ffffff",
    fontSize: "13px",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },
  newShopLink: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    backgroundColor: "transparent",
    border: "none",
    color: "rgba(255, 255, 255, 0.65)",
    fontSize: "12px",
    textDecoration: "underline",
    cursor: "pointer",
    padding: 0,
  },
};

export default PaymentConfirmed;
