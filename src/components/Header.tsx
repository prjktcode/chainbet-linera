import { Link, useLocation } from 'react-router-dom';
import { Wallet, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import logo from '@/assets/chainbet-logo.png';

export function Header() {
  const { connected, address, balance, connect, disconnect } = useWallet();
  const location = useLocation();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={logo} alt="ChainBet" className="h-10 w-10" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gradient">ChainBet</span>
              <span className="text-xs text-muted-foreground">Built on Linera</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Events
              </div>
            </Link>
            <Link
              to="/my-bets"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/my-bets') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              My Bets
            </Link>
            <Link
              to="/admin"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/admin') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Admin
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {connected ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs text-muted-foreground">Balance</span>
                  <span className="text-sm font-semibold text-accent">{balance.toFixed(2)} LINERA</span>
                </div>
                <Button variant="outline" size="sm" onClick={disconnect}>
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">{formatAddress(address!)}</span>
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={connect}>
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
