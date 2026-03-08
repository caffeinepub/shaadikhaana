import { Button } from "@/components/ui/button";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Calendar, CheckCircle2, Home, Loader2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useConfirmBookingPayment } from "../hooks/useQueries";

export default function BookingSuccessPage() {
  const searchParams = useSearch({ strict: false }) as Record<string, string>;
  const paymentId = searchParams.payment_id || "";
  const bookingId = searchParams.booking_id || "";
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  const confirmPaymentMutation = useConfirmBookingPayment();
  const confirmPaymentMutate = confirmPaymentMutation.mutateAsync;

  useEffect(() => {
    if (!paymentId || !bookingId) {
      navigate({ to: "/" });
      return;
    }

    if (confirmed) return;

    confirmPaymentMutate({ bookingId, paymentIntentId: paymentId })
      .then(() => {
        setConfirmed(true);
      })
      .catch((err) => {
        console.error("Failed to confirm payment:", err);
        setError("Unable to confirm your booking. Please contact support.");
      });
  }, [paymentId, bookingId, confirmed, confirmPaymentMutate, navigate]);

  const isLoading = !confirmed && !error;

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-card rounded-2xl border border-border shadow-card p-8 text-center">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
              data-ocid="booking_success.loading_state"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Confirming Your Booking
              </h2>
              <p className="text-muted-foreground text-sm">
                Please wait while we confirm your payment and finalize your
                booking...
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
              data-ocid="booking_success.error_state"
            >
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Booking Confirmation Failed
              </h2>
              <p className="text-muted-foreground text-sm">{error}</p>
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  onClick={() => navigate({ to: "/search" })}
                  className="w-full"
                  data-ocid="booking_success.browse_venues.button"
                >
                  Browse Other Venues
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/" data-ocid="booking_success.go_home.link">
                    Go Home
                  </Link>
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
              data-ocid="booking_success.success_state"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto shadow-gold-sm"
              >
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </motion.div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Booking Confirmed! 🎉
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your venue has been successfully booked. You'll receive a
                confirmation shortly. Check your dashboard for booking details.
              </p>
              <div className="bg-green-900/30 border border-green-700/40 rounded-xl p-3 text-sm text-green-300">
                <p className="font-semibold mb-1">What's Next?</p>
                <ul className="text-xs space-y-1.5 text-green-400">
                  <li>
                    ✓ Your booking charge (2.5%) has been paid to ShaadiKhaana
                  </li>
                  <li>✓ The date is now locked and reserved for you</li>
                  <li>✓ The hall owner has been notified of your booking</li>
                  <li className="font-semibold text-green-300">
                    💰 Pay the remaining balance directly to the hall owner
                    before the event
                  </li>
                  <li>• Contact the venue for specific arrangements</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  onClick={() => navigate({ to: "/dashboard" })}
                  className="w-full gap-2 bg-primary text-primary-foreground"
                  data-ocid="booking_success.view_bookings.primary_button"
                >
                  <Calendar className="w-4 h-4" />
                  View My Bookings
                </Button>
                <Button variant="outline" asChild className="w-full gap-2">
                  <Link to="/" data-ocid="booking_success.go_home.link">
                    <Home className="w-4 h-4" />
                    Go Home
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
