import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BookingStatus } from "../backend.d";
import type { Hall } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAllBookings,
  useGetAllHalls,
  useGetPlatformStats,
  useIsAdmin,
  useMarkBookingCompleted,
} from "../hooks/useQueries";
import {
  formatDate,
  formatPrice,
  getBookingStatusColor,
} from "../lib/formatters";

export default function AdminDashboard() {
  const { identity, login } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: stats } = useGetPlatformStats();
  const { data: bookings = [] } = useGetAllBookings();
  const { data: halls = [] } = useGetAllHalls();
  const markCompleted = useMarkBookingCompleted();
  const [statusFilter, setStatusFilter] = useState("all");
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Razorpay settings state
  const [razorpayKey, setRazorpayKey] = useState(
    () => localStorage.getItem("razorpay_key_id") || "",
  );
  const [showKey, setShowKey] = useState(false);

  const handleSaveRazorpayKey = () => {
    if (!razorpayKey.trim()) {
      toast.error("Please enter a valid Razorpay Key ID.");
      return;
    }
    localStorage.setItem("razorpay_key_id", razorpayKey.trim());
    toast.success("Razorpay Key ID saved successfully.");
  };

  const handleMarkCompleted = async (bookingId: string) => {
    setCompletingId(bookingId);
    try {
      await markCompleted.mutateAsync(bookingId);
      toast.success("Booking marked as completed.");
    } catch {
      toast.error("Failed to update booking status.");
    } finally {
      setCompletingId(null);
    }
  };

  if (!identity) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center p-8">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Admin Panel</h2>
          <p className="text-muted-foreground mb-6">
            Sign in with admin credentials to access this panel.
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

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center p-8">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            You don't have admin privileges to access this panel.
          </p>
        </div>
      </div>
    );
  }

  const filteredBookings =
    statusFilter === "all"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-card border-b border-border py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-sm">
                Platform management & oversight
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Platform Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Halls",
              value: stats
                ? Number(stats.totalHalls).toString()
                : halls.length.toString(),
              icon: Building2,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Total Bookings",
              value: stats
                ? Number(stats.totalBookings).toString()
                : bookings.length.toString(),
              icon: Calendar,
              color: "text-blue-400",
              bg: "bg-blue-900/30",
            },
            {
              label: "Total Users",
              value: stats ? Number(stats.totalUsers).toString() : "—",
              icon: Users,
              color: "text-purple-400",
              bg: "bg-purple-900/30",
            },
            {
              label: "Total Revenue",
              value: stats
                ? formatPrice(stats.totalRevenue)
                : formatPrice(
                    bookings.reduce((s, b) => s + b.platformFee, BigInt(0)),
                  ),
              icon: TrendingUp,
              color: "text-green-400",
              bg: "bg-green-900/30",
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings">
          <TabsList className="mb-6 bg-card border border-border">
            <TabsTrigger value="bookings" data-ocid="admin.bookings.tab">
              All Bookings ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="halls" data-ocid="admin.halls.tab">
              All Halls ({halls.length})
            </TabsTrigger>
            <TabsTrigger value="settings" data-ocid="admin.settings.tab">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
                <h2 className="font-semibold text-sm text-foreground">
                  All Bookings
                </h2>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Hall</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No bookings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBookings.map((booking) => {
                        const hall = halls.find((h) => h.id === booking.hallId);
                        return (
                          <TableRow key={booking.id}>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {booking.id.slice(0, 8)}...
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              {hall?.name || "Unknown"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {booking.eventType}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatDate(booking.startDate)} —{" "}
                              {formatDate(booking.endDate)}
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              {formatPrice(booking.grandTotal)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`text-xs border ${getBookingStatusColor(booking.status.toString())}`}
                              >
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {booking.status === BookingStatus.confirmed && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleMarkCompleted(booking.id)
                                  }
                                  disabled={completingId === booking.id}
                                  className="gap-1.5 text-xs h-7"
                                  data-ocid="admin.booking.save_button"
                                >
                                  {completingId === booking.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-3 h-3" />
                                  )}
                                  Complete
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="halls">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-sm text-foreground">
                  All Halls
                </h2>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hall Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Price/Day</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Facilities</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {halls.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No halls found
                        </TableCell>
                      </TableRow>
                    ) : (
                      halls.map((hall: Hall) => (
                        <TableRow key={hall.id}>
                          <TableCell className="font-medium text-sm">
                            {hall.name}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {hall.city}
                          </TableCell>
                          <TableCell className="text-sm">
                            {Number(hall.capacity).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {formatPrice(hall.pricePerDay)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-xs ${hall.isActive ? "bg-green-900/40 text-green-300" : "bg-muted text-muted-foreground"}`}
                            >
                              {hall.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {hall.facilities.length} amenities
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="max-w-lg">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base text-foreground">
                      Razorpay Settings
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Configure your payment gateway
                    </p>
                  </div>
                </div>

                {/* Info box */}
                <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4 text-sm text-amber-300 space-y-1">
                  <p className="font-semibold">Where to find your Key ID</p>
                  <p className="text-xs text-amber-400 leading-relaxed">
                    Log in to your{" "}
                    <span className="font-medium">Razorpay Dashboard</span> →
                    Settings → API Keys. Your Key ID starts with{" "}
                    <code className="bg-amber-900/30 px-1 rounded font-mono text-xs">
                      rzp_live_
                    </code>{" "}
                    (production) or{" "}
                    <code className="bg-amber-900/30 px-1 rounded font-mono text-xs">
                      rzp_test_
                    </code>{" "}
                    (test mode).
                  </p>
                </div>

                {/* Key input */}
                <div className="space-y-2">
                  <Label htmlFor="razorpay-key" className="text-sm font-medium">
                    Razorpay Key ID
                  </Label>
                  <div className="relative">
                    <Input
                      id="razorpay-key"
                      type={showKey ? "text" : "password"}
                      placeholder="rzp_live_xxxxxxxxxxxx"
                      value={razorpayKey}
                      onChange={(e) => setRazorpayKey(e.target.value)}
                      className="pr-10 font-mono text-sm"
                      data-ocid="admin.razorpay_key.input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      data-ocid="admin.razorpay_key.toggle"
                    >
                      {showKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {razorpayKey && (
                    <p className="text-xs text-muted-foreground">
                      Currently saved:{" "}
                      <span className="font-mono">
                        {razorpayKey.slice(0, 8)}
                        {"•".repeat(Math.max(0, razorpayKey.length - 8))}
                      </span>
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSaveRazorpayKey}
                  className="w-full bg-primary text-primary-foreground gap-2"
                  data-ocid="admin.razorpay_key.save_button"
                >
                  <KeyRound className="w-4 h-4" />
                  Save Key ID
                </Button>

                <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-4">
                  The Key ID is stored locally in your browser. It is used when
                  customers make payments. Never share your Secret Key — only
                  the Key ID (not Secret Key) is needed here.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
