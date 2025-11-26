import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import SignClient from '@walletconnect/sign-client';
import { WalletConnectModal } from '@walletconnect/modal';
import { WalletState, WalletContextState } from '@/types';

// WalletConnect Project ID from environment variable (placeholder)
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '';

interface WalletContextType extends WalletState, WalletContextState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Initialize WalletConnect modal (only if projectId is set)
let walletConnectModal: WalletConnectModal | null = null;
if (projectId) {
  walletConnectModal = new WalletConnectModal({
    projectId,
    chains: ['eip155:1'], // Ethereum mainnet as placeholder
  });
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [signClient, setSignClient] = useState<SignClient | null>(null);
  const [session, setSession] = useState<Awaited<ReturnType<SignClient['connect']>>['session'] | null>(null);
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balance: 0,
  });

  // Derived state for new interface
  const accountId = wallet.address;
  const isConnected = wallet.connected;

  // Initialize SignClient
  useEffect(() => {
    const initSignClient = async () => {
      if (!projectId) {
        console.warn('WalletConnect: VITE_WALLET_CONNECT_PROJECT_ID is not set');
        return;
      }

      try {
        const client = await SignClient.init({
          projectId,
          metadata: {
            name: 'ChainBet',
            description: 'Decentralized Sportsbook on Linera',
            url: window.location.origin,
            icons: [`${window.location.origin}/chainbet-logo.png`],
          },
        });
        setSignClient(client);

        // Check for existing session
        if (client.session.length > 0) {
          const existingSession = client.session.getAll()[0];
          setSession(existingSession);
          const accounts = existingSession.namespaces.eip155?.accounts || [];
          if (accounts.length > 0) {
            // Extract address from CAIP-10 format (e.g., "eip155:1:0x...")
            const address = accounts[0].split(':')[2];
            setWallet({
              connected: true,
              address,
              balance: 0, // Balance would be fetched from chain
            });
          }
        }
      } catch (error) {
        console.error('Failed to initialize WalletConnect SignClient:', error);
      }
    };

    initSignClient();
  }, []);

  const connect = useCallback(async () => {
    if (!signClient || !walletConnectModal) {
      console.error('WalletConnect: SignClient or Modal not initialized. Check VITE_WALLET_CONNECT_PROJECT_ID.');
      return;
    }

    try {
      const { uri, approval } = await signClient.connect({
        requiredNamespaces: {
          eip155: {
            methods: ['eth_sendTransaction', 'personal_sign'],
            chains: ['eip155:1'],
            events: ['accountsChanged', 'chainChanged'],
          },
        },
      });

      if (uri) {
        await walletConnectModal.openModal({ uri });
      }

      const newSession = await approval();
      setSession(newSession);
      walletConnectModal.closeModal();

      const accounts = newSession.namespaces.eip155?.accounts || [];
      if (accounts.length > 0) {
        // Extract address from CAIP-10 format
        const address = accounts[0].split(':')[2];
        setWallet({
          connected: true,
          address,
          balance: 0,
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      walletConnectModal?.closeModal();
    }
  }, [signClient]);

  const disconnect = useCallback(async () => {
    if (signClient && session) {
      try {
        await signClient.disconnect({
          topic: session.topic,
          reason: { code: 6000, message: 'User disconnected' },
        });
      } catch (error) {
        console.error('Failed to disconnect:', error);
      }
    }
    setSession(null);
    setWallet({
      connected: false,
      address: null,
      balance: 0,
    });
  }, [signClient, session]);

  return (
    <WalletContext.Provider value={{ ...wallet, accountId, isConnected, connect, disconnect }}>
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
