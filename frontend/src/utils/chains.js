export const CHAINS = {
  MONAD: {
    chainId: 10143,
    chainName: "Monad Testnet",
    rpcUrls: ["https://testnet-rpc.monad.xyz"],
    nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
    blockExplorerUrls: ["https://testnet.monadexplorer.com/"],
    contractAddress: "0xC31a96E6DAd62B84e90cF6Cc77928EAcFA95E579" // <- Bạn điền vào đây
  },
  SOMNIA: {
    chainId: 50312,
    chainName: "Somnia Testnet",
    rpcUrls: ["https://dream-rpc.somnia.network"],
    nativeCurrency: { name: "Somnia", symbol: "STT", decimals: 18 },
    blockExplorerUrls: ["https://shannon-explorer.somnia.network/"],
    contractAddress: "YOUR_SOMNIA_CONTRACT_ADDRESS_HERE" // <- Bạn điền vào đây
  }
};
