// components/MarketPanel.js
import { useState, useEffect } from "react";
import { BrowserProvider, Contract, ethers } from "ethers";
import { nfts as nftList } from "../utils/nfts";
import { marketNftAbi } from "../abi/marketNftAbi";
import MintPopup from "./MintPopup";

function MarketPanel({ signer }) {
  const [selectedChain, setSelectedChain] = useState("ALL");
  const [minted, setMinted] = useState({});
  const [mintingIndex, setMintingIndex] = useState(null);
  const [listingMap, setListingMap] = useState({});
  const [buyingId, setBuyingId] = useState(null);
  const [selectedNFT, setSelectedNFT] = useState(null);

  const now = Date.now();

  const filteredNFTs =
    selectedChain === "ALL"
      ? nftList
      : nftList.filter((nft) => nft.chain === selectedChain);

  useEffect(() => {
    async function fetchMintedAndListed() {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const mintedData = {};
      const listingData = {};

      for (let nft of filteredNFTs) {
        try {
          const contract = new Contract(nft.contract, nft.abi, signer);
          const count = await contract.totalSupply();
          mintedData[nft.contract] = count.toString();

          const listed = [];
          for (let i = 1; i <= count; i++) {
            const price = await contract.salePrice(i);
            if (price > 0n) {
              const tokenURI = await contract.tokenURI(i);
              const res = await fetch(tokenURI);
              if (!res.ok) continue;
              const metadata = await res.json();
              listed.push({
                tokenId: i,
                price: ethers.formatEther(price),
                name: metadata.name,
                image: metadata.image,
                contract: nft.contract,
                abi: nft.abi,
              });
            }
          }
          listingData[nft.contract] = listed;
        } catch {
          mintedData[nft.contract] = "0";
        }
      }

      setMinted(mintedData);
      setListingMap(listingData);
    }

    if (window.ethereum) fetchMintedAndListed();
  }, [selectedChain]);

  function formatCountdown(ms) {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    const h = hr % 24;
    const m = min % 60;
    return `${day}d ${h}h ${m}m`;
  }

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

  async function handleBuy(nft) {
    try {
      setBuyingId(nft.tokenId);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(nft.contract, marketNftAbi, signer);
      const tx = await contract.buy(nft.tokenId, {
        value: ethers.parseEther(nft.price),
      });
      await tx.wait();
      alert(`✅ Bought ${nft.name} #${nft.tokenId}`);
    } catch (err) {
      alert("❌ Buy failed: " + (err?.info?.error?.message || err.message));
    } finally {
      setBuyingId(null);
    }
  }

  return (
    <div className="mint-list-wrapper">
      <div className="top-bar">
        <h2 className="section-title">NFT Drops</h2>
        <div className="chain-tabs">
          {['ALL', 'MONAD', 'SOMNIA'].map((chain) => (
            <button
              key={chain}
              className={`chain-tab ${selectedChain === chain ? "active" : ""}`}
              onClick={() => setSelectedChain(chain)}
            >
              {chain === 'ALL' ? 'All Chains' : chain}
            </button>
          ))}
        </div>
      </div>

      {/* Mint Section */}
      <div className="nft-section">
        <h3 className="section-title">Mint</h3>
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
                {/* Hiển thị biểu tượng mạng */}
                {nft.networkIcon && (
                  <img src={nft.networkIcon} alt="icon" className="network-icon" />
                )}

                <img src={nft.image} alt={nft.name} className="nft-image" />
                <div className="nft-name">{nft.name}</div>

                {/* Hiển thị nhãn thông tin */}
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

                {/* Hiển thị thời gian còn lại */}
                <div className="nft-countdown">
                  {isMintLive ? (
                    <span>
                      <span style={{ color: "limegreen", fontWeight: "bold" }}>● Live</span>
                      <span style={{ color: "#aaa" }}> · Ends: </span>
                      <span style={{ color: "white", fontWeight: "bold" }}>{formatCountdown(end - now)}</span>
                    </span>
                  ) : isMintSoon ? (
                    <span style={{ color: "#aaa" }}>
                      Starts: <span style={{ color: "white", fontWeight: "bold" }}>{formatCountdown(start - now)}</span>
                    </span>
                  ) : (
                    <span style={{ color: "#aaa" }}>Ended</span>
                  )}
                </div>

                {/* Nút Mint */}
                {isMintLive && (
                  <div className="nft-mint-overlay">
                    <div className="nft-mint-overlay">
                      <button
                        className="mint-button"
                        onClick={() => setSelectedNFT(nft)} // ✅ Mở popup mint
                      >
                        Mint
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Listing Section */}
      <div className="nft-section">
        <h3 className="section-title">Listing</h3>
        <div className="nft-grid">
          {filteredNFTs.flatMap((nft) => {
            const items = listingMap[nft.contract] || [];
            return items.map((item, idx) => (
              <div key={`${item.contract}-${item.tokenId}`} className="nft-card">
                {/* Hiển thị biểu tượng mạng */}
                {nft.networkIcon && (
                  <img src={nft.networkIcon} alt="icon" className="network-icon" />
                )}
                <img src={item.image} alt={item.name} className="nft-image" />
                <div className="nft-name">{item.name}</div>

                {/* Hiển thị nhãn thông tin */}
                <div className="nft-info-labels">
                  <div>PRICE</div>
                  <div>ID</div>
                  <div>STATUS</div>
                </div>
                <div className="nft-info-values">
                  <div>{item.price}</div>
                  <div>{item.tokenId}</div>
                  <div>Live</div>
                </div>

                {/* Nút Buy */}
                <button
                  className="mint-button"
                  onClick={() => handleBuy(item)}
                  disabled={buyingId === item.tokenId}
                >
                  {buyingId === item.tokenId ? "Buying..." : "Buy"}
                </button>
              </div>
            ));
          })}
        </div>
      </div>
      {/* ✅ Hiển thị popup Mint nếu có selectedNFT */}
      {selectedNFT && (
        <MintPopup
          nft={selectedNFT}
          signer={signer}
          onClose={() => setSelectedNFT(null)}
          onSuccess={() => {
            setSelectedNFT(null);
            setMintingIndex(null);
          }}
        />
      )}
    </div>
  );
}

export default MarketPanel;
