import { useState } from "react";
import { assertIsBroadcastTxSuccess, SigningStargateClient, GasPrice, coins } from "@cosmjs/stargate";
import { MsgIssue } from "coreum-js/src/codegen/coreum/asset/ft/v1/tx";
import { Registry } from "@cosmjs/proto-signing";

const rpc = "https://full-node.testnet-1.coreum.dev:26657";

export default function App() {
  const [log, setLog] = useState("Ready.");

  const appendLog = (msg: string) => {
    setLog((prev) => `${prev}\n${msg}`);
  };

  const handleMint = async () => {
    try {
      appendLog("🔍 Connecting to wallet...");
      const wallet = await window.keplr.getOfflineSignerAuto("coreum-testnet");
      const accounts = await wallet.getAccounts();
      const sender = accounts[0].address;

      appendLog(`🔑 Wallet connected: ${sender}`);
      appendLog(`🧾 Accounts:\n${JSON.stringify(accounts, null, 2)}`);

      const registry = new Registry();
      registry.register("/coreum.asset.ft.v1.MsgIssue", MsgIssue);

      const client = await SigningStargateClient.connectWithSigner(rpc, wallet, {
        registry,
        gasPrice: GasPrice.fromString("0.25ucore"),
      });

      const msg = {
        typeUrl: "/coreum.asset.ft.v1.MsgIssue",
        value: MsgIssue.fromPartial({
          issuer: sender,
          symbol: "DEBUG",
          subunit: "udebug",
          precision: 6,
          initialAmount: "1000000",
          description: "Debug token from UI",
          features: [],
        }),
      };

      appendLog(`📦 MsgIssue payload:\n${JSON.stringify(msg.value, null, 2)}`);

      const fee = {
        amount: coins(5000, "ucore"),
        gas: "200000",
      };

      appendLog(`💸 Fee object:\n${JSON.stringify(fee, null, 2)}`);
      appendLog("🚀 Broadcasting mint transaction...");

      const result = await client.signAndBroadcast(sender, [msg], fee);
      assertIsBroadcastTxSuccess(result);

      appendLog(`✅ Mint succeeded! TX hash:\n${result.transactionHash}`);
    } catch (err) {
      appendLog(`⚠️ Error:\n${(err as Error).message}`);
    }
  };

  return (
    <div style={{ fontFamily: "monospace", whiteSpace: "pre-wrap", padding: "2rem" }}>
      <h1>Mint Debug Token</h1>
      <button onClick={handleMint} style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}>
        Mint
      </button>
      <pre>{log}</pre>
    </div>
  );
}

