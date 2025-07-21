import { useState } from "react";
import { Registry } from "@cosmjs/proto-signing";
import {
  assertIsBroadcastTxSuccess,
  SigningStargateClient,
  GasPrice,
} from "@cosmjs/stargate";
import { MsgIssue } from "coreum-js/src/codegen/coreum/asset/ft/v1/tx";

const rpc = "https://full-node.testnet-1.coreum.dev:26657";

const App = () => {
  const [log, setLog] = useState("Ready.");

  const appendLog = (msg: string) => {
    setLog((prev) => `${prev}\n${msg}`);
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
      appendLog("📦 MsgIssue registered with registry.");

      appendLog("🔗 Connecting to RPC...");
      const client = await SigningStargateClient.connectWithSigner(rpc, offlineSigner, {
        registry,
        gasPrice: GasPrice.fromString("0.25ucore"),
      });
      appendLog("🔌 Stargate client ready.");

      const msgValue = {
        issuer: sender,
        symbol: "TESTTOKEN",
        subunit: "utesttoken",
        precision: 6,
        initialAmount: "1000",
        description: "Minted from demo",
        features: [],
      };

      appendLog("📤 MsgIssue value prepared:");
      appendLog(JSON.stringify(msgValue, null, 2));

      const msg = {
        typeUrl: "/coreum.asset.ft.v1.MsgIssue",
        value: MsgIssue.fromPartial(msgValue),
      };

      const fee = {
        amount: [{ denom: "ucore", amount: "100000" }],
        gas: "200000",
      };

      appendLog("🚀 Broadcasting mint transaction...");
      const result = await client.signAndBroadcast(sender, [msg], fee);
      assertIsBroadcastTxSuccess(result);
      appendLog(`✅ Mint Success! TX Hash: ${result.transactionHash}`);
    } catch (err) {
      console.error(err);
      appendLog(`⚠️ Error: ${err.message || err.toString()}`);
    }
  };

  return (
    <div style={{ marginTop: "2rem", background: "#000", color: "#0f0", padding: "1rem" }}>
      <h1>Smart Token Mint Demo</h1>
      <button onClick={handleMint} style={{ padding: "0.5rem", margin: "1rem 0" }}>
        Mint Smart Token
      </button>
      <pre>{log}</pre>
    </div>
  );
};

export default App;
