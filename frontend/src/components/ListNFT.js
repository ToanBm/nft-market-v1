import { useState } from "react";

function ListNFT({ signer }) {
  const [contractAddress, setContractAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");

  async function handleList() {
    if (!signer) {
      alert("Please connect wallet first!");
      return;
    }

    if (!contractAddress || !tokenId || !price) {
      alert("Please fill all fields!");
      return;
    }

    try {
      // Gọi transaction list NFT lên marketplace
      // const tx = await marketplaceContract.listItem(contractAddress, tokenId, parseEther(price));
      // await tx.wait();
      alert("NFT listed successfully!");
    } catch (error) {
      console.error("List failed:", error);
      alert("List failed!");
    }
  }

  return (
    <div className="card">
      <h2>List NFT</h2>
      <input
        type="text"
        placeholder="NFT Contract Address"
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
      />
      <input
        type="number"
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price (in native token)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <button className="primary-button" onClick={handleList}>
        List NFT
      </button>
    </div>
  );
}

export default ListNFT;
