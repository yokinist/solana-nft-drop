import { PhantomProvider } from '@/types';

export const getSolanaSafety = (): PhantomProvider | null => {
  if (typeof window !== 'undefined' && typeof window.solana !== 'undefined') {
    const { solana } = window;
    return solana;
  }
  return null;
};
