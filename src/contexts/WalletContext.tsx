import { createContext, useContext, useState, ReactNode } from 'react';
import { WalletState } from '@/types';

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balance: 0,
  });

  const connect = async () => {
    // Mock wallet connection - replace with actual Linera wallet integration
    setTimeout(() => {
      setWallet({
        connected: true,
        address: 'e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65010000000000000000000000',
        balance: 1000.5,
      });
    }, 500);
  };

  const disconnect = () => {
    setWallet({
      connected: false,
      address: null,
      balance: 0,
    });
  };

  return (
    <WalletContext.Provider value={{ ...wallet, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
