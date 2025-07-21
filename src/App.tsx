import { useState } from "react";
import { assertIsBroadcastTxSuccess, SigningStargateClient } from "@cosmjs/stargate";
import { Registry } from "@cosmjs/proto-signing";
import { MsgIssue } from "coreum-js";
import { GasPrice } from "@cosmjs/stargate";

const rpc = "https://full-node.testnet-1.coreum.dev:26657";

const App = () => {
  const [log, setLog] = useState("Ready.");

  const appendLog = (msg: string) => {
    setLog((prev) => prev + "\n" + msg);
  };

  const handleMint = async () => {
    try {
      appendLog("🔍 Connecting to wallet...");
      const offlineSigner = await window.keplr.getOfflineSignerAuto("coreum-testnet");
      const accounts = await offlineSigner.getAccounts();
      const sender = accounts[0].address;
      appendLog(`🔑 Wallet connected: ${sender}`);

      const registry = new Registry();
      registry.register("/coreum.asset.ft.v1.MsgIssue", MsgIssue);
      appendLog("📦 MsgIssue type registered in Registry.");

      const client = await SigningStargateClient.connectWithSigner(rpc, offlineSigner, {
        registry,
        gasPrice: GasPrice.fromString("0.25ucore"),
      });

      appendLog("🔧 Stargate client connected.");

      const balances = await client.getAllBalances(sender);
      appendLog(`💰 Wallet Balances: ${JSON.stringify(balances)}`);

      const msg = {
        typeUrl: "/coreum.asset.ft.v1.MsgIssue",
        value: MsgIssue.fromPartial({
          issuer: sender,
          symbol: "TEST",
          subunit: "utest",
          precision: 6,
          initialAmount: "1000000",
          description: "Test Token",
          features: [],
        }),
      };

      appendLog(`📨 Msg constructed: ${JSON.stringify(msg)}`);

      const fee = {
        amount: [{ denom: "ucore", amount: "5000" }],
        gas: "200000",
      };

      appendLog("🚀 Broadcasting mint transaction...");

      const result = await client.signAndBroadcast(sender, [msg], fee);
      assertIsBroadcastTxSuccess(result);

      appendLog("✅ Mint successful: " + JSON.stringify(result));
    } catch (err: any) {
      appendLog(`⚠️ Error: ${err.message || err}`);
    }
  };

  return (
    <div style={{ fontFamily: "monospace", marginTop: "2rem", background: "#000", color: "#0f0", padding: "1rem" }}>
      <h2>🧪 Coreum Mint Demo (Testnet)</h2>
      <button onClick={handleMint} style={{ margin: "1rem 0", padding: "0.5rem 1rem" }}>Mint</button>
      <pre>{log}</pre>
    </div>
  );
};

export default App;
