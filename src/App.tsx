import { useState } from "react";
import { SigningStargateClient, assertIsBroadcastTxSuccess, GasPrice } from "@cosmjs/stargate";
import { Registry } from "@cosmjs/proto-signing";
import { MsgIssue } from "coreum-js/dist/codegen/coreum/asset/ft/v1/tx";

const rpc = "https://full-node.testnet-1.coreum.dev:26657";

function App() {
  const [log, setLog] = useState("Ready.");

  const handleMint = async () => {
    try {
      setLog((prev) => prev + "\n🔍 Connecting to wallet...");

      await window.keplr.enable("coreum-testnet");
      const offlineSigner = window.getOfflineSigner("coreum-testnet");
      const accounts = await offlineSigner.getAccounts();
      const sender = accounts[0].address;

      setLog((prev) => prev + `\n🔑 Wallet connected: ${sender}`);

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

      setLog((prev) => prev + "\n🚀 Broadcasting mint transaction...");

      const result = await client.signAndBroadcast(sender, [msg], fee);
      assertIsBroadcastTxSuccess(result);

      setLog((prev) => prev + `\n✅ Minted successfully! TX hash: ${result.transactionHash}`);
    } catch (err) {
      console.error(err);
      setLog((prev) => prev + `\n⚠️ Error: ${err.message}`);
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

