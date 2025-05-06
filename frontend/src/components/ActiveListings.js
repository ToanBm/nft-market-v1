function ActiveListings() {
  // Giả sử tạm thời hardcode 5 NFT vừa list
  const fakeListings = [
    { name: "NFT #1", price: "0.1 MON" },
    { name: "NFT #2", price: "0.2 MON" },
    { name: "NFT #3", price: "0.15 STT" },
    { name: "NFT #4", price: "0.05 MON" },
    { name: "NFT #5", price: "0.3 STT" },
  ];

  return (
    <div className="card">
      <h2>Recently Listed NFTs</h2>
      <ul>
        {fakeListings.map((nft, index) => (
          <li key={index}>
            {nft.name} — {nft.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ActiveListings;
