import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  Info,
  Loader2,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetUserProfile,
  useGetUserRole,
  useSaveUserProfile,
} from "../hooks/useQueries";
import { getSecretParameter, storeSessionParameter } from "../utils/urlParams";

type AccountType = "customer" | "owner" | "admin";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: existingProfile, isLoading } = useGetUserProfile();
  const { data: currentRole } = useGetUserRole();
  const saveProfile = useSaveUserProfile();

  const hasAdminToken = !!getSecretParameter("caffeineAdminToken");
  const [accountType, setAccountType] = useState<AccountType>("customer");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [manualAdminToken, setManualAdminToken] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Pre-fill from existing profile
  useEffect(() => {
    if (existingProfile) {
      setDisplayName(existingProfile.displayName || "");
      setEmail(existingProfile.email || "");
      setPhone(existingProfile.phone || "");
      // Determine account type from role
      if (currentRole === UserRole.admin) setAccountType("admin");
      else if (currentRole === UserRole.user) setAccountType("owner");
      else setAccountType("customer");
    } else if (hasAdminToken) {
      // New registration with admin token — pre-select admin
      setAccountType("admin");
    }
  }, [existingProfile, currentRole, hasAdminToken]);

  if (!identity) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-card rounded-2xl border border-border shadow-card p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Create Your Account
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Sign in first to create or manage your ShaadiKhaana account.
            </p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full bg-primary text-primary-foreground"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isLoggingIn ? "Connecting..." : "Sign In with Internet Identity"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!identity || !displayName.trim()) return;

    // If admin is selected but token not yet in session, store it first
    if (accountType === "admin" && !hasAdminToken) {
      if (!manualAdminToken.trim()) {
        toast.error("Please enter your Admin Token to register as admin.");
        return;
      }
      // Store it in session so useActor can pick it up on next actor creation
      storeSessionParameter("caffeineAdminToken", manualAdminToken.trim());
      // Force a page reload so useActor reinitializes with the token
      toast.info("Admin token saved. Reloading to apply...");
      setTimeout(() => window.location.reload(), 1000);
      return;
    }

    setIsSaving(true);
    try {
      // Preserve admin role if already assigned by backend; never downgrade it
      let role: UserRole;
      if (accountType === "admin" || currentRole === UserRole.admin) {
        role = UserRole.admin;
      } else if (accountType === "owner") {
        role = UserRole.user;
      } else {
        role = UserRole.guest;
      }

      const profile = {
        principal: identity.getPrincipal(),
        displayName: displayName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        createdAt:
          existingProfile?.createdAt ?? BigInt(Date.now()) * BigInt(1_000_000),
      };

      await saveProfile.mutateAsync(profile);
      setSaved(true);
      toast.success("Profile saved successfully!");

      setTimeout(() => {
        if (accountType === "admin" || currentRole === UserRole.admin) {
          navigate({ to: "/admin" });
        } else if (accountType === "owner") {
          navigate({ to: "/owner" });
        } else {
          navigate({ to: "/dashboard" });
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
        >
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-6">
            <h1 className="font-display text-2xl font-bold mb-1">
              {existingProfile ? "Edit Your Profile" : "Create Your Account"}
            </h1>
            <p className="text-primary-foreground/70 text-sm">
              {existingProfile
                ? "Update your ShaadiKhaana profile details"
                : "Join ShaadiKhaana to start booking or listing venues"}
            </p>
            <p className="text-xs text-primary-foreground/50 mt-2 font-mono">
              ID: {identity.getPrincipal().toString().slice(0, 20)}...
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Account Type */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">
                I want to...
              </Label>
              <RadioGroup
                value={accountType}
                onValueChange={(v) => {
                  setAccountType(v as AccountType);
                }}
                className="grid gap-3 grid-cols-3"
              >
                <label
                  htmlFor="customer"
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    accountType === "customer"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <RadioGroupItem
                    value="customer"
                    id="customer"
                    className="sr-only"
                  />
                  <User
                    className={`w-6 h-6 ${accountType === "customer" ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <div className="text-center">
                    <p
                      className={`font-semibold text-sm ${accountType === "customer" ? "text-primary" : "text-foreground"}`}
                    >
                      Book Venues
                    </p>
                    <p className="text-xs text-muted-foreground">Customer</p>
                  </div>
                </label>
                <label
                  htmlFor="owner"
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    accountType === "owner"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <RadioGroupItem
                    value="owner"
                    id="owner"
                    className="sr-only"
                  />
                  <Building2
                    className={`w-6 h-6 ${accountType === "owner" ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <div className="text-center">
                    <p
                      className={`font-semibold text-sm ${accountType === "owner" ? "text-primary" : "text-foreground"}`}
                    >
                      List My Hall
                    </p>
                    <p className="text-xs text-muted-foreground">Hall Owner</p>
                  </div>
                </label>
                <label
                  htmlFor="admin"
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    accountType === "admin"
                      ? "border-amber-500 bg-amber-900/20"
                      : "border-border hover:border-amber-400/60"
                  }`}
                >
                  <RadioGroupItem
                    value="admin"
                    id="admin"
                    className="sr-only"
                  />
                  <Shield
                    className={`w-6 h-6 ${accountType === "admin" ? "text-amber-400" : "text-muted-foreground"}`}
                  />
                  <div className="text-center">
                    <p
                      className={`font-semibold text-sm ${accountType === "admin" ? "text-amber-400" : "text-foreground"}`}
                    >
                      Admin
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Platform Admin
                    </p>
                  </div>
                </label>
              </RadioGroup>

              {/* Admin Token Input */}
              {accountType === "admin" &&
                !hasAdminToken &&
                currentRole !== UserRole.admin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 space-y-3"
                  >
                    <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-3 flex gap-2">
                      <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-300 space-y-1">
                        <p className="font-semibold">
                          Where to find your Admin Token
                        </p>
                        <p className="text-amber-400 leading-relaxed">
                          Open your Caffeine project dashboard. Look for "Admin
                          Token" in the project settings panel (usually shown at
                          the top or in the sidebar). It's a long random string.
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="admin-token"
                        className="mb-1.5 block text-sm"
                      >
                        Admin Token *
                      </Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="admin-token"
                          type="password"
                          placeholder="Paste your admin token here"
                          value={manualAdminToken}
                          onChange={(e) => setManualAdminToken(e.target.value)}
                          className="pl-9 font-mono text-sm"
                          data-ocid="register.admin_token.input"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

              {/* Already admin notice */}
              {(hasAdminToken || currentRole === UserRole.admin) &&
                accountType === "admin" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 bg-green-900/20 border border-green-700/40 rounded-xl p-3 flex gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-green-300">
                      Admin token verified. Fill in your details below and save
                      to access the Admin Panel.
                    </p>
                  </motion.div>
                )}
            </div>

            {/* Display Name */}
            <div>
              <Label htmlFor="name" className="mb-1.5 block">
                Full Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-9"
                  data-ocid="register.name.input"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="mb-1.5 block">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="mb-1.5 block">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 99999 99999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {saved ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-green-900/30 border border-green-700/40 text-green-300 rounded-xl p-4"
              >
                <CheckCircle2 className="w-5 h-5" />
                <p className="font-medium text-sm">
                  Profile saved! Redirecting...
                </p>
              </motion.div>
            ) : (
              <Button
                onClick={handleSave}
                disabled={!displayName.trim() || isSaving}
                className="w-full bg-primary text-primary-foreground h-11 font-semibold"
                data-ocid="register.save.submit_button"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {existingProfile ? "Update Profile" : "Create Account"}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
