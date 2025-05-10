import { useEffect, useState } from "react";
import { Contract } from "ethers";
import { nfts as nftList } from "../utils/nfts";
import ListNFT from "./ListNFT";

function UserNFTs({ signer }) {
  const [nfts, setNfts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const nftsPerPage = 4;

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
            if (!res.ok) continue;
            const metadata = await res.json();

            allNfts.push({
              id: tokenId.toString(),
              name: metadata.name || `${nft.name} #${tokenId}`,
              image: metadata.image || "",
              contract: nft.contract,
              tokenId,
              abi: nft.abi,
            });
          } catch {
            continue;
          }
        }
      } catch {
        continue;
      }
    }

    setNfts(allNfts);
    setCurrentPage(1);
  }

  const startIndex = (currentPage - 1) * nftsPerPage;
  const currentNfts = nfts.slice(startIndex, startIndex + nftsPerPage);
  const totalPages = Math.ceil(nfts.length / nftsPerPage);

  function handleList(info) {
    console.log("✅ Listed NFT:", info);
    alert(`NFT ${info.name} listed at ${info.price}`);
  }

  return (
    <div className="user-nft-panel">
      <h3 className="section-title">Your NFTs</h3>
      <div className="user-nft-grid">
        {currentNfts.map((nft) => (
          <div
            key={`${nft.contract}-${nft.id}`}
            className="nft-card fade-in"
            onClick={() => setSelectedNFT(nft)}
          >
            <img src={nft.image} alt={nft.name} className="nft-image" />
            <div>{nft.name}</div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination fixed-bottom">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            ⬅ Prev
          </button>
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next ➡
          </button>
        </div>
      )}

      <ListNFT
        selectedNFT={selectedNFT}
        onClose={() => setSelectedNFT(null)}
        onList={handleList}
      />
    </div>
  );
}

export default UserNFTs;