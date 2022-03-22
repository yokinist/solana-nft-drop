import { MetaMaskInpageProvider as MetaMaskInpageProviderType } from '@metamask/providers';
import * as anchor from '@project-serum/anchor';
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

export type CandyMachineType = {
  id: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  program: anchor.Program;
  state: CandyMachineState;
};

export type CandyMachineState = {
  itemsAvailable: number;
  itemsRedeemed: number;
  itemsRemaining: number;
  treasury: anchor.web3.PublicKey;
  tokenMint: anchor.web3.PublicKey;
  isSoldOut: boolean;
  isActive: boolean;
  isPresale: boolean;
  goLiveDate: anchor.BN;
  goLiveDateTimeString: string;
  price: anchor.BN;
  gatekeeper: null | {
    expireOnUse: boolean;
    gatekeeperNetwork: anchor.web3.PublicKey;
  };
  endSettings: null | [number, anchor.BN];
  whitelistMintSettings: null | {
    mode: any;
    mint: anchor.web3.PublicKey;
    presale: boolean;
    discountPrice: null | anchor.BN;
  };
  hiddenSettings: null | {
    name: string;
    uri: string;
    hash: Uint8Array;
  };
};
