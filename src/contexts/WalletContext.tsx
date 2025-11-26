import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { WalletState } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, AlertCircle } from 'lucide-react';

// Extend Window interface for Linera provider
declare global {
  interface Window {
    linera?: LineraProvider;
    lineraProvider?: LineraProvider;
  }
}

interface LineraProvider {
  requestAccounts(): Promise<string[]>;
  getBalance(accountId: string): Promise<number>;
  signAndSubmit?(operation: unknown): Promise<unknown>;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  signAndSubmit: (operation: unknown) => Promise<unknown>;
}

const STORAGE_KEY = 'chainbet-wallet-account';

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function getLineraProvider(): LineraProvider | null {
  if (typeof window !== 'undefined') {
    return window.linera || window.lineraProvider || null;
  }
  return null;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    accountId: null,
    balance: 0,
    isConnecting: false,
    isConnected: false,
    // Legacy fields
    connected: false,
    address: null,
  });
  
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualAccountId, setManualAccountId] = useState('');

  // Refresh balance for the connected account
  const refreshBalance = useCallback(async () => {
    if (!wallet.accountId) return;
    
    const provider = getLineraProvider();
    if (provider) {
      try {
        const balance = await provider.getBalance(wallet.accountId);
        setWallet(prev => ({ ...prev, balance }));
      } catch {
        // Silently fail balance refresh
      }
    }
  }, [wallet.accountId]);

  // Sign and submit an operation (placeholder for actual implementation)
  const signAndSubmit = useCallback(async (operation: unknown): Promise<unknown> => {
    const provider = getLineraProvider();
    if (provider?.signAndSubmit) {
      return provider.signAndSubmit(operation);
    }
    // Placeholder: In read-only mode, this would fail
    console.warn('Wallet operation attempted in read-only mode:', operation);
    throw new Error('Wallet is in read-only mode. Please connect a real Linera wallet to perform transactions.');
  }, []);

  // Connect to wallet
  const connect = useCallback(async () => {
    setWallet(prev => ({ ...prev, isConnecting: true }));
    
    const provider = getLineraProvider();
    
    if (provider) {
      try {
        const accounts = await provider.requestAccounts();
        if (accounts && accounts.length > 0) {
          const accountId = accounts[0];
          const balance = await provider.getBalance(accountId);
          
          // Persist to localStorage
          localStorage.setItem(STORAGE_KEY, accountId);
          
          setWallet({
            accountId,
            balance,
            isConnecting: false,
            isConnected: true,
            // Legacy fields
            connected: true,
            address: accountId,
          });
          return;
        }
      } catch (error) {
        console.error('Failed to connect to Linera wallet:', error);
      }
    }
    
    // No provider available or connection failed - show manual input modal
    setWallet(prev => ({ ...prev, isConnecting: false }));
    setShowManualModal(true);
  }, []);

  // Handle manual account ID submission (read-only/demo mode)
  const handleManualConnect = useCallback(() => {
    if (manualAccountId.trim()) {
      const accountId = manualAccountId.trim();
      
      // Persist to localStorage
      localStorage.setItem(STORAGE_KEY, accountId);
      
      setWallet({
        accountId,
        balance: 0, // Read-only mode has no real balance
        isConnecting: false,
        isConnected: true,
        connected: true,
        address: accountId,
      });
      
      setShowManualModal(false);
      setManualAccountId('');
    }
  }, [manualAccountId]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setWallet({
      accountId: null,
      balance: 0,
      isConnecting: false,
      isConnected: false,
      connected: false,
      address: null,
    });
  }, []);

  // Auto-reconnect from localStorage on mount
  useEffect(() => {
    const savedAccountId = localStorage.getItem(STORAGE_KEY);
    if (savedAccountId) {
      const provider = getLineraProvider();
      
      if (provider) {
        // Try to get balance for saved account
        provider.getBalance(savedAccountId)
          .then(balance => {
            setWallet({
              accountId: savedAccountId,
              balance,
              isConnecting: false,
              isConnected: true,
              connected: true,
              address: savedAccountId,
            });
          })
          .catch(() => {
            // If balance fetch fails, still connect in read-only mode
            setWallet({
              accountId: savedAccountId,
              balance: 0,
              isConnecting: false,
              isConnected: true,
              connected: true,
              address: savedAccountId,
            });
          });
      } else {
        // No provider - connect in read-only mode
        setWallet({
          accountId: savedAccountId,
          balance: 0,
          isConnecting: false,
          isConnected: true,
          connected: true,
          address: savedAccountId,
        });
      }
    }
  }, []);

  return (
    <WalletContext.Provider value={{ ...wallet, connect, disconnect, refreshBalance, signAndSubmit }}>
      {children}
      
      {/* Manual Account ID Modal for read-only/demo mode */}
      <Dialog open={showManualModal} onOpenChange={setShowManualModal}>
        <DialogContent className="sm:max-w-md gradient-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Connect Wallet
            </DialogTitle>
            <DialogDescription>
              No Linera wallet provider detected. Enter your account ID to view your bets in read-only mode.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
              <AlertCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-xs text-accent">
                Read-only mode allows you to view events and your betting history, but you won&apos;t be able to place new bets without a connected Linera wallet.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                placeholder="e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65..."
                value={manualAccountId}
                onChange={(e) => setManualAccountId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your Linera account ID (chain ID)
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowManualModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleManualConnect}
                disabled={!manualAccountId.trim()}
              >
                Connect (Read-Only)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
