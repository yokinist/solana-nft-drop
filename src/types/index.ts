import { MetaMaskInpageProvider as MetaMaskInpageProviderType } from '@metamask/providers';
import { PublicKey } from '@solana/web3.js';

type PhantomEvent = 'disconnect' | 'connect' | 'accountChanged';

type ConnectOpts = {
  onlyIfTrusted: boolean;
};

export type PhantomProvider = {
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, callback: (args: any) => void) => void;
  isPhantom: boolean;
};

// #TODO: あとで消す
export type EthereumType = MetaMaskInpageProviderType;
