import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  Calendar,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetMyHalls,
  useGetUserProfile,
  useIsAdmin,
} from "../hooks/useQueries";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: profile } = useGetUserProfile();
  const { data: myHalls } = useGetMyHalls();
  const { data: isAdmin } = useIsAdmin();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isOwner = (myHalls && myHalls.length > 0) || false;
  const isLoggedIn = !!identity;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Browse Halls" },
    { href: "/about", label: "About" },
    { href: "/terms", label: "T&C" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-gold/15 shadow-xs">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            data-ocid="nav.home.link"
          >
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-gold-sm group-hover:shadow-gold transition-shadow duration-200">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Shaadi<span className="text-gold-gradient">Khaana</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-ocid={`nav.${link.label.toLowerCase().replace(/[^a-z0-9]/g, "_")}.link`}
                className={`text-sm font-medium transition-colors duration-150 font-body ${
                  currentPath === link.href
                    ? "text-gold"
                    : "text-foreground/60 hover:text-gold"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-gold/25 hover:border-gold/50 hover:bg-gold/5 transition-all duration-150"
                    data-ocid="nav.account.button"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs text-primary-foreground font-bold">
                        {profile?.displayName?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="max-w-[100px] truncate text-foreground/80">
                      {profile?.displayName || "Account"}
                    </span>
                    <ChevronDown className="w-3 h-3 text-foreground/50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-card border-gold/20"
                  data-ocid="nav.account.dropdown_menu"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 hover:text-gold focus:text-gold"
                      data-ocid="nav.my_bookings.link"
                    >
                      <Calendar className="w-4 h-4" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  {isOwner && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/owner"
                        className="flex items-center gap-2 hover:text-gold focus:text-gold"
                        data-ocid="nav.owner_dashboard.link"
                      >
                        <Building2 className="w-4 h-4" />
                        Owner Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 hover:text-gold focus:text-gold"
                        data-ocid="nav.admin_panel.link"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link
                      to="/register"
                      className="flex items-center gap-2 hover:text-gold focus:text-gold"
                      data-ocid="nav.profile.link"
                    >
                      <User className="w-4 h-4" />
                      {profile ? "Edit Profile" : "Complete Profile"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gold/10" />
                  <DropdownMenuItem
                    onClick={clear}
                    className="text-destructive focus:text-destructive"
                    data-ocid="nav.sign_out.button"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="text-foreground/60 hover:text-gold hover:bg-gold/5"
                  data-ocid="nav.sign_in.button"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold-sm hover:shadow-gold transition-all duration-200"
                  data-ocid="nav.get_started.button"
                >
                  {isLoggingIn ? "Connecting..." : "Get Started"}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-gold/10 text-foreground/60 hover:text-gold transition-colors duration-150"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            data-ocid="nav.mobile_menu.toggle"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gold/15 bg-card overflow-hidden"
            >
              <div className="container px-4 py-4 flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`text-sm font-medium py-2 transition-colors duration-150 ${
                      currentPath === link.href
                        ? "text-gold"
                        : "text-foreground/60 hover:text-gold"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-sm py-2 font-medium text-foreground/70 hover:text-gold transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      My Bookings
                    </Link>
                    {isOwner && (
                      <Link
                        to="/owner"
                        className="text-sm py-2 font-medium text-foreground/70 hover:text-gold transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        Owner Dashboard
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="text-sm py-2 font-medium text-foreground/70 hover:text-gold transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        clear();
                        setMobileOpen(false);
                      }}
                      className="w-full mt-2 border-gold/25 text-foreground/70 hover:border-gold/50 hover:text-gold"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      login();
                      setMobileOpen(false);
                    }}
                    disabled={isLoggingIn}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isLoggingIn ? "Connecting..." : "Get Started"}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[oklch(0.10_0.015_25)] border-t border-gold/15 py-14 mt-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-mughal-pattern opacity-50" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-gold-sm">
                  <Building2 className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-xl text-foreground">
                  Shaadi<span className="text-gold-gradient">Khaana</span>
                </span>
              </div>
              <p className="text-sm text-foreground/45 max-w-xs leading-relaxed">
                India's premier platform for discovering and booking the perfect
                venue for your celebrations — weddings, parties, and everything
                in between.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground/80 text-sm mb-4 uppercase tracking-widest font-body">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-sm text-foreground/45">
                <li>
                  <Link
                    to="/"
                    className="hover:text-gold transition-colors duration-150"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/search"
                    className="hover:text-gold transition-colors duration-150"
                  >
                    Browse Halls
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="hover:text-gold transition-colors duration-150"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="hover:text-gold transition-colors duration-150"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground/80 text-sm mb-4 uppercase tracking-widest font-body">
                For Owners
              </h4>
              <ul className="space-y-2.5 text-sm text-foreground/45">
                <li>
                  <Link
                    to="/register"
                    className="hover:text-gold transition-colors duration-150"
                  >
                    List Your Hall
                  </Link>
                </li>
                <li>
                  <Link
                    to="/owner"
                    className="hover:text-gold transition-colors duration-150"
                  >
                    Owner Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          {/* Gold ornamental divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/20" />
            <div className="w-1 h-1 rotate-45 bg-gold/40" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/20" />
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-foreground/30">
              © {new Date().getFullYear()} ShaadiKhaana. All rights reserved.
            </p>
            <p className="text-xs text-foreground/30">
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold/70 underline transition-colors duration-150"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
