import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";

import Order "mo:core/Order";
import Time "mo:core/Time";
import Blob "mo:core/Blob";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";


actor {
  // Include authentication and file storage
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // ============ Types ============

  type UserRole = AccessControl.UserRole;

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

  module Facility {
    public func compare(facility1 : Facility, facility2 : Facility) : Order.Order {
      switch (facility1, facility2) {
        case (#parking, #parking) { #equal };
        case (#parking, _) { #less };
        case (_, #parking) { #greater };

        case (#catering, #catering) { #equal };
        case (#catering, _) { #less };
        case (_, #catering) { #greater };

        case (#ac, #ac) { #equal };
        case (#ac, _) { #less };
        case (_, #ac) { #greater };

        case (#stage, #stage) { #equal };
        case (#stage, _) { #less };
        case (_, #stage) { #greater };

        case (#soundSystem, #soundSystem) { #equal };
        case (#soundSystem, _) { #less };
        case (_, #soundSystem) { #greater };

        case (#projector, #projector) { #equal };
        case (#projector, _) { #less };
        case (_, #projector) { #greater };

        case (#wifi, #wifi) { #equal };
        case (#wifi, _) { #less };
        case (_, #wifi) { #greater };

        case (#restrooms, #restrooms) { #equal };
      };
    };
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
  };

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
  };

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

  public type BookedDateRange = {
    startDate : Text;
    endDate : Text;
  };

  public type PlatformStats = {
    totalBookings : Nat;
    totalRevenue : Nat;
    totalHalls : Nat;
    totalUsers : Nat;
  };

  // ============ Storage ============

  let userProfiles = Map.empty<Principal, UserProfile>();
  let halls = Map.empty<Text, Hall>();
  let bookings = Map.empty<Text, Booking>();
  let reviews = Map.empty<Text, Review>();

  var configuration : ?Stripe.StripeConfiguration = null;

  // ============ User Management ============

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (profile.principal != caller) {
      Runtime.trap("Unauthorized: You can only save your own profile");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // ============ Hall Management ============

  public shared ({ caller }) func createHall(hall : Hall) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create halls");
    };
    if (hall.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only create halls for yourself");
    };
    halls.add(hall.id, hall);
  };

  public shared ({ caller }) func updateHall(hall : Hall) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update halls");
    };
    switch (halls.get(hall.id)) {
      case (null) { Runtime.trap("Hall does not exist") };
      case (?existingHall) {
        if (existingHall.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own halls");
        };
        halls.add(hall.id, hall);
      };
    };
  };

  public shared ({ caller }) func deleteHall(hallId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete halls");
    };
    switch (halls.get(hallId)) {
      case (null) { Runtime.trap("Hall does not exist") };
      case (?existingHall) {
        if (existingHall.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only delete your own halls");
        };
        halls.remove(hallId);
      };
    };
  };

  public query func getHall(hallId : Text) : async Hall {
    switch (halls.get(hallId)) {
      case (null) { Runtime.trap("Hall does not exist") };
      case (?hall) { hall };
    };
  };

  public query func getAllHalls() : async [Hall] {
    halls.values().toArray().sort();
  };

  public query ({ caller }) func getMyHalls() : async [Hall] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their halls");
    };
    halls.values().toArray().filter<Hall>(
      func(hall : Hall) : Bool { hall.owner == caller },
    );
  };

  // ============ Booking Management ============

  public shared ({ caller }) func createBooking(booking : Booking) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bookings");
    };
    if (booking.customerId != caller) {
      Runtime.trap("Unauthorized: You can only create bookings for yourself");
    };
    bookings.add(booking.id, booking);
  };

  public shared ({ caller }) func cancelBooking(bookingId : Text, cancellationReason : Text, refundAmount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel bookings");
    };
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?existingBooking) {
        if (existingBooking.customerId != caller) {
          Runtime.trap("Unauthorized: You can only cancel your own bookings");
        };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark bookings as completed");
    };
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?existingBooking) {
        if (existingBooking.hallOwnerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only hall owners or admins can mark bookings as completed");
        };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can confirm payments");
    };
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?existingBooking) {
        if (existingBooking.customerId != caller) {
          Runtime.trap("Unauthorized: You can only confirm payment for your own bookings");
        };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) {
        if (booking.customerId != caller and booking.hallOwnerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own bookings");
        };
        booking;
      };
    };
  };

  public query ({ caller }) func getMyBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };
    bookings.values().toArray().filter<Booking>(
      func(booking : Booking) : Bool { booking.customerId == caller },
    );
  };

  public query ({ caller }) func getMyHallBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };
    bookings.values().toArray().filter<Booking>(
      func(booking : Booking) : Bool { booking.hallOwnerId == caller },
    );
  };

  public query ({ caller }) func getAllBookings() : async [Booking] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    bookings.values().toArray().sort(Booking.compareByStartDate);
  };

  // ============ Review Management ============

  public shared ({ caller }) func createReview(review : Review) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create reviews");
    };
    if (review.customerId != caller) {
      Runtime.trap("Unauthorized: You can only create reviews for yourself");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update reviews");
    };
    switch (reviews.get(review.id)) {
      case (null) { Runtime.trap("Review does not exist") };
      case (?existingReview) {
        if (existingReview.customerId != caller) {
          Runtime.trap("Unauthorized: You can only update your own reviews");
        };
        reviews.add(review.id, review);
      };
    };
  };

  public shared ({ caller }) func deleteReview(reviewId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete reviews");
    };
    switch (reviews.get(reviewId)) {
      case (null) { Runtime.trap("Review does not exist") };
      case (?existingReview) {
        if (existingReview.customerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only delete your own reviews");
        };
        reviews.remove(reviewId);
      };
    };
  };

  public query func getReview(reviewId : Text) : async Review {
    switch (reviews.get(reviewId)) {
      case (null) { Runtime.trap("Review does not exist") };
      case (?review) { review };
    };
  };

  public query func getHallReviews(hallId : Text) : async [Review] {
    reviews.values().toArray().filter<Review>(
      func(review : Review) : Bool { review.hallId == hallId },
    );
  };

  public query func getAllReviews() : async [Review] {
    reviews.values().toArray().sort(Review.compareByRating);
  };

  // ============ Admin Functions ============

  public query ({ caller }) func getPlatformStats() : async PlatformStats {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
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

  // ============ Helper Functions ============

  public query func getBookedDates(hallId : Text) : async [BookedDateRange] {
    bookings.values().toArray().filter(
      func(booking) {
        booking.hallId == hallId and (booking.status == #confirmed or booking.status == #pending);
      }
    ).map(
      func(booking : Booking) : BookedDateRange {
        {
          startDate = booking.startDate;
          endDate = booking.endDate;
        };
      }
    );
  };

  // ============ Stripe Integration (HTTP Outcall) ============

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
