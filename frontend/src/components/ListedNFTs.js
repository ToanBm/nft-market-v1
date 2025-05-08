import { useEffect, useState } from "react";
import { Contract, BrowserProvider, ethers } from "ethers";
import { nfts as nftList } from "../utils/nfts";
import { marketNftAbi } from "../abi/marketNftAbi";

function ListedNFTs() {
  const [listedNfts, setListedNfts] = useState([]);

  useEffect(() => {
    loadListedNFTs();
  }, []);

  async function loadListedNFTs() {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const allListed = [];

    for (const nft of nftList.slice(0, 4)) {
      try {
        const contract = new Contract(nft.contract, marketNftAbi, signer);
        const total = await contract.totalSupply();

        for (let tokenId = 0; tokenId < total; tokenId++) {
          const price = await contract.salePrice(tokenId);
          if (price > 0n) {
            const tokenUri = await contract.tokenURI(tokenId);
            const res = await fetch(tokenUri);
            if (!res.ok) continue;
            const metadata = await res.json();

            allListed.push({
              contract: nft.contract,
              tokenId,
              name: metadata.name || `${nft.name} #${tokenId}`,
              image: metadata.image,
              price: ethers.formatEther(price),
            });
          }
        }
      } catch {
        continue;
      }
    }

    setListedNfts(allListed);
  }

  return (
    <div className="listed-panel">
      <h3 className="section-title">Marketplace</h3>
      <div className="nft-grid">
        {listedNfts.map((nft) => (
          <div key={`${nft.contract}-${nft.tokenId}`} className="nft-card fade-in">
            <img src={nft.image} alt={nft.name} className="nft-image" />
            <div>{nft.name}</div>
            <div style={{ fontWeight: "bold", marginTop: "5px" }}>
              {nft.price} ETH
            </div>
            <button className="mint-button" disabled>Buy</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListedNFTs;
