import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Info,
  Loader2,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BookingStatus } from "../backend.d";
import type { Hall } from "../backend.d";
import { EVENT_TYPES, SAMPLE_HALLS } from "../data/sampleHalls";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateBooking,
  useGetBookedDates,
  useGetHall,
} from "../hooks/useQueries";
import {
  calculateDays,
  formatDate,
  formatPrice,
  toDateString,
} from "../lib/formatters";

// Extend Window to include Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: Record<string, string>;
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface RazorpayInstance {
  open: () => void;
}

const STEPS = [
  { label: "Dates", icon: Calendar },
  { label: "Event Info", icon: Users },
  { label: "Review", icon: ShieldCheck },
  { label: "Payment", icon: CreditCard },
];

/** Returns true if [s1, e1] overlaps with [s2, e2] (date strings "YYYY-MM-DD") */
function datesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  return s1 <= e2 && e1 >= s2;
}

/** Dynamically loads the Razorpay checkout script */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BookingPage() {
  const params = useParams({ strict: false }) as { hallId?: string };
  const hallId = params.hallId || "";
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  const { data: hallData } = useGetHall(hallId);
  const hall: Hall | null =
    hallData ?? SAMPLE_HALLS.find((h) => h.id === hallId) ?? null;

  const [step, setStep] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eventType, setEventType] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const createBooking = useCreateBooking();
  const [isProcessing, setIsProcessing] = useState(false);

  // Booked dates for conflict detection
  const { data: bookedDates = [] } = useGetBookedDates(hallId);

  const totalDays = useMemo(
    () => (startDate && endDate ? calculateDays(startDate, endDate) : 0),
    [startDate, endDate],
  );

  const hallPrice = useMemo(
    () => (hall ? BigInt(totalDays) * hall.pricePerDay : BigInt(0)),
    [hall, totalDays],
  );

  // 3.5% platform fee in paise (prices stored in paise)
  const platformFee = useMemo(
    () => (hallPrice * BigInt(35)) / BigInt(1000),
    [hallPrice],
  );

  // Balance the customer pays directly to hall owner (96.5%)
  const balanceDue = useMemo(
    () => hallPrice - platformFee,
    [hallPrice, platformFee],
  );

  // grandTotal = same as platformFee (only the 3.5% booking charge is collected online)
  const grandTotal = useMemo(() => platformFee, [platformFee]);

  // Date conflict check
  const hasDateConflict = useMemo(() => {
    if (!startDate || !endDate || totalDays <= 0) return false;
    return bookedDates.some((range) =>
      datesOverlap(startDate, endDate, range.startDate, range.endDate),
    );
  }, [startDate, endDate, totalDays, bookedDates]);

  useEffect(() => {
    if (!identity) {
      navigate({ to: "/" });
    }
  }, [identity, navigate]);

  if (!hall) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-2xl font-bold mb-4">Hall Not Found</h2>
        <Button onClick={() => navigate({ to: "/search" })}>
          Browse Venues
        </Button>
      </div>
    );
  }

  const today = toDateString(new Date());
  const minEnd = startDate || today;

  const canProceedStep0 =
    startDate && endDate && totalDays > 0 && !hasDateConflict;
  const canProceedStep1 =
    eventType && guestCount && Number.parseInt(guestCount) > 0;
  const canProceedStep2 = agreedToTerms;

  const handleRazorpayPayment = async () => {
    if (!identity || !hall) return;
    setIsProcessing(true);

    try {
      // Check Razorpay key
      const razorpayKeyId = localStorage.getItem("razorpay_key_id") || "";
      if (!razorpayKeyId) {
        toast.error(
          "Razorpay Key ID not configured. Please ask the admin to set it up.",
        );
        setIsProcessing(false);
        return;
      }

      // Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error(
          "Failed to load payment gateway. Check your internet connection.",
        );
        setIsProcessing(false);
        return;
      }

      // Create the booking record first (pending state)
      const bookingId = crypto.randomUUID();
      const booking = {
        id: bookingId,
        hallId: hall.id,
        customerId: identity.getPrincipal(),
        hallOwnerId: hall.owner,
        eventType,
        guestCount: BigInt(Number.parseInt(guestCount)),
        startDate,
        endDate,
        totalDays: BigInt(totalDays),
        hallPriceTotal: hallPrice,
        platformFee,
        grandTotal,
        stripePaymentIntentId: "",
        status: BookingStatus.pending,
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
        updatedAt: BigInt(Date.now()) * BigInt(1_000_000),
      };

      await createBooking.mutateAsync(booking);

      // Amount in paise (platform stores prices already in paise)
      const amountInPaise = Number(platformFee);

      // Open Razorpay modal
      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: amountInPaise,
        currency: "INR",
        name: "ShaadiKhaana",
        description: `Booking Charge — ${hall.name}`,
        prefill: {},
        theme: { color: "#b45309" },
        handler: async (response: RazorpayResponse) => {
          // Payment succeeded — navigate to success page
          navigate({
            to: "/booking-success",
            search: {
              payment_id: response.razorpay_payment_id,
              booking_id: bookingId,
            } as Record<string, string>,
          });
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled. Your booking is still pending.");
            setIsProcessing(false);
          },
        },
      });

      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Failed to initiate payment. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-card border-b border-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate({ to: "/halls/$id", params: { id: hall.id } })
              }
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Hall
            </button>
            <Separator orientation="vertical" className="h-4" />
            <p className="text-sm font-medium text-foreground truncate">
              Booking: {hall.name}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <div
                className={`flex flex-col items-center gap-1 ${
                  i <= step ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                    i < step
                      ? "bg-primary border-primary text-primary-foreground"
                      : i === step
                        ? "border-primary text-primary bg-primary/10"
                        : "border-border text-muted-foreground bg-background"
                  }`}
                >
                  {i < step ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <s.icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-all ${
                    i < step ? "bg-primary" : "bg-border"
                  }`}
                  style={{ width: "clamp(20px, 5vw, 80px)" }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-6">
              <AnimatePresence mode="wait">
                {/* ── Step 0: Select Dates ── */}
                {step === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground mb-1">
                        Select Your Dates
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Choose the start and end dates for your event.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-1.5 block">Start Date</Label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            if (endDate && e.target.value > endDate) {
                              setEndDate(e.target.value);
                            }
                          }}
                          min={today}
                          className="w-full"
                          data-ocid="booking.start_date.input"
                        />
                      </div>
                      <div>
                        <Label className="mb-1.5 block">End Date</Label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={minEnd}
                          className="w-full"
                          data-ocid="booking.end_date.input"
                        />
                      </div>
                    </div>

                    {/* Date conflict warning */}
                    {hasDateConflict && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        data-ocid="booking.date_conflict.error_state"
                        className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-xl p-4"
                      >
                        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-destructive">
                            These dates are already booked
                          </p>
                          <p className="text-xs text-destructive/80 mt-0.5">
                            Please choose different dates. The selected range
                            overlaps with an existing booking for this hall.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {totalDays > 0 && !hasDateConflict && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-primary/5 border border-primary/20 rounded-xl p-4"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Duration:
                          </span>
                          <span className="font-semibold text-foreground">
                            {totalDays} day{totalDays !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">
                            {formatDate(startDate)} — {formatDate(endDate)}
                          </span>
                          <span className="font-bold text-primary">
                            {formatPrice(hallPrice)}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* ── Step 1: Event Details ── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground mb-1">
                        Event Details
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Tell us about your event so the venue can prepare.
                      </p>
                    </div>

                    <div>
                      <Label className="mb-1.5 block">Event Type *</Label>
                      <Select value={eventType} onValueChange={setEventType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-1.5 block">Number of Guests *</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="Expected number of guests"
                          value={guestCount}
                          onChange={(e) => setGuestCount(e.target.value)}
                          className="pl-9"
                          min="1"
                          max={Number(hall.capacity).toString()}
                          data-ocid="booking.guest_count.input"
                        />
                      </div>
                      {guestCount &&
                        Number.parseInt(guestCount) > Number(hall.capacity) && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Exceeds hall capacity (
                            {Number(hall.capacity).toLocaleString("en-IN")})
                          </p>
                        )}
                    </div>

                    <div>
                      <Label className="mb-1.5 block">
                        Special Requests (Optional)
                      </Label>
                      <Textarea
                        placeholder="Any special requirements or notes..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2: Summary & Terms ── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground mb-1">
                        Booking Summary
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Review your booking details before proceeding to
                        payment.
                      </p>
                    </div>

                    {/* Booking details */}
                    <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-border">
                        <MapPin className="w-4 h-4 text-primary" />
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {hall.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {hall.city}
                          </p>
                        </div>
                      </div>
                      <Row
                        label="Dates"
                        value={`${formatDate(startDate)} — ${formatDate(endDate)}`}
                      />
                      <Row
                        label="Duration"
                        value={`${totalDays} day${totalDays !== 1 ? "s" : ""}`}
                      />
                      <Row label="Event Type" value={eventType} />
                      <Row
                        label="Guests"
                        value={Number.parseInt(guestCount).toLocaleString(
                          "en-IN",
                        )}
                      />
                    </div>

                    {/* Price breakdown */}
                    <div
                      data-ocid="booking.fee_breakdown.panel"
                      className="bg-muted/30 rounded-xl p-4 space-y-2.5"
                    >
                      <h3 className="font-semibold text-sm text-foreground mb-1">
                        Price Breakdown
                      </h3>
                      {/* Line 1: Hall Price */}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Hall Price ({totalDays} day
                          {totalDays !== 1 ? "s" : ""} ×{" "}
                          {formatPrice(hall.pricePerDay)})
                        </span>
                        <span className="font-medium">
                          {formatPrice(hallPrice)}
                        </span>
                      </div>
                      {/* Line 2: Booking Charge (3.5%) */}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Booking Charge (3.5%) — paid to ShaadiKhaana
                        </span>
                        <span className="font-medium text-primary">
                          {formatPrice(platformFee)}
                        </span>
                      </div>
                      {/* Line 3: Balance to hall owner */}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Balance Due to Hall Owner (96.5%) — pay directly
                        </span>
                        <span className="font-medium">
                          {formatPrice(balanceDue)}
                        </span>
                      </div>
                      <Separator />
                      {/* Payment note */}
                      <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-lg p-3">
                        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground leading-relaxed">
                          You pay only the{" "}
                          <span className="font-semibold text-primary">
                            3.5% booking charge
                          </span>{" "}
                          online to lock your date. The remaining{" "}
                          <span className="font-semibold">96.5%</span> is paid
                          directly to the hall owner.
                        </p>
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <h4 className="font-semibold text-sm text-amber-900 mb-2">
                        Cancellation Policy
                      </h4>
                      <ul className="text-xs text-amber-800 space-y-1">
                        <li>
                          • 7+ days before event: 80% refund of hall price
                        </li>
                        <li>
                          • 3–6 days before event: 50% refund of hall price
                        </li>
                        <li>• Less than 3 days: No refund</li>
                        <li>• Booking charge (3.5%) is non-refundable</li>
                      </ul>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(v) => setAgreedToTerms(v === true)}
                        className="mt-0.5"
                        data-ocid="booking.terms.checkbox"
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-foreground cursor-pointer leading-snug"
                      >
                        I agree to the{" "}
                        <Link
                          to="/terms"
                          target="_blank"
                          className="text-primary underline"
                        >
                          Terms & Conditions
                        </Link>
                        , cancellation policy, and authorize the payment.
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="gap-2"
                  data-ocid="booking.previous.button"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {step < 2 ? (
                  <Button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={
                      (step === 0 && !canProceedStep0) ||
                      (step === 1 && !canProceedStep1)
                    }
                    className="gap-2 bg-primary text-primary-foreground"
                    data-ocid="booking.continue.button"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <div className="flex flex-col items-end gap-1.5">
                    <Button
                      data-ocid="booking.pay_button"
                      onClick={handleRazorpayPayment}
                      disabled={!canProceedStep2 || isProcessing}
                      className="gap-2 bg-primary text-primary-foreground shadow-gold h-11 px-6 font-semibold"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Pay with Razorpay — {formatPrice(platformFee)}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-green-600" />
                      Secured by Razorpay
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-5 sticky top-24 space-y-4">
              <h3 className="font-display font-bold text-base text-foreground">
                Your Booking
              </h3>
              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-muted">
                <img
                  src="/assets/generated/hall-wedding-grand.dim_800x500.jpg"
                  alt={hall.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {hall.name}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {hall.city}
                </p>
              </div>
              {startDate && endDate && (
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Dates:</span>{" "}
                    {formatDate(startDate)} — {formatDate(endDate)}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Duration:
                    </span>{" "}
                    {totalDays} day{totalDays !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
              {hallPrice > BigInt(0) && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hall Price</span>
                    <span>{formatPrice(hallPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Booking Charge (3.5%)
                    </span>
                    <span className="text-primary font-medium">
                      {formatPrice(platformFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Balance to Owner
                    </span>
                    <span>{formatPrice(balanceDue)}</span>
                  </div>
                  <Separator />
                  <p className="text-xs text-primary font-semibold text-center">
                    Pay online: {formatPrice(platformFee)}
                  </p>
                  <p className="text-xs text-muted-foreground text-center leading-snug">
                    Rest paid directly to hall owner
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
