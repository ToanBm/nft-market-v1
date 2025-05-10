// ====================== IMPORTS ======================
import { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import { nfts as nftList } from "../utils/nfts";

// ====================== COMPONENT =====================
function MintNFT() {
  const [selectedChain, setSelectedChain] = useState("ALL");
  const [minted, setMinted] = useState({});
  const [mintingIndex, setMintingIndex] = useState(null);

  // ================== LOAD TOTAL SUPPLY ==================
  useEffect(() => {
    async function fetchSupply() {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const data = {};
      for (let nft of nftList) {
        try {
          const contract = new Contract(nft.contract, nft.abi, signer);
          const count = await contract.totalSupply();
          data[nft.contract] = count.toString();
        } catch {
          data[nft.contract] = "0";
        }
      }

      setMinted(data);
    }

    if (window.ethereum) fetchSupply();
  }, []);

  function formatCountdown(ms) {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    const h = hr % 24;
    const m = min % 60;
    return `${day}d ${h}h ${m}m`;
  }

  const filteredNFTs =
    selectedChain === "ALL"
      ? nftList
      : nftList.filter((nft) => nft.chain === selectedChain);

  async function handleMint(nft, index) {
    if (!window.ethereum) return alert("Please install MetaMask or OKX Wallet!");

    try {
      setMintingIndex(index);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(nft.contract, nft.abi, signer);
      const price = await contract.mintPrice();
      const tx = await contract.mint({ value: price });
      await tx.wait();
      alert(`Minted ${nft.name} successfully!`);
    } catch (err) {
      console.error("Mint failed:", err);
      alert("Mint failed: " + (err?.info?.error?.message || err.message));
    } finally {
      setMintingIndex(null);
    }
  }

  const now = Date.now();

  return (
    <div>
      <div className="top-bar">
        <h2 className="section-title">NFT Drops</h2>
        <div className="chain-tabs">
          {["ALL", "MONAD", "SOMNIA"].map((chain) => (
            <button
              key={chain}
              className={`chain-tab ${selectedChain === chain ? "active" : ""}`}
              onClick={() => setSelectedChain(chain)}
            >
              {chain === "ALL" ? "All Chains" : chain}
            </button>
          ))}
        </div>
      </div>

      <div className="nft-grid">
        {filteredNFTs.map((nft, index) => {
          const start = Date.parse(nft.mintStart);
          const end = Date.parse(nft.mintEnd);
          const mintedCount = minted[nft.contract] || "0";
          const mintedPercent = Math.floor((mintedCount / nft.supply) * 100) || 0;

          const isMintLive = now >= start && now < end;
          const isMintSoon = now < start;

          return (
            <div key={index} className="nft-card">
              {nft.networkIcon && (
                <img src={nft.networkIcon} alt="icon" className="network-icon" />
              )}

              <img src={nft.image} alt={nft.name} className="nft-image" />
              <div className="nft-name">{nft.name}</div>

              <div className="nft-info-labels">
                <div>PRICE</div>
                <div>ITEMS</div>
                <div>MINTED</div>
              </div>
              <div className="nft-info-values">
                <div>{nft.price}</div>
                <div>{nft.supply}</div>
                <div>{mintedPercent}%</div>
              </div>

              <div className="nft-countdown">
                {isMintLive ? (
                  <span>
                    <span style={{ color: "limegreen", fontWeight: "bold" }}>● Live</span>
                    <span style={{ color: "#aaa" }}> · Ends: </span>
                    <span style={{ color: "white", fontWeight: "bold" }}>
                      {formatCountdown(end - now)}
                    </span>
                  </span>
                ) : isMintSoon ? (
                  <span style={{ color: "#aaa" }}>
                    Starts:{" "}
                    <span style={{ color: "white", fontWeight: "bold" }}>
                      {formatCountdown(start - now)}
                    </span>
                  </span>
                ) : (
                  <span style={{ color: "#aaa" }}>Ended</span>
                )}
              </div>

              {isMintLive && (
                <div className="nft-mint-overlay">
                  <button
                    className="mint-button"
                    onClick={() => handleMint(nft, index)}
                    disabled={mintingIndex !== null}
                  >
                    {mintingIndex === index ? "Minting..." : "Mint"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MintNFT;
