import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit-tech/stellar-wallets-kit/modules/utils";
import { Networks } from "@creit-tech/stellar-wallets-kit/types";

// Initialize the kit with all available modules
StellarWalletsKit.init({
  network: Networks.TESTNET,
  modules: defaultModules()
});

export const connectStellarWallet = async (): Promise<string> => {
  try {
    const { address } = await StellarWalletsKit.authModal();
    return address;
  } catch (error) {
    console.error('Wallet connection failed', error);
    //Handle user cancellation or connection errors
    // The user wants real integration, so we should probably throw or handle it
    throw error;
  }
};

export { Networks as WalletNetwork };
export { StellarWalletsKit };
