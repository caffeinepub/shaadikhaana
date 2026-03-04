# ShaadiKhaana

## Current State
ShaadiKhaana is a function hall booking platform built on ICP with Motoko backend and React/TypeScript frontend. Currently it uses Stripe for payments — the booking flow collects a 3.5% booking charge via Stripe Checkout. The backend has `createCheckoutSession`, `getStripeSessionStatus`, and Stripe configuration endpoints. The frontend has `BookingPage.tsx` (4-step booking flow), `BookingSuccessPage.tsx` (polls Stripe session status), and `AdminDashboard.tsx` (with Stripe settings).

## Requested Changes (Diff)

### Add
- Razorpay payment integration replacing Stripe
- Backend: `RazorpayConfig` type and `setRazorpayConfiguration` / `isRazorpayConfigured` methods
- Backend: `createRazorpayOrder` HTTP outcall that calls Razorpay Orders API and returns order_id + amount
- Backend: `verifyRazorpayPayment` method that stores and confirms a payment by order_id
- Frontend: Razorpay checkout via the official Razorpay JS SDK (loaded via script tag) — opens the Razorpay payment modal instead of redirecting to Stripe
- Frontend: `RazorpayCheckout` component / hook that loads razorpay.js and calls `window.Razorpay`
- Frontend: Admin panel section for entering Razorpay Key ID and Key Secret
- Frontend: New `useCreateRazorpayOrder` and `useVerifyRazorpayPayment` query hooks
- `BookingSuccessPage` updated to handle Razorpay payment_id confirmation instead of Stripe session polling

### Modify
- `main.mo`: Replace Stripe import/usage with Razorpay HTTP outcall logic; keep `confirmBookingPayment` but accept `razorpayPaymentId` instead of Stripe intent ID
- `backend.d.ts`: Replace Stripe types with Razorpay types (RazorpayOrder, RazorpayConfig)
- `BookingPage.tsx`: Replace `handleCheckout` (which called `createCheckoutSession`) with `handleRazorpayCheckout` (which creates a Razorpay order, opens Razorpay modal, confirms payment on success)
- `BookingSuccessPage.tsx`: Simplify — no polling needed; Razorpay callback confirms payment inline in BookingPage, then navigates to success page with payment details
- `AdminDashboard.tsx`: Replace Stripe Settings tab with Razorpay Settings tab (Key ID + Key Secret fields)
- `useQueries.ts`: Remove Stripe hooks, add Razorpay hooks

### Remove
- All Stripe-specific backend code (`stripe/stripe.mo` usage, `StripeConfiguration`, `StripeSessionStatus` types)
- `useCreateCheckoutSession` and `useGetStripeSessionStatus` hooks
- Stripe-related types from `backend.d.ts`

## Implementation Plan
1. Update `main.mo` — replace Stripe with Razorpay HTTP outcall for order creation; keep `confirmBookingPayment` for payment confirmation after Razorpay callback
2. Regenerate `backend.d.ts` with Razorpay types (RazorpayConfig, RazorpayOrder response)
3. Update `useQueries.ts` — remove Stripe hooks, add `useCreateRazorpayOrder`, `useVerifyRazorpayPayment`, `useIsRazorpayConfigured`, `useSetRazorpayConfiguration`
4. Update `BookingPage.tsx` — replace Stripe checkout flow with Razorpay modal flow (create order → open Razorpay modal → on success navigate to /booking-success with payment_id)
5. Update `BookingSuccessPage.tsx` — accept payment_id from URL params, call `confirmBookingPayment`, show success/error state
6. Update `AdminDashboard.tsx` — replace Stripe settings with Razorpay Key ID + Secret settings panel
