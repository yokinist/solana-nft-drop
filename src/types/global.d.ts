import { MetaMaskInpageProvider } from '@metamask/providers';
import { PhantomProvider } from '.';

declare global {
  interface Window {
    solana?: PhantomProvider;
    // #TODO: あとで消す
    ethereum?: MetaMaskInpageProvider;
  }
}
