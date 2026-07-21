import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Dice6,
  Spade,
  Zap,
  Brain,
  TrendingUp,
  Compass,
  TrendingDown,
  Dice5,
  FlaskConical,
  Wallet,
  Target,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { path: "/roulette", label: "Roulette", icon: Dice6 },
  { path: "/blackjack", label: "Blackjack", icon: Spade },
  { path: "/slots", label: "Slots", icon: Zap },
  { path: "/poker", label: "Poker", icon: Compass },
  { path: "/strategies", label: "Betting Strategies", icon: TrendingUp },
  { path: "/expected-value", label: "Expected Value", icon: Target },
  { path: "/gamblers-ruin", label: "Gambler's Ruin", icon: TrendingDown },
  { path: "/kelly-criterion", label: "Kelly Criterion", icon: Dice5 },
  { path: "/psychology", label: "Psychology", icon: Brain },
  { path: "/monte-carlo", label: "Monte Carlo", icon: FlaskConical },
  { path: "/finance", label: "Finance", icon: Wallet },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-accent/30 bg-background/95 backdrop-blur-sm shadow-[0_1px_24px_-6px_hsl(var(--primary)/0.35)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            <Link
              to="/"
              className="flex items-center gap-2.5 min-w-0 flex-shrink"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex-shrink-0 neon-pulse">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-extrabold text-lg tracking-tight whitespace-nowrap truncate text-accent">
                Expected Value Lab
              </span>
            </Link>

            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 text-sm font-bold uppercase tracking-wide rounded-md border transition-all whitespace-nowrap",
                  menuOpen
                    ? "border-accent text-accent bg-accent/10 glow-ring-accent"
                    : "border-accent/40 text-accent hover:bg-accent/10 hover:border-accent hover:glow-ring-accent",
                )}
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                Modules
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-[min(90vw,32rem)] bg-card border border-accent/30 rounded-xl shadow-lg glow-ring p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                          isActive
                            ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                            : "text-foreground hover:bg-muted",
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-accent/20 bg-card/60 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          <p className="tracking-wide">
            <span className="text-accent">♠</span> Expected Value Lab{" "}
            <span className="text-accent">♦</span> Understanding Probability,
            Statistics, and Decision Theory{" "}
            <span className="text-accent">♥</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
