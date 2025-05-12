// components/ListedNFTs.js
import { useEffect, useState } from "react";
import { BrowserProvider, Contract, ethers } from "ethers";
import { marketNftAbi } from "../abi/marketNftAbi";
import { nfts as nftList } from "../utils/nfts";

function ListedNFTs() {
  const [listedNFTs, setListedNFTs] = useState([]);
  const [buyingId, setBuyingId] = useState(null);

  useEffect(() => {
    async function loadListedNFTs() {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const result = [];
      for (const nft of nftList) {
        try {
          const contract = new Contract(nft.contract, marketNftAbi, signer);
          const total = await contract.totalSupply();

          for (let i = 1; i <= total; i++) {
            const price = await contract.salePrice(i);
            if (price > 0n) {
              const tokenURI = await contract.tokenURI(i);
              const res = await fetch(tokenURI);
              if (!res.ok) continue;
              const metadata = await res.json();

              result.push({
                tokenId: i,
                price: ethers.formatEther(price),
                name: metadata.name,
                image: metadata.image,
                contract: nft.contract,
                abi: nft.abi,
              });
            }
          }
        } catch (err) {
          console.warn("Error loading listed NFTs for", nft.name);
        }
      }
      setListedNFTs(result);
    }

    if (window.ethereum) loadListedNFTs();
  }, []);

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
    <div className="marketplace-panel">
      <h3 className="section-title">Marketplace</h3>
      <div className="marketplace-grid">
        {listedNFTs.map((nft, index) => (
          <div key={index} className="marketplace-card">
            <img src={nft.image} alt={nft.name} className="marketplace-image" />
            <div className="marketplace-info">
              <div className="marketplace-price">Price: {nft.price}</div>
              <div className="marketplace-id">ID: {nft.tokenId}</div>
              <div className="marketplace-status">Live</div>
            </div>
            <button
              className="marketplace-buy-button"
              onClick={() => handleBuy(nft)}
              disabled={buyingId === nft.tokenId}
            >
              {buyingId === nft.tokenId ? "Buying..." : "Buy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListedNFTs;
