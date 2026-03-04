import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BookedDateRange,
  Booking,
  Hall,
  PlatformStats,
  Review,
  UserProfile,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Halls ───────────────────────────────────────────────────────────────────

export function useGetAllHalls() {
  const { actor, isFetching } = useActor();
  return useQuery<Hall[]>({
    queryKey: ["halls", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllHalls();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetHall(hallId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Hall | null>({
    queryKey: ["halls", hallId],
    queryFn: async () => {
      if (!actor || !hallId) return null;
      try {
        return await actor.getHall(hallId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!hallId,
  });
}

export function useGetMyHalls() {
  const { actor, isFetching } = useActor();
  return useQuery<Hall[]>({
    queryKey: ["halls", "mine"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyHalls();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateHall() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (hall: Hall) => {
      if (!actor) throw new Error("Not connected");
      return actor.createHall(hall);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["halls"] });
    },
  });
}

export function useUpdateHall() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (hall: Hall) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateHall(hall);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["halls"] });
    },
  });
}

export function useDeleteHall() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (hallId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteHall(hallId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["halls"] });
    },
  });
}

export function useGetBookedDates(hallId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<BookedDateRange[]>({
    queryKey: ["booked-dates", hallId],
    queryFn: async () => {
      if (!actor || !hallId) return [];
      try {
        return await actor.getBookedDates(hallId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!hallId,
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export function useGetMyBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ["bookings", "mine"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyBookings();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyHallBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ["bookings", "my-halls"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyHallBookings();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ["bookings", "all"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllBookings();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBooking() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (booking: Booking) => {
      if (!actor) throw new Error("Not connected");
      return actor.createBooking(booking);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useCancelBooking() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      reason,
      refundAmount,
    }: {
      bookingId: string;
      reason: string;
      refundAmount: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.cancelBooking(bookingId, reason, refundAmount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useConfirmBookingPayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      paymentIntentId,
    }: {
      bookingId: string;
      paymentIntentId: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.confirmBookingPayment(bookingId, paymentIntentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useMarkBookingCompleted() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.markBookingCompleted(bookingId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export function useGetHallReviews(hallId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["reviews", hallId],
    queryFn: async () => {
      if (!actor || !hallId) return [];
      try {
        return await actor.getHallReviews(hallId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!hallId,
  });
}

export function useCreateReview() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: Review) => {
      if (!actor) throw new Error("Not connected");
      return actor.createReview(review);
    },
    onSuccess: (_, review) => {
      qc.invalidateQueries({ queryKey: ["reviews", review.hallId] });
    },
  });
}

// ─── User / Auth ──────────────────────────────────────────────────────────────

export function useGetUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useGetUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole | null>({
    queryKey: ["role"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserRole();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      role,
    }: {
      user: import("@icp-sdk/core/principal").Principal;
      role: UserRole;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["role"] });
    },
  });
}

// ─── Platform ─────────────────────────────────────────────────────────────────

export function useGetPlatformStats() {
  const { actor, isFetching } = useActor();
  return useQuery<PlatformStats | null>({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getPlatformStats();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Stripe hooks removed — Razorpay is used client-side instead ─────────────
