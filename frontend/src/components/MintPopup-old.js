// components/MintPopup.js
import { useEffect, useState } from "react";
import { Contract } from "ethers";

function MintPopup({ nft, onClose, signer }) {
  const [minted, setMinted] = useState("0");
  const [minting, setMinting] = useState(false);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    if (!nft || !signer) {
      console.warn("⛔ Missing NFT or signer in MintPopup");
      return;
    }

    async function loadDetails() {
      try {
        const contract = new Contract(nft.contract, nft.abi, signer);
        const count = await contract.totalSupply();
        const price = await contract.mintPrice();
        setMinted(count.toString());
        setPrice(price);
      } catch (err) {
        console.error("❌ Failed to load NFT details:", err);
      }
    }

    loadDetails();
  }, [nft, signer]);

  if (!nft) return null;

  const now = Date.now();
  const start = Date.parse(nft.mintStart);
  const end = Date.parse(nft.mintEnd);
  const isMintLive = now >= start && now < end;
  const isMintSoon = now < start;
  const total = nft.supply;
  const percent = Math.floor((minted / total) * 100);

  function formatCountdown(ms) {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    const h = hr % 24;
    const m = min % 60;
    return `${day}d ${h}h ${m}m`;
  }

  async function handleMint() {
    if (!signer || !nft || !price) return;

    try {
      setMinting(true);
      const contract = new Contract(nft.contract, nft.abi, signer);
      const tx = await contract.mint({ value: price });
      await tx.wait();
      alert("✅ Mint success");
      onClose();
    } catch (err) {
      alert("❌ Mint failed: " + (err?.info?.error?.message || err.message));
    } finally {
      setMinting(false);
    }
  }

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>
        <div className="popup-left">
          <img src={nft.image} alt={nft.name} className="popup-image" />
        </div>
        <div className="popup-right">
          <h2 className="popup-title">{nft.name}</h2>

          <div className="popup-countdown">
            {isMintLive ? (
              <span style={{ color: "limegreen" }}>
                ● Live · Ends: {formatCountdown(end - now)}
              </span>
            ) : isMintSoon ? (
              <span style={{ color: "#aaa" }}>
                Starts: {formatCountdown(start - now)}
              </span>
            ) : (
              <span style={{ color: "#aaa" }}>Ended</span>
            )}
          </div>

          <div className="popup-progress">
            <label>Total Minted</label>
            <progress value={minted} max={total}></progress>
            <span>
              {percent}% ({minted} / {total})
            </span>
          </div>

          <div className="popup-price">
            <div>
              <label>Price</label>
              <div>{price ? `${Number(price) / 1e18} ETH` : "..."}</div>
            </div>
            <div className="popup-action">
              <button
                className="mint-button"
                onClick={handleMint}
                disabled={minting || !isMintLive}
              >
                {minting ? "Minting..." : !signer ? "Connect Wallet" : "Mint"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MintPopup;
