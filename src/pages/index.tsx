import { useWallet } from '@/hooks';
import { Button, Layout } from '@/shared';

type Props = {
  //
};

const Page: React.VFC<Props> = ({}) => {
  const { currentAccount, connectWallet } = useWallet();

  return (
    <>
      <Layout>
        <div className="flex items-center">
          <div>
            <h3>🍭 Candy Drop</h3>
            <p>NFT drop machine with fair mint</p>
          </div>
          {currentAccount ? (
            <p>{currentAccount}</p>
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
