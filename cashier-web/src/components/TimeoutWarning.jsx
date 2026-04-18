function TimeoutWarning({ setScreen }) {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Warning icon: exclamation in a circle */}
        <div style={styles.iconCircle}>
          <span style={styles.iconText}>!</span>
        </div>

        <h1 style={styles.heading}>No payment detected yet</h1>

        <p style={styles.description}>
          Ask the customer to complete the transfer and wait for the green light.
        </p>

        <button style={styles.retryButton} onClick={() => setScreen("waiting")}>
          Try Again
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#B71C1C",
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
  iconCircle: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    border: "3px solid #ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
  },
  iconText: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#ffffff",
    lineHeight: 1,
  },
  heading: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#ffffff",
    margin: 0,
  },
  description: {
    fontSize: "18px",
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: "12px",
    maxWidth: "320px",
    lineHeight: 1.5,
  },
  retryButton: {
    marginTop: "32px",
    padding: "16px 48px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#B71C1C",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    cursor: "pointer",
    border: "none",
    transition: "opacity 0.2s ease",
  },
};

export default TimeoutWarning;
