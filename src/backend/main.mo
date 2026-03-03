import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

actor {
  // Include authorization and blob storage
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile
  public type UserRole = AccessControl.UserRole;

  public type UserProfile = {
    principal : Principal;
    role : UserRole;
    displayName : Text;
    email : Text;
    phone : Text;
    createdAt : Time.Time;
  };

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      switch (Text.compare(profile1.displayName, profile2.displayName)) {
        case (#equal) { Text.compare(profile1.email, profile2.email) };
        case (order) { order };
      };
    };

    public func compareByEmail(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Text.compare(profile1.email, profile2.email);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Hall Types
  public type Facility = {
    #parking;
    #catering;
    #ac;
    #stage;
    #soundSystem;
    #projector;
    #wifi;
    #restrooms;
  };

  public type Hall = {
    id : Text;
    owner : Principal;
    name : Text;
    description : Text;
    city : Text;
    address : Text;
    capacity : Nat;
    size : Nat;
    pricePerDay : Nat;
    facilities : [Facility];
    photoIds : [Text];
    contactPhone : Text;
    contactEmail : Text;
    isActive : Bool;
    createdAt : Time.Time;
  };

  module Hall {
    public func compare(hall1 : Hall, hall2 : Hall) : Order.Order {
      switch (Text.compare(hall1.name, hall2.name)) {
        case (#equal) { Text.compare(hall1.city, hall2.city) };
        case (order) { order };
      };
    };

    public func compareByPrice(hall1 : Hall, hall2 : Hall) : Order.Order {
      Nat.compare(hall1.pricePerDay, hall2.pricePerDay);
    };
  };

  let halls = Map.empty<Text, Hall>();

  // Booking Types
  public type BookingStatus = {
    #pending;
    #confirmed;
    #cancelled;
    #completed;
  };

  public type Booking = {
    id : Text;
    hallId : Text;
    customerId : Principal;
    hallOwnerId : Principal;
    eventType : Text;
    guestCount : Nat;
    startDate : Text;
    endDate : Text;
    totalDays : Nat;
    hallPriceTotal : Nat;
    platformFee : Nat;
    grandTotal : Nat;
    stripePaymentIntentId : Text;
    status : BookingStatus;
    cancellationReason : ?Text;
    refundAmount : ?Nat;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  module Booking {
    public func compareByStartDate(booking1 : Booking, booking2 : Booking) : Order.Order {
      Text.compare(booking1.startDate, booking2.startDate);
    };

    public func compareByPrice(booking1 : Booking, booking2 : Booking) : Order.Order {
      Nat.compare(booking1.hallPriceTotal, booking2.hallPriceTotal);
    };
  };

  let bookings = Map.empty<Text, Booking>();

  // Review Types
  public type Review = {
    id : Text;
    bookingId : Text;
    hallId : Text;
    customerId : Principal;
    rating : Nat;
    comment : Text;
    createdAt : Time.Time;
  };

  module Review {
    public func compareByRating(review1 : Review, review2 : Review) : Order.Order {
      Nat.compare(review1.rating, review2.rating);
    };
  };

  let reviews = Map.empty<Text, Review>();

  // Hall Management
  public shared ({ caller }) func createHall(hall : Hall) : async () {
    // Only authenticated users can create halls
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create halls");
    };
    // Verify the caller is the owner of the hall
    if (hall.owner != caller) {
      Runtime.trap("Unauthorized: You can only create halls for yourself");
    };
    halls.add(hall.id, hall);
  };

  public shared ({ caller }) func updateHall(hall : Hall) : async () {
    // Only authenticated users can update halls
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update halls");
    };
    // Get existing hall to verify ownership
    switch (halls.get(hall.id)) {
      case (null) { Runtime.trap("Hall does not exist") };
      case (?existingHall) {
        // Only the owner or admin can update
        if (existingHall.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own halls");
        };
        halls.add(hall.id, hall);
      };
    };
  };

  public shared ({ caller }) func deleteHall(hallId : Text) : async () {
    // Only authenticated users can delete halls
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete halls");
    };
    // Get existing hall to verify ownership
    switch (halls.get(hallId)) {
      case (null) { Runtime.trap("Hall does not exist") };
      case (?existingHall) {
        // Only the owner or admin can delete
        if (existingHall.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only delete your own halls");
        };
        halls.remove(hallId);
      };
    };
  };

  public query func getHall(hallId : Text) : async Hall {
    // Public query - anyone can view halls
    switch (halls.get(hallId)) {
      case (null) { Runtime.trap("Hall does not exist") };
      case (?hall) { hall };
    };
  };

  public query func getAllHalls() : async [Hall] {
    // Public query - anyone can view all halls
    halls.values().toArray().sort();
  };

  public query ({ caller }) func getMyHalls() : async [Hall] {
    // Users can view their own halls
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their halls");
    };
    halls.values().toArray().filter<Hall>(
      func(hall : Hall) : Bool { hall.owner == caller },
    );
  };

  // Booking Management
  public shared ({ caller }) func createBooking(booking : Booking) : async () {
    // Only authenticated users can create bookings
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create bookings");
    };
    // Verify the caller is the customer
    if (booking.customerId != caller) {
      Runtime.trap("Unauthorized: You can only create bookings for yourself");
    };
    bookings.add(booking.id, booking);
  };

  public shared ({ caller }) func cancelBooking(bookingId : Text, cancellationReason : Text, refundAmount : Nat) : async () {
    // Only authenticated users can cancel bookings
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can cancel bookings");
    };
    // Get existing booking to verify ownership
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?existingBooking) {
        // Only the customer can cancel
        if (existingBooking.customerId != caller) {
          Runtime.trap("Unauthorized: You can only cancel your own bookings");
        };
        // Update booking with cancellation
        let updatedBooking = {
          existingBooking with
          status = #cancelled;
          cancellationReason = ?cancellationReason;
          refundAmount = ?refundAmount;
          updatedAt = Time.now();
        };
        bookings.add(bookingId, updatedBooking);
      };
    };
  };

  public shared ({ caller }) func markBookingCompleted(bookingId : Text) : async () {
    // Only authenticated users can mark bookings as completed
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can mark bookings as completed");
    };
    // Get existing booking to verify ownership
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?existingBooking) {
        // Only the hall owner or admin can mark as completed
        if (existingBooking.hallOwnerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only hall owners or admins can mark bookings as completed");
        };
        // Update booking status
        let updatedBooking = {
          existingBooking with
          status = #completed;
          updatedAt = Time.now();
        };
        bookings.add(bookingId, updatedBooking);
      };
    };
  };

  public shared ({ caller }) func confirmBookingPayment(bookingId : Text, paymentIntentId : Text) : async () {
    // Only authenticated users can confirm payments
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can confirm payments");
    };
    // Get existing booking to verify ownership
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?existingBooking) {
        // Only the customer can confirm payment
        if (existingBooking.customerId != caller) {
          Runtime.trap("Unauthorized: You can only confirm payment for your own bookings");
        };
        // Update booking status to confirmed
        let updatedBooking = {
          existingBooking with
          status = #confirmed;
          stripePaymentIntentId = paymentIntentId;
          updatedAt = Time.now();
        };
        bookings.add(bookingId, updatedBooking);
      };
    };
  };

  public query ({ caller }) func getBooking(bookingId : Text) : async Booking {
    // Users can only view their own bookings (as customer or hall owner), admins can view all
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) {
        // Check if caller is customer, hall owner, or admin
        if (booking.customerId != caller and booking.hallOwnerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own bookings");
        };
        booking;
      };
    };
  };

  public query ({ caller }) func getMyBookings() : async [Booking] {
    // Users can view their own bookings as customer
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };
    bookings.values().toArray().filter<Booking>(
      func(booking : Booking) : Bool { booking.customerId == caller },
    );
  };

  public query ({ caller }) func getMyHallBookings() : async [Booking] {
    // Hall owners can view bookings for their halls
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };
    bookings.values().toArray().filter<Booking>(
      func(booking : Booking) : Bool { booking.hallOwnerId == caller },
    );
  };

  public query ({ caller }) func getAllBookings() : async [Booking] {
    // Only admins can view all bookings
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    bookings.values().toArray().sort(Booking.compareByStartDate);
  };

  // Review Management
  public shared ({ caller }) func createReview(review : Review) : async () {
    // Only authenticated users can create reviews
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create reviews");
    };
    // Verify the caller is the customer
    if (review.customerId != caller) {
      Runtime.trap("Unauthorized: You can only create reviews for yourself");
    };
    // Verify the booking exists and is completed
    switch (bookings.get(review.bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) {
        if (booking.customerId != caller) {
          Runtime.trap("Unauthorized: You can only review your own bookings");
        };
        switch (booking.status) {
          case (#completed) { /* OK */ };
          case (_) { Runtime.trap("You can only review completed bookings") };
        };
      };
    };
    // Check if review already exists for this booking
    let existingReview = reviews.values().toArray().find(
      func(r : Review) : Bool { r.bookingId == review.bookingId },
    );
    switch (existingReview) {
      case (?_) { Runtime.trap("Review already exists for this booking") };
      case (null) { reviews.add(review.id, review) };
    };
  };

  public shared ({ caller }) func updateReview(review : Review) : async () {
    // Only authenticated users can update reviews
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update reviews");
    };
    // Get existing review to verify ownership
    switch (reviews.get(review.id)) {
      case (null) { Runtime.trap("Review does not exist") };
      case (?existingReview) {
        // Only the author can update
        if (existingReview.customerId != caller) {
          Runtime.trap("Unauthorized: You can only update your own reviews");
        };
        reviews.add(review.id, review);
      };
    };
  };

  public shared ({ caller }) func deleteReview(reviewId : Text) : async () {
    // Only authenticated users can delete reviews
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete reviews");
    };
    // Get existing review to verify ownership
    switch (reviews.get(reviewId)) {
      case (null) { Runtime.trap("Review does not exist") };
      case (?existingReview) {
        // Only the author or admin can delete
        if (existingReview.customerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only delete your own reviews");
        };
        reviews.remove(reviewId);
      };
    };
  };

  public query func getReview(reviewId : Text) : async Review {
    // Public query - anyone can view reviews
    switch (reviews.get(reviewId)) {
      case (null) { Runtime.trap("Review does not exist") };
      case (?review) { review };
    };
  };

  public query func getHallReviews(hallId : Text) : async [Review] {
    // Public query - anyone can view reviews for a hall
    reviews.values().toArray().filter<Review>(
      func(review : Review) : Bool { review.hallId == hallId },
    );
  };

  public query func getAllReviews() : async [Review] {
    // Public query - anyone can view all reviews
    reviews.values().toArray().sort(Review.compareByRating);
  };

  // Admin Functions
  public type PlatformStats = {
    totalBookings : Nat;
    totalRevenue : Nat;
    totalHalls : Nat;
    totalUsers : Nat;
  };

  public query ({ caller }) func getPlatformStats() : async PlatformStats {
    // Only admins can view platform stats
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view platform stats");
    };

    // Calculate total revenue from confirmed and completed bookings
    var totalRevenue : Nat = 0;
    for (booking in bookings.values()) {
      switch (booking.status) {
        case (#confirmed or #completed) {
          totalRevenue += booking.platformFee;
        };
        case (_) {};
      };
    };

    {
      totalBookings = bookings.size();
      totalRevenue = totalRevenue;
      totalHalls = halls.size();
      totalUsers = userProfiles.size();
    };
  };

  // Booked Date Range Type
  public type BookedDateRange = {
    startDate : Text;
    endDate : Text;
  };

  // Get Booked Dates for a Hall
  public query func getBookedDates(hallId : Text) : async [BookedDateRange] {
    bookings.values().toArray().filter(
      func(booking) {
        booking.hallId == hallId and (booking.status == #confirmed or booking.status == #pending);
      }
    ).map(
      func(booking) {
        {
          startDate = booking.startDate;
          endDate = booking.endDate;
        };
      }
    );
  };

  // Payment Integration (Stripe)
  var configuration : ?Stripe.StripeConfiguration = null;

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public query func isStripeConfigured() : async Bool {
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    configuration := ?config;
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
