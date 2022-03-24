import { PhantomProvider } from '.';

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}
