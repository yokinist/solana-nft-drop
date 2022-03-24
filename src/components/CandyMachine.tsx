import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/solid';
import { Signer } from '@solana/web3.js';
import { CountDown } from '@/components';
import { useCandyMachine } from '@/hooks';
import { formatDate } from '@/libs/date';
import { Spinner } from '@/shared';

type Props = {
  walletAddress: Signer;
};

export const CandyMachine: React.VFC<Props> = ({ walletAddress }) => {
  const { candyMachine, buttonState, mintToken, dropDate } = useCandyMachine({ walletAddress });
  return candyMachine?.state && buttonState ? (
    <>
      <div className="flex flex-col">
        <div>
          {buttonState === 'mintNow' && (
            <div>
              <button
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                onClick={mintToken}
              >
                Mint NFT
              </button>
              <div className="text-left mt-4">
                <span className="text-xl tracking-tight bold text-gray-900 sm:text-2xl md:text-3xl font-mono mr-2">
                  {candyMachine.state.itemsRedeemed}/{candyMachine.state.itemsAvailable}
                </span>
                <span className="base text-gray-500 mb-2 text-sm">Minted</span>
              </div>
            </div>
          )}
          {buttonState === 'waitMint' && dropDate && (
            <>
              <CountDown dropDate={dropDate} />
              <div className="rounded-md bg-blue-50 p-4 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3 flex-1 md:flex md:justify-between">
                    <p className="text-sm text-blue-700">Drop Date: {formatDate(dropDate)} (JST)</p>
                  </div>
                </div>
              </div>
            </>
          )}
          {buttonState === 'soldOut' && <p>sold out</p>}
        </div>
      </div>
    </>
  ) : (
    <div className="mt-8 mx-auto">
      <Spinner loading theme="default" />
    </div>
  );
};
