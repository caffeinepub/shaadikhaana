import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  MapPin,
  Star,
  X,
} from "lucide-react";
import { Star as StarIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BookingStatus } from "../backend.d";
import type { Booking, Hall } from "../backend.d";
import { SAMPLE_HALLS } from "../data/sampleHalls";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCancelBooking,
  useCreateReview,
  useGetAllHalls,
  useGetHallReviews,
  useGetMyBookings,
} from "../hooks/useQueries";
import {
  calculateRefund,
  formatDate,
  formatPrice,
  getBookingStatusColor,
} from "../lib/formatters";

type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";

function ReviewDialog({
  booking,
  hall,
  open,
  onClose,
}: {
  booking: Booking;
  hall: Hall | undefined;
  open: boolean;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const { identity } = useInternetIdentity();
  const createReview = useCreateReview();

  const handleSubmit = async () => {
    if (!identity || !comment.trim()) return;
    try {
      await createReview.mutateAsync({
        id: crypto.randomUUID(),
        hallId: booking.hallId,
        bookingId: booking.id,
        customerId: identity.getPrincipal(),
        rating: BigInt(rating),
        comment: comment.trim(),
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      });
      toast.success("Review submitted! Thank you for your feedback.");
      onClose();
    } catch {
      toast.error("Failed to submit review. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">
            Review {hall?.name || "This Venue"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-2 block">Your Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                >
                  <StarIcon
                    className={`w-8 h-8 transition-all ${
                      s <= (hoverRating || rating)
                        ? "fill-gold text-gold"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Your Review</Label>
            <Textarea
              placeholder="Share your experience at this venue..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!comment.trim() || createReview.isPending}
            className="bg-primary text-primary-foreground"
          >
            {createReview.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelDialog({
  booking,
  open,
  onClose,
}: {
  booking: Booking;
  open: boolean;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const cancelBooking = useCancelBooking();
  const { refundAmount, refundPercent, policy } = calculateRefund(
    booking.startDate,
    booking.hallPriceTotal,
    booking.platformFee,
  );

  const handleCancel = async () => {
    try {
      await cancelBooking.mutateAsync({
        bookingId: booking.id,
        reason: reason || "Cancelled by customer",
        refundAmount,
      });
      toast.success("Booking cancelled successfully.");
      onClose();
    } catch {
      toast.error("Failed to cancel booking. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-destructive">
            Cancel Booking
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="font-semibold text-sm text-amber-900 mb-2">
              Refund Policy
            </p>
            <p className="text-sm text-amber-800">{policy}</p>
            <Separator className="my-2" />
            <div className="flex justify-between text-sm">
              <span className="text-amber-700">Refund Amount:</span>
              <span className="font-bold text-amber-900">
                {formatPrice(refundAmount)}
                {refundPercent > 0 && (
                  <span className="text-xs ml-1">
                    ({refundPercent}% of hall price)
                  </span>
                )}
              </span>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              * Service fee is non-refundable
            </p>
          </div>
          <div>
            <Label className="mb-1.5 block">
              Reason for Cancellation (Optional)
            </Label>
            <Textarea
              placeholder="Let us know why you're cancelling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="cancel_booking.keep.cancel_button"
          >
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelBooking.isPending}
            data-ocid="cancel_booking.confirm.confirm_button"
          >
            {cancelBooking.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BookingCard({
  booking,
  allHalls,
}: {
  booking: Booking;
  allHalls: Hall[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const hall =
    allHalls.find((h) => h.id === booking.hallId) ||
    SAMPLE_HALLS.find((h) => h.id === booking.hallId);

  const { data: reviews = [] } = useGetHallReviews(booking.hallId);
  const { identity } = useInternetIdentity();
  const hasReviewed = identity
    ? reviews.some(
        (r) =>
          r.bookingId === booking.id &&
          r.customerId.toString() === identity.getPrincipal().toString(),
      )
    : false;

  const canCancel =
    booking.status === BookingStatus.pending ||
    booking.status === BookingStatus.confirmed;

  const statusLabel = booking.status.toString();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        {/* Header */}
        <button
          type="button"
          className="w-full text-left p-4 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => setExpanded((e) => !e)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-sm text-foreground truncate">
                  {hall?.name || "Unknown Venue"}
                </h3>
                <Badge
                  className={`text-xs border ${getBookingStatusColor(statusLabel)} shrink-0`}
                >
                  {statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {hall?.city || ""}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(booking.startDate)} —{" "}
                  {formatDate(booking.endDate)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-bold text-sm text-primary">
                  {formatPrice(booking.grandTotal)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {booking.eventType}
                </p>
              </div>
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
            </div>
          </div>
        </button>

        {/* Expanded Details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Separator />
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Duration
                    </p>
                    <p className="font-medium">
                      {Number(booking.totalDays)} day
                      {Number(booking.totalDays) !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Guests
                    </p>
                    <p className="font-medium">
                      {Number(booking.guestCount).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Hall Price
                    </p>
                    <p className="font-medium">
                      {formatPrice(booking.hallPriceTotal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Service Fee
                    </p>
                    <p className="font-medium">
                      {formatPrice(booking.platformFee)}
                    </p>
                  </div>
                </div>

                {booking.status === BookingStatus.cancelled &&
                  booking.refundAmount !== undefined && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm">
                      <p className="text-red-700 font-medium">
                        Booking Cancelled
                      </p>
                      {booking.cancellationReason && (
                        <p className="text-xs text-red-600 mt-0.5">
                          Reason: {booking.cancellationReason}
                        </p>
                      )}
                      <p className="text-xs text-red-600 mt-0.5">
                        Refund: {formatPrice(booking.refundAmount!)} processed
                      </p>
                    </div>
                  )}

                <div className="flex flex-wrap gap-2">
                  {booking.status === BookingStatus.completed &&
                    !hasReviewed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowReview(true)}
                        className="gap-1.5 text-gold border-gold/30 hover:bg-gold/10"
                      >
                        <Star className="w-3.5 h-3.5" />
                        Leave Review
                      </Button>
                    )}
                  {booking.status === BookingStatus.completed &&
                    hasReviewed && (
                      <Badge
                        variant="outline"
                        className="text-green-700 border-green-200"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Reviewed
                      </Badge>
                    )}
                  {canCancel && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCancel(true)}
                      className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                      data-ocid="booking.cancel.delete_button"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel Booking
                    </Button>
                  )}
                  {hall && (
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="gap-1.5"
                    >
                      <Link to="/halls/$id" params={{ id: hall.id }}>
                        <Building2 className="w-3.5 h-3.5" />
                        View Venue
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {showReview && hall && (
        <ReviewDialog
          booking={booking}
          hall={hall}
          open={showReview}
          onClose={() => setShowReview(false)}
        />
      )}
      {showCancel && (
        <CancelDialog
          booking={booking}
          open={showCancel}
          onClose={() => setShowCancel(false)}
        />
      )}
    </>
  );
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: bookings = [], isLoading } = useGetMyBookings();
  const { data: halls = [] } = useGetAllHalls();
  const allHalls = halls.length > 0 ? halls : SAMPLE_HALLS;

  if (!identity) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center p-8">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">My Bookings</h2>
          <p className="text-muted-foreground mb-6">
            Sign in to view and manage your bookings.
          </p>
          <Button
            onClick={login}
            className="bg-primary text-primary-foreground"
            data-ocid="dashboard.sign_in.primary_button"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const filtered =
    statusFilter === "all"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === BookingStatus.pending).length,
    confirmed: bookings.filter((b) => b.status === BookingStatus.confirmed)
      .length,
    completed: bookings.filter((b) => b.status === BookingStatus.completed)
      .length,
    cancelled: bookings.filter((b) => b.status === BookingStatus.cancelled)
      .length,
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="bg-card border-b border-border py-6">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-2xl font-bold text-foreground">
            My Bookings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track and manage all your venue bookings
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total",
              count: statusCounts.all,
              icon: Calendar,
              color: "text-primary",
            },
            {
              label: "Pending",
              count: statusCounts.pending,
              icon: Clock,
              color: "text-yellow-600",
            },
            {
              label: "Confirmed",
              count: statusCounts.confirmed,
              icon: CheckCircle2,
              color: "text-green-600",
            },
            {
              label: "Completed",
              count: statusCounts.completed,
              icon: Star,
              color: "text-blue-600",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-xl p-4 border border-border text-center"
            >
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <p className={`font-bold text-2xl ${stat.color}`}>{stat.count}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          className="mb-6"
        >
          <TabsList className="flex flex-wrap h-auto gap-1 bg-card border border-border p-1">
            {(
              [
                "all",
                "pending",
                "confirmed",
                "completed",
                "cancelled",
              ] as StatusFilter[]
            ).map((s) => (
              <TabsTrigger key={s} value={s} className="text-xs sm:text-sm">
                {s.charAt(0).toUpperCase() + s.slice(1)}
                {statusCounts[s] > 0 && (
                  <span className="ml-1 text-xs opacity-70">
                    ({statusCounts[s]})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
                key={i}
                className="bg-card rounded-xl border border-border p-4 animate-pulse"
              >
                <div className="flex justify-between">
                  <div className="space-y-2 w-2/3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                  <div className="h-4 bg-muted rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-foreground mb-2">
              {statusFilter === "all"
                ? "No bookings yet"
                : `No ${statusFilter} bookings`}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {statusFilter === "all"
                ? "Start by exploring and booking a venue"
                : "All your bookings are showing in other tabs"}
            </p>
            <Button
              onClick={() => navigate({ to: "/search" })}
              className="bg-primary text-primary-foreground"
              data-ocid="dashboard.browse_venues.primary_button"
            >
              Browse Venues
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                allHalls={allHalls}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
