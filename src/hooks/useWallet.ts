import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSolanaSafety } from '@/utils/solana';

type ReturnUseWallet = {
  isRinkebyTestNetwork: boolean;
  currentAccount: string | undefined;
  connectWallet: () => void;
  checkIfWalletIsConnected: () => void;
};

export const useWallet = (): ReturnUseWallet => {
  const [currentAccount, setCurrentAccount] = useState<string>();
  const [isRinkebyTestNetwork, setRinkebyTestNetwork] = useState<boolean>(false);
  const solana = getSolanaSafety();

  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      if (solana && solana.isPhantom) {
        toast('Phantom wallet found');
        const response = await solana.connect({ onlyIfTrusted: true });
        console.info('Connected with Public Key:', response.publicKey.toString());
        const address = response.publicKey.toString();
        console.debug(address);
        setCurrentAccount(address);
      } else {
        toast('Solana object not found! Get a Phantom Wallet', { icon: '👻' });
        return;
      }
    } catch (error) {
      console.error(error);
    }
  }, [solana]);

  const connectWallet = async () => {
    try {
      if (!solana) return;
      const response = await solana.connect();
      console.info('Connected with Public Key:', response.publicKey.toString());
      setCurrentAccount(response.publicKey.toString());
      // something here
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isRinkebyTestNetwork,
    currentAccount,
    connectWallet,
    checkIfWalletIsConnected,
  };
};
