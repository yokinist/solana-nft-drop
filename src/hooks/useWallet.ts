import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PhantomProvider } from '@/types';

type ReturnUseWallet = {
  walletAddress: string | undefined;
  connectWallet: (solana: PhantomProvider | null) => void;
};

export const useWallet = (solana: PhantomProvider | null): ReturnUseWallet => {
  const [walletAddress, setWalletAddress] = useState<string>();

  const checkIfWalletIsConnected = async (solana: PhantomProvider) => {
    try {
      const response = await solana.connect({ onlyIfTrusted: true });
      const address = response.publicKey.toString();
      setWalletAddress(address);
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async (passedSolana: PhantomProvider | null) => {
    try {
      console.debug({ passedSolana });
      if (!passedSolana) return;
      const response = await passedSolana.connect();
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
