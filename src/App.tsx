import { useState } from "react";
import { Registry } from "@cosmjs/proto-signing";
import { SigningStargateClient, assertIsBroadcastTxSuccess, GasPrice } from "@cosmjs/stargate";
import { MsgIssue } from "coreum-js";
import { coins } from "@cosmjs/amino";

const rpc = "https://full-node.testnet-1.coreum.dev:26657";

const App = () => {
  const [log, setLog] = useState("Ready.");

  const appendLog = (message: string) => {
    setLog((prev) => prev + "\n" + message);
  };

  const handleMint = async () => {
    try {
      appendLog("🔍 Connecting to wallet...");

      const chainId = "coreum-testnet";
      await window.keplr.enable(chainId);
      const offlineSigner = await window.getOfflineSignerAuto(chainId);
      const accounts = await offlineSigner.getAccounts();
      const sender = accounts[0].address;

      appendLog(\`🔑 Wallet connected: \${sender}\`);

      const tempClient = await SigningStargateClient.connect(rpc);
      const balance = await tempClient.getAllBalances(sender);
      appendLog(\`💰 Wallet balance: \${balance.map(b => b.amount + b.denom).join(", ")}\`);

      const registry = new Registry();
      registry.register("/coreum.asset.ft.v1.MsgIssue", MsgIssue);
      appendLog("📦 MsgIssue registered with registry.");

      const gasPrice = GasPrice.fromString("0.25ucore");
      const client = await SigningStargateClient.connectWithSigner(rpc, offlineSigner, { registry, gasPrice });
      appendLog("🔌 StargateClient ready.");

      const msg = {
        typeUrl: "/coreum.asset.ft.v1.MsgIssue",
        value: MsgIssue.fromPartial({
          issuer: sender,
          symbol: "SOLOPASS",
          subunit: "spass",
          precision: 6,
          initialAmount: "1000",
          description: "Soulbound Auth Token",
          features: ["burning", "freezing"],
        }),
      };

      appendLog("🧱 Msg constructed. Broadcasting mint transaction...");

      const fee = {
        amount: coins(50000, "ucore"),
        gas: "200000",
      };

      const result = await client.signAndBroadcast(sender, [msg], fee);

      if (result.code === 0) {
        appendLog("✅ Mint successful! TxHash: " + result.transactionHash);
      } else {
        appendLog("⚠️ Tx failed: " + result.rawLog);
      }
    } catch (err) {
      console.error(err);
      appendLog("❌ Error: " + (err.message || JSON.stringify(err)));
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace", color: "#0f0", background: "#111", height: "100vh" }}>
      <h1 style={{ color: "#0f0", textAlign: "center" }}>🚀 Mint SoloPass Token <span style={{ fontSize: "1rem" }}>(Live Log)</span></h1>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <button onClick={handleMint} style={{ background: "#0f0", color: "#000", fontWeight: "bold", padding: "0.75rem 1.5rem", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}>
          Mint Smart Token
        </button>
      </div>
      <pre style={{ background: "#000", border: "1px solid #0f0", padding: "1rem", height: "300px", overflowY: "auto" }}>{log}</pre>
    </div>
  );
};

export default App;
