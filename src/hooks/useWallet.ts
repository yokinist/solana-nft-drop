import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSolanaSafety } from '@/utils/solana';

type ReturnUseWallet = {
  walletAddress: string | undefined;
  connectWallet: () => void;
  checkIfWalletIsConnected: () => void;
};

export const useWallet = (): ReturnUseWallet => {
  const [walletAddress, setWalletAddress] = useState<string>();
  const solana = getSolanaSafety();

  const checkIfWalletIsConnected = async () => {
    try {
      if (solana?.isPhantom) {
        const response = await solana.connect({ onlyIfTrusted: true });
        console.info('Connected with Public Key:', response.publicKey.toString());
        const address = response.publicKey.toString();
        console.debug(address);
        setWalletAddress(address);
      } else {
        toast('Solana object not found! Get a Phantom Wallet', { icon: '👻' });
        return;
      }
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
    checkIfWalletIsConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    walletAddress,
    connectWallet,
    checkIfWalletIsConnected,
  };
};
