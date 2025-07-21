import { useState } from 'react';

function App() {
  const [status, setStatus] = useState('');

  const handleMint = async () => {
    setStatus('⏳ Minting...');
    try {
      // Simulated delay to mimic transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStatus('✅ Token Minted (Simulated)');
    } catch (error) {
      console.error(error);
      setStatus('❌ Mint Failed');
    }
  };

  return (
    <div style={{
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <img src="/solopass-logo.png" alt="SoloPass Logo" style={{ width: 80, marginBottom: 16 }} />
      <h1>Mint SoloPass Token (Live Log)</h1>
      <p>This is a testnet-only smart token mint demo.</p>
      <button onClick={handleMint} style={{
        marginTop: 20,
        padding: '12px 24px',
        fontSize: '16px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#333',
        color: 'white',
        cursor: 'pointer'
      }}>
        Mint Token
      </button>
      {status && <p style={{ marginTop: 20 }}>{status}</p>}
    </div>
  );
}

export default App;
