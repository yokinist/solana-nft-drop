import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PhantomProvider } from '@/types';

type ReturnUseWallet = {
  walletAddress: string | undefined;
  connectWallet: () => void;
};

export const useWallet = (solana: PhantomProvider | null): ReturnUseWallet => {
  const [walletAddress, setWalletAddress] = useState<string>();

  const checkIfWalletIsConnected = async (solana: PhantomProvider) => {
    try {
      const response = await solana.connect({ onlyIfTrusted: true });
      console.info('Connected with Public Key:', response.publicKey.toString());
      const address = response.publicKey.toString();
      console.debug(address);
      setWalletAddress(address);
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!solana) return;
      const response = await solana.connect();
      console.info('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
      // something here
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!solana?.isPhantom) {
      toast('Solana object not found! Get a Phantom Wallet', { icon: '👻' });
    } else {
      checkIfWalletIsConnected(solana);
    }
  }, [solana]);

  return {
    walletAddress,
    connectWallet,
  };
};
