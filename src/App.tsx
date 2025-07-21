import { useState } from "react";
import { MsgIssue } from "coreum-js/dist/codegen/coreum/asset/ft/v1/tx";
import { Registry } from "@cosmjs/proto-signing";
import { SigningStargateClient, GasPrice } from "@cosmjs/stargate";
import { assertIsBroadcastTxSuccess } from "@cosmjs/stargate";

const rpc = "https://full-node.testnet-1.coreum.dev:26657";

const App = () => {
  const [log, setLog] = useState("Ready.");

  const appendLog = (msg: string) =>
    setLog((log) => log + "\n" + msg);

  const handleMint = async () => {
    try {
      appendLog("🔍 Connecting to wallet...");

      if (!window.keplr) {
        appendLog("❌ Keplr not found.");
        return;
      }

      await window.keplr.enable("coreum-testnet");
      const offlineSigner = window.getOfflineSigner("coreum-testnet");
      const accounts = await offlineSigner.getAccounts();
      const sender = accounts[0].address;

      appendLog(`🔑 Wallet connected: ${sender} [coreum-testnet]`);

      // Get wallet balance
      const tmpClient = await SigningStargateClient.connect(rpc);
      const balance = await tmpClient.getBalance(sender, "utestcore");
      appendLog(`💰 Balance: ${Number(balance.amount) / 1_000_000} CORE`);

      // Register MsgIssue
      const registry = new Registry();
      registry.register("/coreum.asset.ft.v1.MsgIssue", MsgIssue);
      appendLog("📦 MsgIssue registered with registry.");

      const client = await SigningStargateClient.connectWithSigner(rpc, offlineSigner, {
        registry,
        gasPrice: GasPrice.fromString("0.25utestcore"),
      });
      appendLog("🤖 Client created.");

      const msg: MsgIssue = {
        issuer: sender,
        symbol: "DBG",
        subunit: "udbg",
        precision: 6,
        initialAmount: "1000",
        description: "Debug Mint Token",
        features: [],
      };

      const msgAny = {
        typeUrl: "/coreum.asset.ft.v1.MsgIssue",
        value: msg,
      };

      appendLog("📨 Msg constructed, broadcasting...");

      const result = await client.signAndBroadcast(sender, [msgAny], "auto");
      assertIsBroadcastTxSuccess(result);
      appendLog(`✅ Mint success: TxHash = ${result.transactionHash}`);
    } catch (err: any) {
      console.error("💥 Error:", err);
      appendLog(`⚠️ Error: ${err.message || err.toString()}`);
    }
  };

  return (
    <div style={{ fontFamily: "monospace", marginTop: "2rem", background: "#000", color: "#0f0", padding: "1rem" }}>
      <h2>Coreum Smart Mint</h2>
      <button onClick={handleMint}>Mint Debug Token</button>
      <pre>{log}</pre>
    </div>
  );
};

export default App;
