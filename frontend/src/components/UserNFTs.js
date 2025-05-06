import { useEffect, useState } from "react";
import { Contract } from "ethers";
import { nfts as nftList } from "../utils/nfts";

function UserNFTs({ signer }) {
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    if (signer) loadAllNFTs();
    else setNfts([]);
  }, [signer]);

  async function loadAllNFTs() {
    const address = await signer.getAddress();
    const allNfts = [];

    for (const nft of nftList) {
      try {
        const contract = new Contract(nft.contract, nft.abi, signer);
        const balance = await contract.balanceOf(address);

        for (let i = 0; i < balance; i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(address, i);
          const tokenUri = await contract.tokenURI(tokenId);

          try {
            const res = await fetch(tokenUri);
            if (!res.ok) {
              console.warn(`❌ Cannot fetch metadata from ${tokenUri} (${res.status})`);
              continue;
            }

            const metadata = await res.json();
            allNfts.push({
              id: tokenId.toString(),
              name: metadata.name || `${nft.name} #${tokenId}`,
              image: metadata.image || "",
              contract: nft.contract,
            });
          } catch (jsonErr) {
            console.warn(`❌ Invalid JSON at ${tokenUri}`, jsonErr);
          }
        }
      } catch (err) {
        console.error(`Failed to load NFTs from ${nft.name}`, err);
      }
    }

    setNfts(allNfts);
  }

  return (
    <div className="user-nft-panel">
      <h3 className="section-title">Your NFTs</h3>
      <div className="nft-grid">
        {nfts.map((nft) => (
          <div key={`${nft.contract}-${nft.id}`} className="nft-card">
            <img src={nft.image} alt={nft.name} className="nft-image" />
            <div>{nft.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserNFTs;
