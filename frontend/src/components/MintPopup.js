// components/MintPopup.js
import { useEffect, useState } from "react";
import { Contract } from "ethers";
import "./MintPopup.css";

function MintPopup({ nft, onClose, signer }) {
  const [minted, setMinted] = useState(0);
  const [minting, setMinting] = useState(false);
  const [price, setPrice] = useState(null);
  const [mintFee, setMintFee] = useState(0);
  const [amount, setAmount] = useState(1);
  const [remainingLimit, setRemainingLimit] = useState(10);

  useEffect(() => {
    if (!nft || !signer) return;

    async function loadDetails() {
      try {
        const contract = new Contract(nft.contract, nft.abi, signer);
        const total = await contract.totalSupply();
        const price = await contract.mintPrice();
        const fee = await contract.mintFee?.() || 0n;
        const mintedByUser = await contract.userMints(await signer.getAddress());
        const remaining = Math.max(10 - Number(mintedByUser), 0);

        setMinted(Number(total));
        setPrice(price);
        setMintFee(fee);
        setRemainingLimit(remaining);
      } catch (err) {
        console.error("Failed to load NFT details:", err);
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
  const percent = ((minted / total) * 100).toFixed(1);
  const symbol = nft.nativeSymbol || "ETH";

  function formatCountdown(ms) {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    const h = hr % 24;
    const m = min % 60;
    const s = sec % 60;
    return `${day}d ${h}h ${m}m ${s}s`;
  }

  async function handleMint() {
    if (!signer || !nft || !price || amount < 1) return;
    try {
      setMinting(true);
      const contract = new Contract(nft.contract, nft.abi, signer);
      for (let i = 0; i < amount; i++) {
        const tx = await contract.mint({ value: price });
        await tx.wait();
      }
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
        {/* Header */}
        <div className="popup-header">
          <h2>{nft.name}</h2>
          {nft.networkIcon && (
            <img src={nft.networkIcon} alt="net" className="popup-network-icon" />
          )}
        </div>

        {/* Status row */}
        <div className="popup-status-row">
          <div className="popup-live">
            <span className="popup-status-dot" /> Live
          </div>
          <div className="popup-end">Ends in {formatCountdown(end - now)}</div>
        </div>

        {/* Progress row */}
        <div className="popup-progress-row">
          <span>Total Minted</span>
          <span className="popup-percent">
            {percent}% ({minted} / {total})
          </span>
        </div>

        <div className="popup-progress-bar">
          <div
            className="popup-progress-bar-inner"
            style={{ width: `${percent}%` }}
          ></div>
        </div>

        {/* Price + Quantity row */}
<div className="popup-price-quantity-row">
  <div className="popup-price-label-group">
  <div className="popup-price-label">Price</div>
  <div className="popup-price-value">
    {price ? `${Number(price) / 1e18} ${symbol}` : "..."}
  </div>
</div>
  <div className="popup-amount-row">
    <button onClick={() => setAmount(Math.max(amount - 1, 1))}>-</button>
    <input
      type="number"
      min={1}
      max={remainingLimit}
      value={amount}
      onChange={(e) =>
        setAmount(Math.min(Number(e.target.value), remainingLimit))
      }
    />
    <button onClick={() => setAmount(Math.min(amount + 1, remainingLimit))}>+</button>
  </div>
</div>


        {/* Mint fee row */}
        <div className="popup-mint-fee-row">
          <span>Mint Fee</span>
          <span>{Number(mintFee) / 1e18} {symbol}</span>
        </div>

        {/* Mint button */}
        <div className="popup-action">
          <button
            className="mint-button"
            onClick={handleMint}
            disabled={minting || !isMintLive || !signer || remainingLimit === 0}
          >
            {!signer ? "Connect Wallet" : minting ? "Minting..." : "Mint"}
          </button>
        </div>
      </div>
    </div>
  </div>
);
}

export default MintPopup;
