import { marketNftAbi } from "../abi/marketNftAbi";

export const nfts = [
  {
    name: "Monad Genesis",
    image: "https://gateway.pinata.cloud/ipfs/bafkreie2j4ylmjilhisacdb7qyrnc4y7jaf2ekojloeteb5n2g77niyali",
    contract: "0x996A63131F8769484391A76441A63cf1e70E3a26",
    abi: marketNftAbi,
    chain: "MONAD",
    networkIcon: "/icon/monad.svg",
    price: "0.01", // dùng để hiển thị
    nativeSymbol: "MON",
    supply: 100,
    minted: 5, // tạm hardcode, sau có thể lấy từ contract
    mintStart: "2025-05-05T02:00:00Z", // UTC
    mintEnd: "2025-05-15T02:00:00Z"
  },
  {
    name: "Gasless Goblins",
    image: "https://gateway.pinata.cloud/ipfs/bafkreihtajvozyn5imbf24j3utbrujc62inrxcso6ahaamtv6pdeajskhi",
    contract: "0x130519CB420d7f016A839AA8127E6938b94EB4d4",
    abi: marketNftAbi,
    chain: "MONAD",
    networkIcon: "/icon/monad.svg",
    price: "0.01", // dùng để hiển thị
    nativeSymbol: "MON",
    supply: 100,
    minted: 5, // tạm hardcode, sau có thể lấy từ contract
    mintStart: "2025-05-08T02:00:00Z", // UTC
    mintEnd: "2025-05-15T02:00:00Z"
  }
];