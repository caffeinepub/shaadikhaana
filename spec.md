# ShaadiKhaana

## Current State
The project previously had a HallBook codebase with residual naming issues. We are doing a full rewrite from scratch under the name ShaadiKhaana.

## Requested Changes (Diff)

### Add
- Full rewrite of backend and frontend from scratch with ShaadiKhaana branding
- Hall listing system: owners can register, create listings with name, city, address, capacity, price per day, facilities (AC, parking, catering, stage, etc.), photos, and blocked/unavailable dates
- Customer search: filter by city, date, capacity, price range, and facilities
- Hall detail page: gallery, info, availability calendar, pricing, and booking CTA
- 3-step booking flow: date selection -> booking summary (showing 3.5% booking charge due online + 96.5% to pay to hall owner directly) -> Stripe payment for booking charge only
- Booking confirmation: shows hall owner contact details for balance payment
- Blocked date logic: once booked and paid, that date is blocked and not shown as available
- Customer dashboard: view bookings, cancellation with refund policy, booking status
- Hall owner dashboard: register as owner, create/edit/delete listings, view incoming bookings, new booking notifications
- Admin panel: platform stats, manage bookings, manage halls
- Cancellation/refund policy: 7+ days = 80% of booking charge refunded; 3-6 days = 50%; <3 days = 0%; service fee non-refundable
- Terms and conditions page covering booking charge, cancellation, refund, and balance payment to hall owner
- ShaadiKhaana branding everywhere: name, title tag, header, footer

### Modify
- Nothing (full rewrite)

### Remove
- All old HallBook code

## Implementation Plan
1. Write spec.md (this file)
2. Select Stripe and authorization components
3. Generate Motoko backend: users, hall owners, halls, bookings, payments, admin
4. Build React frontend: home, search, hall detail, booking flow, customer dashboard, owner dashboard, admin panel, terms page
5. Deploy
