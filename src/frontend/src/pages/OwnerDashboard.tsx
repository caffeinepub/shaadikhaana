import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Bell,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BookingStatus } from "../backend.d";
import type { Booking, Hall } from "../backend.d";
import HallForm from "../components/HallForm";
import { HALL_IMAGES } from "../data/sampleHalls";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteHall,
  useGetMyHallBookings,
  useGetMyHalls,
} from "../hooks/useQueries";
import {
  formatDate,
  formatPrice,
  getBookingStatusColor,
} from "../lib/formatters";

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

/** Returns true if booking is confirmed and was created in the last 48 hours */
function isRecentConfirmed(booking: Booking): boolean {
  if (booking.status !== BookingStatus.confirmed) return false;
  const createdAtMs = Number(booking.createdAt) / 1_000_000;
  return Date.now() - createdAtMs <= FORTY_EIGHT_HOURS_MS;
}

function NewBookingsPanel({
  bookings,
  halls,
}: {
  bookings: Booking[];
  halls: Hall[];
}) {
  const newBookings = bookings.filter(isRecentConfirmed);
  if (newBookings.length === 0) return null;

  return (
    <motion.div
      data-ocid="owner.new_bookings.panel"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
          <Bell className="w-4 h-4 text-amber-700" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-900 text-sm">
            New Bookings Received
          </h3>
          <p className="text-xs text-amber-700">
            {newBookings.length} new booking
            {newBookings.length !== 1 ? "s" : ""} in the last 48 hours
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {newBookings.map((booking, idx) => {
          const hall = halls.find((h) => h.id === booking.hallId);
          const customerId = booking.customerId.toString();
          const shortCustomerId =
            customerId.length > 12
              ? `${customerId.slice(0, 6)}…${customerId.slice(-4)}`
              : customerId;
          return (
            <div
              key={booking.id}
              data-ocid={`owner.booking.new_badge.${idx + 1}`}
              className="flex items-start justify-between gap-3 bg-white/70 border border-amber-200 rounded-xl p-3 flex-wrap"
            >
              <div className="space-y-0.5">
                <p className="font-semibold text-sm text-amber-900">
                  {hall?.name || "Your Hall"}
                </p>
                <p className="text-xs text-amber-700">
                  Customer: {shortCustomerId}
                </p>
                <p className="text-xs text-amber-700">
                  {formatDate(booking.startDate)} —{" "}
                  {formatDate(booking.endDate)}
                </p>
                <p className="text-xs text-amber-700">
                  {booking.eventType} ·{" "}
                  {Number(booking.guestCount).toLocaleString("en-IN")} guests
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                  <Bell className="w-3 h-3" />
                  NEW
                </span>
                <p className="text-xs font-semibold text-amber-900 mt-1">
                  {formatPrice(booking.hallPriceTotal)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function getHallImage(hall: Hall): string {
  if (HALL_IMAGES[hall.id]) return HALL_IMAGES[hall.id];
  const images = [
    "/assets/generated/hall-wedding-grand.dim_800x500.jpg",
    "/assets/generated/hall-traditional.dim_800x500.jpg",
    "/assets/generated/hall-modern.dim_800x500.jpg",
  ];
  return images[hall.id.charCodeAt(hall.id.length - 1) % images.length];
}

function OwnerHallCard({
  hall,
  bookings,
  onEdit,
  onDelete,
}: {
  hall: Hall;
  bookings: Booking[];
  onEdit: (h: Hall) => void;
  onDelete: (id: string) => void;
}) {
  const [showBookings, setShowBookings] = useState(false);
  const hallBookings = bookings.filter((b) => b.hallId === hall.id);
  const totalEarnings = hallBookings
    .filter(
      (b) =>
        b.status === BookingStatus.confirmed ||
        b.status === BookingStatus.completed,
    )
    .reduce((sum, b) => sum + b.hallPriceTotal, BigInt(0));

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-muted shrink-0">
          <img
            src={getHallImage(hall)}
            alt={hall.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {hall.name}
              </h3>
              <p className="text-xs text-muted-foreground">{hall.city}</p>
            </div>
            <Badge
              variant={hall.isActive ? "default" : "secondary"}
              className={`shrink-0 text-xs ${hall.isActive ? "bg-green-100 text-green-800" : ""}`}
            >
              {hall.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div>
              <p className="font-bold text-sm text-foreground">
                {hallBookings.length}
              </p>
              <p className="text-xs text-muted-foreground">Bookings</p>
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">
                {Number(hall.capacity).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground">Capacity</p>
            </div>
            <div>
              <p className="font-bold text-sm text-primary truncate">
                {formatPrice(totalEarnings)}
              </p>
              <p className="text-xs text-muted-foreground">Earnings</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex items-center gap-2 p-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(hall)}
          className="gap-1.5 flex-1 text-xs"
          data-ocid="owner.hall.edit_button"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowBookings(!showBookings)}
          className="gap-1.5 flex-1 text-xs"
        >
          <Calendar className="w-3.5 h-3.5" />
          Bookings ({hallBookings.length})
          {showBookings ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(hall.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 w-8 h-8 p-0"
          data-ocid="owner.hall.delete_button"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Bookings List */}
      <AnimatePresence>
        {showBookings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Separator />
            <div className="p-3 space-y-2">
              {hallBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">
                  No bookings for this hall yet
                </p>
              ) : (
                hallBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between bg-muted/30 rounded-lg p-2.5 text-xs"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {booking.eventType}
                      </p>
                      <p className="text-muted-foreground">
                        {formatDate(booking.startDate)} —{" "}
                        {formatDate(booking.endDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={`text-xs border mb-1 ${getBookingStatusColor(booking.status.toString())}`}
                      >
                        {booking.status}
                      </Badge>
                      <p className="font-semibold text-foreground">
                        {formatPrice(booking.hallPriceTotal)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OwnerDashboard() {
  const { identity, login } = useInternetIdentity();
  const [editingHall, setEditingHall] = useState<Hall | null | "new">(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: halls = [], isLoading: hallsLoading } = useGetMyHalls();
  const { data: bookings = [] } = useGetMyHallBookings();
  const deleteHall = useDeleteHall();

  if (!identity) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center p-8">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">
            Owner Dashboard
          </h2>
          <p className="text-muted-foreground mb-6">
            Sign in to manage your halls and bookings.
          </p>
          <Button
            onClick={login}
            className="bg-primary text-primary-foreground"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const totalEarnings = bookings
    .filter(
      (b) =>
        b.status === BookingStatus.confirmed ||
        b.status === BookingStatus.completed,
    )
    .reduce((sum, b) => sum + b.hallPriceTotal, BigInt(0));

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(
    (b) => b.status === BookingStatus.pending,
  ).length;

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteHall.mutateAsync(deleteId);
      toast.success("Hall deleted successfully.");
    } catch {
      toast.error("Failed to delete hall.");
    }
    setDeleteId(null);
  };

  if (editingHall !== null) {
    return (
      <HallForm
        hall={editingHall === "new" ? null : editingHall}
        onClose={() => setEditingHall(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-card border-b border-border py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Owner Dashboard
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage your halls and bookings
              </p>
            </div>
            <Button
              onClick={() => setEditingHall("new")}
              className="gap-2 bg-primary text-primary-foreground"
              data-ocid="owner.add_hall.primary_button"
            >
              <Plus className="w-4 h-4" />
              Add New Hall
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "My Halls",
              value: halls.length.toString(),
              icon: Building2,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Total Bookings",
              value: totalBookings.toString(),
              icon: Calendar,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Pending",
              value: pendingBookings.toString(),
              icon: Users,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Total Earnings",
              value: formatPrice(totalEarnings),
              icon: DollarSign,
              color: "text-green-600",
              bg: "bg-green-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-xl p-4 border border-border"
            >
              <div
                className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p
                className={`font-bold text-xl ${stat.color} leading-none mb-1`}
              >
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="halls">
          <TabsList className="mb-6 bg-card border border-border">
            <TabsTrigger value="halls">My Halls ({halls.length})</TabsTrigger>
            <TabsTrigger value="bookings">
              All Bookings ({bookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="halls">
            {hallsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
                    key={i}
                    className="bg-card rounded-xl border border-border p-4 animate-pulse"
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-muted rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : halls.length === 0 ? (
              <div className="text-center py-16">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  No halls yet
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Add your first hall to start receiving bookings
                </p>
                <Button
                  onClick={() => setEditingHall("new")}
                  className="gap-2 bg-primary text-primary-foreground"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Hall
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {halls.map((hall) => (
                  <OwnerHallCard
                    key={hall.id}
                    hall={hall}
                    bookings={bookings}
                    onEdit={setEditingHall}
                    onDelete={(id) => setDeleteId(id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            {/* New Bookings Alert (last 48 hours, confirmed) */}
            <NewBookingsPanel bookings={bookings} halls={halls} />

            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  No bookings yet
                </h3>
                <p className="text-muted-foreground text-sm">
                  Bookings for your halls will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking, idx) => {
                  const hall = halls.find((h) => h.id === booking.hallId);
                  const isNew = isRecentConfirmed(booking);
                  return (
                    <div
                      key={booking.id}
                      className={`bg-card rounded-xl border p-4 ${isNew ? "border-amber-400 ring-1 ring-amber-400/30" : "border-border"}`}
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm text-foreground">
                              {hall?.name || "Unknown Hall"}
                            </p>
                            {isNew && (
                              <span
                                data-ocid={`owner.booking.new_badge.${idx + 1}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-full"
                              >
                                <Bell className="w-3 h-3" />
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {booking.eventType} •{" "}
                            {Number(booking.guestCount).toLocaleString("en-IN")}{" "}
                            guests
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(booking.startDate)} —{" "}
                            {formatDate(booking.endDate)} (
                            {Number(booking.totalDays)} days)
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={`text-xs border ${getBookingStatusColor(booking.status.toString())}`}
                          >
                            {booking.status}
                          </Badge>
                          <p className="font-bold text-sm text-primary mt-1">
                            {formatPrice(booking.hallPriceTotal)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Booking charge: {formatPrice(booking.platformFee)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hall</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hall? This action cannot be
              undone. Any existing bookings will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteHall.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete Hall
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
