import { useState, useEffect } from "react";
import {
  connectWallet,
  getExistingWallet,
  disconnectWallet,
  switchNetwork
} from "./utils/connectWallet";
import { CHAINS } from "./utils/chains";
import MintNFT from "./components/MintNFT";
import ListNFT from "./components/ListNFT";
import UserNFTs from "./components/UserNFTs";
import { ethers } from "ethers";
import "./App.css";

function App() {
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedChain, setSelectedChain] = useState("MONAD");
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    async function reconnect() {
      const wallet = await getExistingWallet();
      if (wallet?.signer) {
        const address = await wallet.signer.getAddress();
        setSigner(wallet.signer);
        setWalletAddress(address);

        const provider = new ethers.JsonRpcProvider(
          CHAINS[selectedChain].rpcUrls[0]
        );
        await loadBalance(provider, address);
      }
    }

    reconnect();

    window.ethereum?.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        connect();
      }
    });
  }, []);

  async function connect() {
    const wallet = await connectWallet();
    if (wallet) {
      const address = await wallet.signer.getAddress();
      setSigner(wallet.signer);
      setWalletAddress(address);

      const provider = new ethers.JsonRpcProvider(
        CHAINS[selectedChain].rpcUrls[0]
      );
      await loadBalance(provider, address);
    }
  }

  function disconnect() {
    disconnectWallet();
    setSigner(null);
    setWalletAddress("");
  }

  async function handleSwitchNetwork(chainKey) {
    if (chainKey === "DISCONNECT") {
      disconnect();
      return;
    }
    const chainInfo = CHAINS[chainKey];
    await switchNetwork(chainInfo);
    setSelectedChain(chainKey);
  }

  function getNativeTokenSymbol() {
    switch (selectedChain) {
      case "MONAD":
        return "MON";
      case "SOMNIA":
        return "SOM";
      default:
        return "ETH";
    }
  }

  async function loadBalance(provider, address) {
    try {
      const raw = await provider.getBalance(address);
      const formatted = parseFloat(ethers.formatEther(raw)).toFixed(2);
      setBalance(formatted);
    } catch (err) {
      console.error("❌ Failed to fetch balance:", err);
    }
  }

  return (
    <div className="container">
      <div className="left-panel">
        <MintNFT signer={signer} />
        <ListNFT signer={signer} />
      </div>

      <div className="center-panel">
        <div className="coming-soon">Coming Soon</div>
      </div>

      <div className="right-panel">
        <div className="network-panel">
          <div className="network-row">
            {!signer ? (
              <button className="wallet-button" onClick={connect}>
                Connect Wallet
              </button>
            ) : (
              <div
                className="wallet-button"
                style={{
                  backgroundColor: "#444",
                  color: "#fff",
                  cursor: "default",
                }}
              >
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
            )}

            <select
              className="network-selector"
              value={selectedChain}
              onChange={(e) => handleSwitchNetwork(e.target.value)}
            >
              <option value="MONAD">Monad Testnet</option>
              <option value="SOMNIA">Somnia Testnet</option>
              {signer && <option value="DISCONNECT">Disconnect Wallet</option>}
            </select>
          </div>

          {balance && (
            <div className="balance-box">
              Balance: {balance} {getNativeTokenSymbol()}
            </div>
          )}

          <button className="faucet-button">Faucet</button>
        </div>

        {/* ✅ Load NFT đã sở hữu */}
        {signer && <UserNFTs signer={signer} />}

        <div className="footer-panel">© 2025 ToanBm NFT Market</div>
      </div>
    </div>
  );
}

export default App;
