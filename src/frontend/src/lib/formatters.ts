// Format cents to INR display
export function formatPrice(cents: bigint | number): string {
  const val = typeof cents === "bigint" ? Number(cents) : cents;
  const rupees = val / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatPriceShort(cents: bigint | number): string {
  const val = typeof cents === "bigint" ? Number(cents) : cents;
  const rupees = val / 100;
  if (rupees >= 100000) {
    return `₹${(rupees / 100000).toFixed(1)}L`;
  }
  if (rupees >= 1000) {
    return `₹${(rupees / 1000).toFixed(0)}K`;
  }
  return `₹${rupees.toLocaleString("en-IN")}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateRange(start: string, end: string): string {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);
  const daysDiff =
    Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return `${formatDate(start)} – ${formatDate(end)} (${daysDiff} day${daysDiff !== 1 ? "s" : ""})`;
}

export function calculateDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function timeAgo(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const diff = Date.now() - ms;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(new Date(ms).toISOString().split("T")[0]);
}

// Cancellation refund calculation
export function calculateRefund(
  startDate: string,
  hallPriceTotal: bigint,
  _platformFee: bigint,
): { refundAmount: bigint; refundPercent: number; policy: string } {
  const today = new Date();
  const eventDate = new Date(startDate);
  const daysUntilEvent = Math.ceil(
    (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntilEvent >= 7) {
    const refundAmount = (hallPriceTotal * BigInt(80)) / BigInt(100);
    return {
      refundAmount,
      refundPercent: 80,
      policy: "7+ days before event: 80% refund of hall price",
    };
  }
  if (daysUntilEvent >= 3) {
    const refundAmount = (hallPriceTotal * BigInt(50)) / BigInt(100);
    return {
      refundAmount,
      refundPercent: 50,
      policy: "3-6 days before event: 50% refund of hall price",
    };
  }
  return {
    refundAmount: BigInt(0),
    refundPercent: 0,
    policy: "Less than 3 days before event: No refund",
  };
}

export function getBookingStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "confirmed":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "completed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function getRating(reviews: { rating: bigint }[]): number {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
