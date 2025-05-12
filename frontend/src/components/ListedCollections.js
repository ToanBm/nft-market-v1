// components/ListedCollections.js
import { useEffect, useState } from "react";
import { BrowserProvider, Contract, ethers } from "ethers";
import { marketNftAbi } from "../abi/marketNftAbi";
import { nfts as nftList } from "../utils/nfts";

function ListedCollections() {
  const [collectionMap, setCollectionMap] = useState({});
  const [selectedContract, setSelectedContract] = useState(null);
  const [buyingId, setBuyingId] = useState(null);

  useEffect(() => {
    async function loadListings() {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const map = {};
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

              if (!map[nft.contract]) map[nft.contract] = [];
              map[nft.contract].push({
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
          console.warn("Error loading NFTs for", nft.name);
        }
      }
      setCollectionMap(map);
    }

    if (window.ethereum) loadListings();
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

  if (!selectedContract) {
    return (
      <div className="marketplace-panel">
        <h3 className="section-title">Marketplace</h3>
        <div className="marketplace-grid">
          {Object.entries(collectionMap).map(([contract, items]) => (
            <div
              key={contract}
              className="marketplace-card"
              onClick={() => setSelectedContract(contract)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={items[0].image}
                alt={items[0].name}
                className="marketplace-image"
              />
              <div className="marketplace-info">
                <div className="marketplace-price">
                  Floor: {items[0].price} ({items.length} listed)
                </div>
                <div className="marketplace-id">Contract: {contract.slice(0, 6)}...</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    const items = collectionMap[selectedContract];
    return (
      <div className="marketplace-panel">
        <h3 className="section-title">
          Collection NFTs <button onClick={() => setSelectedContract(null)}>Back</button>
        </h3>
        <div className="marketplace-grid">
          {items.map((nft, index) => (
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
}

export default ListedCollections;
