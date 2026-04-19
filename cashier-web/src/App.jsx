import { useState } from "react";
import ShopCodeEntry from "./components/ShopCodeEntry";
import WaitingState from "./components/WaitingState";
import PaymentConfirmed from "./components/PaymentConfirmed";
import TimeoutWarning from "./components/TimeoutWarning";

function App() {
  const [screen, setScreen] = useState("entry");
  const [shopId, setShopId] = useState(null);
  const [payment, setPayment] = useState(null);

  if (screen === "entry") {
    return (
      <ShopCodeEntry
        setScreen={setScreen}
        setShopId={setShopId}
      />
    );
  }
  if (screen === "waiting") {
    return (
      <WaitingState
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
