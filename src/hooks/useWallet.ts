import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type ReturnUseWallet = {
  walletAddress: string | undefined;
  connectWallet: () => void;
};

export const useWallet = (): ReturnUseWallet => {
  const [walletAddress, setWalletAddress] = useState<string>();

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (!solana || !solana?.isPhantom) {
        toast('Solana object not found! Get a Phantom Wallet', { icon: '👻' });
        return;
      }
      const response = await solana.connect({ onlyIfTrusted: true });
      const address = response.publicKey.toString();
      setWalletAddress(address);
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { solana } = window;
      if (!solana) return;
      const response = await solana.connect();
      setWalletAddress(response.publicKey.toString());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => {
      window.removeEventListener('load', onLoad);
    };
  }, []);

  return {
    walletAddress,
    connectWallet,
  };
};
