import { useState, useEffect } from "react";
import { Contract, BrowserProvider, ethers } from "ethers";
import { marketNftAbi } from "../abi/marketNftAbi";

function ListNFT({ selectedNFT, onClose, onList }) {
  const [price, setPrice] = useState("");
  const [alreadyListed, setAlreadyListed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkListed() {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(selectedNFT.contract, marketNftAbi, signer);
        const sale = await contract.salePrice(selectedNFT.tokenId);
        if (sale > 0n) {
          setAlreadyListed(true);
          setPrice(ethers.formatEther(sale));
        } else {
          setAlreadyListed(false);
          setPrice("");
        }
      } catch {
        setAlreadyListed(false);
      }
    }

    if (selectedNFT) checkListed();
  }, [selectedNFT]);

  async function handleSubmit() {
    if (!price) {
      alert("Please enter a price!");
      return;
    }
    if (alreadyListed) {
      alert("❗ NFT already listed");
      return;
    }
    onList({ ...selectedNFT, price });
    onClose();
  }

  async function handleCancelListing() {
    try {
      setLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(selectedNFT.contract, marketNftAbi, signer);
      const tx = await contract.cancelListing(selectedNFT.tokenId);
      await tx.wait();
      alert("✅ Listing cancelled");
      onClose();
    } catch (err) {
      alert("❌ Cancel failed: " + (err?.info?.error?.message || err.message));
    } finally {
      setLoading(false);
    }
  }

  if (!selectedNFT) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>List NFT for Sale</h2>
        <img src={selectedNFT.image} alt={selectedNFT.name} className="nft-image" />
        <p>{selectedNFT.name} #{selectedNFT.tokenId}</p>
        <input
          type="number"
          placeholder="Price (in native token)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={alreadyListed}
        />
        <div className="modal-actions">
          {alreadyListed ? (
            <button onClick={handleCancelListing} disabled={loading}>
              {loading ? "Cancelling..." : "Cancel Listing"}
            </button>
          ) : (
            <button onClick={handleSubmit}>List NFT</button>
          )}
          <button className="cancel-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default ListNFT;
