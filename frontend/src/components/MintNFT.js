import { useState } from "react";
import { ethers, BrowserProvider, Contract } from "ethers";
import { nfts } from "../utils/nfts";

function MintNFT() {
  const [minting, setMinting] = useState(false);

  async function handleMint(nft) {
    if (!window.ethereum) {
      alert("Please install MetaMask or OKX Wallet!");
      return;
    }

    try {
      setMinting(true);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(nft.contract, nft.abi, signer);

      // Read mint price from contract
      const mintPrice = await contract.mintPrice();

      // Call mint function with correct value
      const tx = await contract.mint({ value: mintPrice });

      await tx.wait();
      alert(`Minted ${nft.name} successfully!`);
    } catch (error) {
      console.error("Mint failed:", error);
      alert("Mint failed: " + (error?.info?.error?.message || error.message));
    } finally {
      setMinting(false);
    }
  }

  return (
    <div>
      <h2 className="section-title">NFT Mint</h2>
      <div className="nft-grid">
        {nfts.map((nft) => (
          <div key={nft.name} className="nft-card">
            {nft.networkIcon && (
              <img
                src={nft.networkIcon}
                alt="network"
                className="network-icon"
              />
            )}

            <img src={nft.image} alt={nft.name} className="nft-image" />
            <div className="nft-name">{nft.name}</div>

            {nft.contract.startsWith("0x") && nft.contract.length === 42 ? (
              <button
                onClick={() => handleMint(nft)}
                className="mint-button"
                disabled={minting}
              >
                {minting ? "Minting..." : "Mint"}
              </button>
            ) : (
              <button className="mint-button-disabled" disabled>
                Coming Soon
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MintNFT;
