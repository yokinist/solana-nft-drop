import { CandyMachine, Hero } from '@/components';
import { useWallet } from '@/hooks';
import { getSolanaSafety } from '@/utils/solana';

type Props = {
  //
};

const Page: React.VFC<Props> = ({}) => {
  const solana = getSolanaSafety();
  const { walletAddress, connectWallet } = useWallet(solana);

  console.debug({ solana });

  return (
    <>
      <Hero>
        {solana && walletAddress ? (
          // @ts-ignore
          <CandyMachine walletAddress={solana} />
        ) : (
          <div className="rounded-md shadow">
            <button
              type="button"
              onClick={() => connectWallet(solana)}
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </Hero>
    </>
  );
};

export default Page;
