import { CandyMachine, Hero } from '@/components';
import { useWallet } from '@/hooks';
import { getSolanaSafety } from '@/utils/solana';

type Props = {
  //
};

const Page: React.VFC<Props> = ({}) => {
  const { walletAddress, connectWallet } = useWallet();
  const solana = getSolanaSafety();

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
              onClick={connectWallet}
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
