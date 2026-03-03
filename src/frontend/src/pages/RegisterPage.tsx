import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
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

type AccountType = "customer" | "owner";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: existingProfile, isLoading } = useGetUserProfile();
  const { data: currentRole } = useGetUserRole();
  const saveProfile = useSaveUserProfile();

  const [accountType, setAccountType] = useState<AccountType>("customer");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Pre-fill from existing profile
  useEffect(() => {
    if (existingProfile) {
      setDisplayName(existingProfile.displayName || "");
      setEmail(existingProfile.email || "");
      setPhone(existingProfile.phone || "");
      // Determine account type from role
      if (currentRole === UserRole.user) setAccountType("owner");
      else if (currentRole === UserRole.admin) setAccountType("owner");
      else setAccountType("customer");
    }
  }, [existingProfile, currentRole]);

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
    setIsSaving(true);
    try {
      const role = accountType === "owner" ? UserRole.user : UserRole.guest;

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
        if (accountType === "owner") {
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
                onValueChange={(v) => setAccountType(v as AccountType)}
                className="grid grid-cols-2 gap-3"
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
              </RadioGroup>
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
                className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4"
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
