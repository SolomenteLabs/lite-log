import { useEffect, useState } from "react";
import {
  MsgIssue,
} from "coreum-js/lib/esm/asset/ft/v1/tx";
import {
  Registry,
  encodePubkey,
  OfflineSigner,
} from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import "./App.css";

const registry = new Registry();
registry.register("/coreum.asset.ft.v1.MsgIssue", MsgIssue);

const rpc = "https://full-node.testnet-1.coreum.dev:26657";

function App() {
  const [status, setStatus] = useState("Ready.");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleMint = async () => {
    try {
      setStatus("🔍 Connecting to wallet...");

      const offlineSigner: OfflineSigner = window.keplr.getOfflineSigner("coreum-testnet");
      const accounts = await offlineSigner.getAccounts();
      const address = accounts[0].address;
      setWalletAddress(address);

      setStatus(`🔑 Wallet connected: ${address}`);

      const client = await SigningStargateClient.connectWithSigner(rpc, offlineSigner, { registry });

      const msg: MsgIssue = {
        issuer: address,
        symbol: "SOLPASS",
        subunit: "usolpass",
        precision: 6,
        initialAmount: "1",
        description: "SoloPass Demo Token",
        features: [],
        burnRate: "0.00",
        sendCommissionRate: "0.00"
      };

      setStatus("🚀 Broadcasting mint transaction...");

      const result = await client.signAndBroadcast(address, [{
        typeUrl: "/coreum.asset.ft.v1.MsgIssue",
        value: msg
      }], "auto");

      if (result.code === 0) {
        setStatus(`✅ Success! TX Hash: ${result.transactionHash}`);
      } else {
        setStatus(`❌ Failed! Code: ${result.code}, Log: ${result.rawLog}`);
      }

    } catch (err: any) {
      console.error(err);
      setStatus(`⚠️ Error: ${err.message || err.toString()}`);
    }
  };

  return (
    <div className="container">
      <h1>🎟️ SoloPass Mint Demo</h1>
      <p>Click below to mint a smart token on Coreum Testnet</p>
      <button onClick={handleMint}>Mint Token</button>
      <pre>{status}</pre>
    </div>
  );
}

export default App;
