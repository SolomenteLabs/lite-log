import { useState } from "react";
import { MsgIssue } from "coreum-js/dist/codegen/coreum/asset/ft/v1/tx";
import { Registry } from "@cosmjs/proto-signing";
import { GasPrice, SigningStargateClient, assertIsBroadcastTxSuccess } from "@cosmjs/stargate";

const rpc = "https://full-node.testnet-1.coreum.dev:26657";

const App = () => {
  const [log, setLog] = useState("Ready.");

  const appendLog = (message: string) => {
    setLog((prev) => prev + "\n" + message);
  };

  const handleMint = async () => {
    try {
      appendLog("🔍 Connecting to wallet...");
      const offlineSigner = await window.keplr.getOfflineSignerAuto("coreum-testnet");
      const accounts = await offlineSigner.getAccounts();
      const sender = accounts[0].address;
      appendLog(`🔑 Wallet connected: ${sender}`);

      // Register MsgIssue
      const registry = new Registry();
      registry.register("/coreum.asset.ft.v1.MsgIssue", MsgIssue);
      appendLog("📦 MsgIssue registered with registry.");

      const client = await SigningStargateClient.connectWithSigner(rpc, offlineSigner, {
        registry,
        gasPrice: GasPrice.fromString("0.25ucore"),
      });
      appendLog("⚙️ Stargate client connected with registry.");

      const msg: MsgIssue = {
        issuer: sender,
        symbol: "DEMO",
        subunit: "udemo",
        precision: 6,
        initialAmount: "1000000",
        description: "Testnet Demo Token",
        features: ["minting", "burning"],
      };

      const fee = {
        amount: [{ denom: "ucore", amount: "250000" }],
        gas: "1000000",
      };

      const result = await client.signAndBroadcast(sender, [{
        typeUrl: "/coreum.asset.ft.v1.MsgIssue",
        value: msg,
      }], fee);

      assertIsBroadcastTxSuccess(result);
      appendLog(`✅ Token minted! TxHash: ${result.transactionHash}`);
    } catch (err: any) {
      appendLog(`⚠️ Error: ${err.message || err.toString()}`);
    }
  };

  return (
    <div style={{ fontFamily: "monospace", padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h1>Smart Token Mint Demo</h1>
      <button onClick={handleMint} style={{ padding: "1rem", fontSize: "1.2rem" }}>
        🪙 Mint Token
      </button>
      <pre style={{ marginTop: "2rem", background: "#000", color: "#0f0", padding: "1rem" }}>
        {log}
      </pre>
    </div>
  );
};

export default App;
