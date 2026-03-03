import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    principal: Principal;
    displayName: string;
    createdAt: Time;
    role: UserRole;
    email: string;
    phone: string;
}
export interface Hall {
    id: string;
    owner: Principal;
    city: string;
    name: string;
    createdAt: Time;
    size: bigint;
    description: string;
    photoIds: Array<string>;
    isActive: boolean;
    pricePerDay: bigint;
    address: string;
    contactEmail: string;
    facilities: Array<Facility>;
    capacity: bigint;
    contactPhone: string;
}
export interface BookedDateRange {
    endDate: string;
    startDate: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Booking {
    id: string;
    refundAmount?: bigint;
    status: BookingStatus;
    endDate: string;
    platformFee: bigint;
    hallPriceTotal: bigint;
    cancellationReason?: string;
    guestCount: bigint;
    createdAt: Time;
    hallOwnerId: Principal;
    totalDays: bigint;
    grandTotal: bigint;
    updatedAt: Time;
    customerId: Principal;
    stripePaymentIntentId: string;
    hallId: string;
    startDate: string;
    eventType: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface PlatformStats {
    totalHalls: bigint;
    totalBookings: bigint;
    totalUsers: bigint;
    totalRevenue: bigint;
}
export interface Review {
    id: string;
    bookingId: string;
    createdAt: Time;
    comment: string;
    customerId: Principal;
    hallId: string;
    rating: bigint;
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export enum Facility {
    ac = "ac",
    wifi = "wifi",
    restrooms = "restrooms",
    stage = "stage",
    projector = "projector",
    soundSystem = "soundSystem",
    catering = "catering",
    parking = "parking"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelBooking(bookingId: string, cancellationReason: string, refundAmount: bigint): Promise<void>;
    confirmBookingPayment(bookingId: string, paymentIntentId: string): Promise<void>;
    createBooking(booking: Booking): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createHall(hall: Hall): Promise<void>;
    createReview(review: Review): Promise<void>;
    deleteHall(hallId: string): Promise<void>;
    deleteReview(reviewId: string): Promise<void>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllHalls(): Promise<Array<Hall>>;
    getAllReviews(): Promise<Array<Review>>;
    getBookedDates(hallId: string): Promise<Array<BookedDateRange>>;
    getBooking(bookingId: string): Promise<Booking>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHall(hallId: string): Promise<Hall>;
    getHallReviews(hallId: string): Promise<Array<Review>>;
    getMyBookings(): Promise<Array<Booking>>;
    getMyHallBookings(): Promise<Array<Booking>>;
    getMyHalls(): Promise<Array<Hall>>;
    getPlatformStats(): Promise<PlatformStats>;
    getReview(reviewId: string): Promise<Review>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    markBookingCompleted(bookingId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateHall(hall: Hall): Promise<void>;
    updateReview(review: Review): Promise<void>;
}
