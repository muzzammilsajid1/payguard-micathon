import { useState } from "react";
import { getShopByCode } from "../../../shared/firebaseHelpers";

function ShopCodeEntry({ db, setScreen, setShopId }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setError("");

    if (code.length !== 4) {
      setError("Please enter a valid 4-digit shop code.");
      return;
    }

    setLoading(true);

    try {
      const shopId = await getShopByCode(db, code);

      if (shopId) {
        setShopId(shopId);
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleConnect();
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
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setCode(val);
            }}
            onKeyDown={handleKeyDown}
            style={styles.input}
            onFocus={(e) => {
              e.target.style.borderColor = "#00C853";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e0e0e0";
            }}
            autoFocus
          />

          <button
            style={{
              ...styles.button,
              opacity: loading ? 0.8 : 1,
            }}
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.spinnerWrapper}>
                <span style={styles.spinner} />
                <span>Connecting...</span>
              </span>
            ) : (
              "Connect"
            )}
          </button>

          {error && <p style={styles.error}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

const spinnerKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject spinner keyframes
if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.textContent = spinnerKeyframes;
  document.head.appendChild(styleTag);
}

const styles = {
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  title: {
    fontSize: "40px",
    fontWeight: "bold",
    color: "#0f0f0f",
    margin: 0,
    letterSpacing: "-1px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#aaaaaa",
    marginTop: "8px",
    fontWeight: "400",
  },
  formGroup: {
    marginTop: "48px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  input: {
    width: "280px",
    fontSize: "32px",
    textAlign: "center",
    letterSpacing: "8px",
    padding: "20px",
    border: "2px solid #e0e0e0",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    color: "#0f0f0f",
    transition: "border-color 0.2s ease",
  },
  button: {
    width: "280px",
    marginTop: "16px",
    padding: "18px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#00C853",
    borderRadius: "12px",
    cursor: "pointer",
    border: "none",
    transition: "opacity 0.2s ease",
  },
  error: {
    marginTop: "16px",
    fontSize: "14px",
    color: "#FF5252",
    maxWidth: "280px",
  },
  spinnerWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    display: "inline-block",
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
};

export default ShopCodeEntry;
