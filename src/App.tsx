import { useState } from "react";
import { assertIsBroadcastTxSuccess, SigningStargateClient, GasPrice } from "@cosmjs/stargate";
import { Registry } from "@cosmjs/proto-signing";
import { MsgIssue } from "coreum-js/dist/codegen/coreum/asset/ft/v1/tx"; // ✅ Correct path

const rpc = "https://full-node.testnet-1.coreum.dev:26657";

function App() {
  const [log, setLog] = useState("Ready.");

  const handleMint = async () => {
    try {
      setLog((log) => log + "\n🔍 Connecting to wallet...");

      await window.keplr.enable("coreum-testnet");
      const offlineSigner = window.getOfflineSigner("coreum-testnet");
      const accounts = await offlineSigner.getAccounts();
      const sender = accounts[0].address;

      setLog((log) => log + `\n🔑 Wallet connected: ${sender}`);

      // ✅ Register MsgIssue with correct type URL
      const registry = new Registry();
      registry.register("/coreum.asset.ft.v1.MsgIssue", MsgIssue);

      const client = await SigningStargateClient.connectWithSigner(rpc, offlineSigner, {
        registry,
        gasPrice: GasPrice.fromString("0.25ucore"),
      });

      const msg = {
        typeUrl: "/coreum.asset.ft.v1.MsgIssue",
        value: MsgIssue.fromPartial({
          issuer: sender,
          symbol: "DEMO",
          subunit: "udemo",
          precision: 6,
          initialAmount: "1000000",
          description: "Demo Token",
          features: [],
        }),
      };

      const fee = {
        amount: [{ denom: "ucore", amount: "5000" }],
        gas: "200000",
      };

      setLog((log) => log + "\n🚀 Broadcasting mint transaction...");

      const result = await client.signAndBroadcast(sender, [msg], fee);
      assertIsBroadcastTxSuccess(result);

      setLog((log) => log + `\n✅ Minted! TX Hash: ${result.transactionHash}`);
    } catch (err) {
      console.error(err);
      setLog((log) => log + `\n⚠️ Error: ${err.message}`);
    }
  };

  return (
    <div style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>🪙 Smart Token Mint Demo</h1>
      <button onClick={handleMint}>Mint Token</button>
      <pre>{log}</pre>
    </div>
  );
}

export default App;

