import { useWallet } from '@/hooks';
import CandyMachine from '@/libs/CandyMachine';
import { Button, Layout } from '@/shared';
import { getSolanaSafety } from '@/utils/solana';

type Props = {
  //
};

const Page: React.VFC<Props> = ({}) => {
  const { walletAddress, connectWallet } = useWallet();
  const solana = getSolanaSafety();

  return (
    <>
      <Layout>
        <div className="flex items-center">
          <div>
            <h3>🍭 Candy Drop</h3>
            <p>NFT drop machine with fair mint</p>
          </div>
          {walletAddress && solana ? (
            // @ts-ignore
            <CandyMachine walletAddress={solana} />
          ) : (
            <Button theme="primary" onClick={connectWallet}>
              Connect Wallet
            </Button>
          )}
        </div>
      </Layout>
    </>
  );
};

export default Page;
