import { useEffect, useState } from "react";

export function useMarketplace(contract, signer) {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (!contract) return;

    async function fetchListings() {
      try {
        const items = await contract.getActiveListings();
        setListings(items);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    }

    fetchListings();
  }, [contract]);

  async function cancelListing(listingId) {
    if (!contract) return;
    try {
      const tx = await contract.cancelListing(listingId);
      await tx.wait();
      alert("Listing canceled!");
    } catch (error) {
      console.error("Cancel error:", error);
    }
  }

  async function updateListing(listingId, newPrice) {
    if (!contract) return;
    try {
      const tx = await contract.updateListing(listingId, newPrice);
      await tx.wait();
      alert("Listing updated!");
    } catch (error) {
      console.error("Update error:", error);
    }
  }

  return { listings, cancelListing, updateListing };
}
