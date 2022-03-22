// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
import { Connection } from '@metaplex/js';
import * as anchor from '@project-serum/anchor';
import { Program, Provider, web3 } from '@project-serum/anchor';
import { MintLayout, TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import {
  AccountMeta,
  ConfirmOptions,
  PublicKey,
  PublicKeyInitData,
  Signer,
  TransactionInstruction,
} from '@solana/web3.js';
import { sendTransactions } from './connection';
import {
  candyMachineProgram,
  TOKEN_METADATA_PROGRAM_ID,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  getAtaForMint,
  getNetworkExpire,
  getNetworkToken,
  CIVIC,
} from './helper';
import { CandyMachineType } from '@/types';
import { getSolanaSafety } from '@/utils/solana';

const { SystemProgram } = web3;

const opts: ConfirmOptions = {
  preflightCommitment: 'processed',
};

type Props = {
  walletAddress: Signer;
};

const CandyMachine: React.VFC<Props> = ({ walletAddress }) => {
  const [candyMachine, setCandyMachine] = useState<CandyMachineType>();

  const solana = getSolanaSafety();

  const getCandyMachineCreator = async (candyMachine: PublicKeyInitData) => {
    const candyMachineID = new PublicKey(candyMachine);
    return await web3.PublicKey.findProgramAddress(
      [Buffer.from('candy_machine'), candyMachineID.toBuffer()],
      candyMachineProgram,
    );
  };

  const getMetadata = async (mint: PublicKey) => {
    return (
      await PublicKey.findProgramAddress(
        [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID,
      )
    )[0];
  };

  const getMasterEdition = async (mint: PublicKey) => {
    return (
      await PublicKey.findProgramAddress(
        [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from('edition')],
        TOKEN_METADATA_PROGRAM_ID,
      )
    )[0];
  };

  const createAssociatedTokenAccountInstruction = (
    associatedTokenAddress: PublicKey,
    payer: PublicKey,
    walletAddress: PublicKey,
    splTokenMintAddress: PublicKey,
  ): TransactionInstruction => {
    const keys: web3.AccountMeta[] = [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
      { pubkey: walletAddress, isSigner: false, isWritable: false },
      { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
      {
        pubkey: web3.SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      {
        pubkey: web3.SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ];
    return new web3.TransactionInstruction({
      keys,
      programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      data: Buffer.from([]),
    });
  };

  const mintToken = async (candyMachine: CandyMachineType) => {
    const mint = web3.Keypair.generate();

    const userTokenAccountAddress: PublicKey = (await getAtaForMint(mint.publicKey, walletAddress.publicKey))[0];

    const userPayingAccountAddress: PublicKey = candyMachine.state.tokenMint
      ? (await getAtaForMint(candyMachine.state.tokenMint, walletAddress.publicKey))[0]
      : walletAddress.publicKey;

    const candyMachineAddress = candyMachine.id;
    const remainingAccounts: AccountMeta[] = [];
    const signers = [mint];
    const cleanupInstructions: TransactionInstruction[] = [];
    const instructions: TransactionInstruction[] = [
      web3.SystemProgram.createAccount({
        fromPubkey: walletAddress.publicKey,
        newAccountPubkey: mint.publicKey,
        space: MintLayout.span,
        lamports: await candyMachine.program.provider.connection.getMinimumBalanceForRentExemption(MintLayout.span),
        programId: TOKEN_PROGRAM_ID,
      }),
      Token.createInitMintInstruction(
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        0,
        walletAddress.publicKey,
        walletAddress.publicKey,
      ),
      createAssociatedTokenAccountInstruction(
        userTokenAccountAddress,
        walletAddress.publicKey,
        walletAddress.publicKey,
        mint.publicKey,
      ),
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        userTokenAccountAddress,
        walletAddress.publicKey,
        [],
        1,
      ),
    ];

    if (candyMachine.state.gatekeeper) {
      remainingAccounts.push({
        pubkey: (await getNetworkToken(walletAddress.publicKey, candyMachine.state.gatekeeper.gatekeeperNetwork))[0],
        isWritable: true,
        isSigner: false,
      });
      if (candyMachine.state.gatekeeper.expireOnUse) {
        remainingAccounts.push({
          pubkey: CIVIC,
          isWritable: false,
          isSigner: false,
        });
        remainingAccounts.push({
          pubkey: (await getNetworkExpire(candyMachine.state.gatekeeper.gatekeeperNetwork))[0],
          isWritable: false,
          isSigner: false,
        });
      }
    }
    if (candyMachine.state.whitelistMintSettings) {
      const mint = new web3.PublicKey(candyMachine.state.whitelistMintSettings.mint);

      const whitelistToken = (await getAtaForMint(mint, walletAddress.publicKey))[0];
      remainingAccounts.push({
        pubkey: whitelistToken,
        isWritable: true,
        isSigner: false,
      });

      if (candyMachine.state.whitelistMintSettings.mode.burnEveryTime) {
        const whitelistBurnAuthority = web3.Keypair.generate();

        remainingAccounts.push({
          pubkey: mint,
          isWritable: true,
          isSigner: false,
        });
        remainingAccounts.push({
          pubkey: whitelistBurnAuthority.publicKey,
          isWritable: false,
          isSigner: true,
        });
        signers.push(whitelistBurnAuthority);
        const exists = await candyMachine.program.provider.connection.getAccountInfo(whitelistToken);
        if (exists) {
          instructions.push(
            Token.createApproveInstruction(
              TOKEN_PROGRAM_ID,
              whitelistToken,
              whitelistBurnAuthority.publicKey,
              walletAddress.publicKey,
              [],
              1,
            ),
          );
          cleanupInstructions.push(
            Token.createRevokeInstruction(TOKEN_PROGRAM_ID, whitelistToken, walletAddress.publicKey, []),
          );
        }
      }
    }

    if (candyMachine.state.tokenMint) {
      const transferAuthority = web3.Keypair.generate();

      signers.push(transferAuthority);
      remainingAccounts.push({
        pubkey: userPayingAccountAddress,
        isWritable: true,
        isSigner: false,
      });
      remainingAccounts.push({
        pubkey: transferAuthority.publicKey,
        isWritable: false,
        isSigner: true,
      });

      instructions.push(
        Token.createApproveInstruction(
          TOKEN_PROGRAM_ID,
          userPayingAccountAddress,
          transferAuthority.publicKey,
          walletAddress.publicKey,
          [],
          candyMachine.state.price.toNumber(),
        ),
      );
      cleanupInstructions.push(
        Token.createRevokeInstruction(TOKEN_PROGRAM_ID, userPayingAccountAddress, walletAddress.publicKey, []),
      );
    }
    const metadataAddress = await getMetadata(mint.publicKey);
    const masterEdition = await getMasterEdition(mint.publicKey);

    const [candyMachineCreator, creatorBump] = await getCandyMachineCreator(candyMachineAddress);

    instructions.push(
      await candyMachine.program.instruction.mintNft(creatorBump, {
        accounts: {
          candyMachine: candyMachineAddress,
          candyMachineCreator,
          payer: walletAddress.publicKey,
          wallet: candyMachine.state.treasury,
          mint: mint.publicKey,
          metadata: metadataAddress,
          masterEdition,
          mintAuthority: walletAddress.publicKey,
          updateAuthority: walletAddress.publicKey,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
          recentBlockhashes: web3.SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
          instructionSysvarAccount: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        remainingAccounts: remainingAccounts.length > 0 ? remainingAccounts : undefined,
      }),
    );

    try {
      return (
        await sendTransactions(
          candyMachine.program.provider.connection,
          candyMachine.program.provider.wallet,
          [instructions, cleanupInstructions],
          [signers, []],
          'Parallel',
          'processed',
        )
      ).txs.map((t) => t.txid);
    } catch (e) {
      console.error(e);
    }
    return [];
  };

  const getProvider = useCallback(() => {
    if (!solana) return;
    const rpcHost = process.env.SOLANA_RPC_HOST;
    // connectionオブジェクトを作成
    const connection = new Connection(rpcHost);

    // 新しくSolanaのprovider オブジェクトを作成する
    // @ts-ignore
    const provider = new Provider(connection, solana, opts);

    return provider;
  }, [solana]);

  // getCandyMachineStateを非同期の関数として宣言する。
  const getCandyMachineState = useCallback(async () => {
    console.debug('hogegee');
    const { CANDY_MACHINE_ID } = process.env;
    const provider = getProvider();

    console.debug({ provider });

    //  デプロイされたCandy Machineプログラムのメタデータを取得する
    const idl = await Program.fetchIdl(candyMachineProgram, provider);

    console.debug({ idl });

    console.debug({ CANDY_MACHINE_ID });

    if (!idl || !CANDY_MACHINE_ID) return;

    // 呼び出し可能なプログラムを作成する
    const program: anchor.Program = new Program(idl, candyMachineProgram, provider);

    // Candy Machineからメタデータを取得する
    const candyMachine = await program.account.candyMachine.fetch(CANDY_MACHINE_ID);

    //メタデータをすべて解析してログアウトする
    const itemsAvailable: number = candyMachine.data.itemsAvailable.toNumber();
    const itemsRedeemed: number = candyMachine.itemsRedeemed.toNumber();
    const itemsRemaining: number = itemsAvailable - itemsRedeemed;
    const goLiveData: number = candyMachine.data.goLiveDate.toNumber();
    const presale: boolean =
      candyMachine.data.whitelistMintSettings &&
      candyMachine.data.whitelistMintSettings.presale &&
      (!candyMachine.data.goLiveDate || candyMachine.data.goLiveDate.toNumber() > new Date().getTime() / 1000);

    const goLiveDateTimeString = `${new Date(goLiveData * 1000).toLocaleDateString()} @ ${new Date(
      goLiveData * 1000,
    ).toLocaleTimeString()}`;

    // このデータをstateに追加してレンダリングする
    setCandyMachine({
      id: CANDY_MACHINE_ID,
      program,
      state: {
        itemsAvailable,
        itemsRedeemed,
        itemsRemaining,
        goLiveDate: goLiveData as any,
        goLiveDateTimeString,
        isSoldOut: itemsRemaining === 0,
        isActive:
          (presale || candyMachine.data.goLiveDate.toNumber() < new Date().getTime() / 1000) &&
          (candyMachine.endSettings
            ? candyMachine.endSettings.endSettingType.date
              ? candyMachine.endSettings.number.toNumber() > new Date().getTime() / 1000
              : itemsRedeemed < candyMachine.endSettings.number.toNumber()
            : true),
        isPresale: presale,
        goLiveDate: candyMachine.data.goLiveDate,
        treasury: candyMachine.wallet,
        tokenMint: candyMachine.tokenMint,
        gatekeeper: candyMachine.data.gatekeeper,
        endSettings: candyMachine.data.endSettings,
        whitelistMintSettings: candyMachine.data.whitelistMintSettings,
        hiddenSettings: candyMachine.data.hiddenSettings,
        price: candyMachine.data.price,
      },
    });
  }, [getProvider]);

  useEffect(() => {
    console.debug(candyMachine);
  }, [candyMachine]);

  useEffect(() => {
    getCandyMachineState();
  }, []);

  return candyMachine ? (
    <div className="machine-container">
      <p>{`Drop Date: ${candyMachine.state.goLiveDateTimeString}`}</p>
      <p>{`Items Minted: ${candyMachine.state.itemsRedeemed} / ${candyMachine.state.itemsAvailable}`}</p>
      <button className="cta-button mint-button" onClick={null}>
        Mint NFT
      </button>
    </div>
  ) : null;
};

export default CandyMachine;
