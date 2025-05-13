// components/MintAndListPanel.js
import { useState, useEffect } from "react";
import { BrowserProvider, Contract, ethers } from "ethers";
import { nfts as nftList } from "../utils/nfts";
import { marketNftAbi } from "../abi/marketNftAbi";

function MintAndListPanel() {
  const [selectedChain, setSelectedChain] = useState("ALL");
  const [minted, setMinted] = useState({});
  const [mintingIndex, setMintingIndex] = useState(null);
  const [listingMap, setListingMap] = useState({});
  const [buyingId, setBuyingId] = useState(null);

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

          // listing
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

      <div className="mint-section">
        {filteredNFTs.map((nft, index) => {
          const start = Date.parse(nft.mintStart);
          const end = Date.parse(nft.mintEnd);
          const mintedCount = minted[nft.contract] || "0";
          const mintedPercent = Math.floor((mintedCount / nft.supply) * 100) || 0;
          const isMintLive = now >= start && now < end;
          const isMintSoon = now < start;

          return (
            <div key={index} className="nft-card">
              <img src={nft.image} alt={nft.name} className="nft-image" />
              <div className="nft-name">{nft.name}</div>
              <div className="nft-info-values">
                <div>{nft.price}</div>
                <div>{nft.supply}</div>
                <div>{mintedPercent}%</div>
              </div>
              {isMintLive && (
                <button
                  className="mint-button"
                  onClick={() => handleMint(nft, index)}
                  disabled={mintingIndex !== null}
                >
                  {mintingIndex === index ? "Minting..." : "Mint"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="listing-section">
        {filteredNFTs.map((nft, idx) => {
          const items = listingMap[nft.contract] || [];
          return items.map((item, index) => (
            <div key={index} className="nft-card">
              <img src={item.image} alt={item.name} className="nft-image" />
              <div className="nft-name">{item.name}</div>
              <div className="nft-info-values">
                <div>{item.price}</div>
                <div>{item.tokenId}</div>
                <div>Live</div>
              </div>
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
  );
}

export default MintAndListPanel;
