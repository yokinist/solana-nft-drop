import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PhantomProvider } from '@/types';

type ReturnUseWallet = {
  walletAddress: string | undefined;
  connectWallet: () => void;
};

export const useWallet = (solana: PhantomProvider | null): ReturnUseWallet => {
  const [walletAddress, setWalletAddress] = useState<string>();
  const [solanaState, setSolanaState] = useState<PhantomProvider | null>(null);

  const checkIfWalletIsConnected = async (solana: PhantomProvider) => {
    try {
      setSolanaState(solana);
      const response = await solana.connect({ onlyIfTrusted: true });
      const address = response.publicKey.toString();
      setWalletAddress(address);
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = useCallback(async () => {
    try {
      console.debug({ solanaState });
      if (!solanaState) return;
      const response = await solanaState.connect();
      setWalletAddress(response.publicKey.toString());
      // something here
    } catch (error) {
      console.error(error);
    }
  }, [solanaState]);

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
