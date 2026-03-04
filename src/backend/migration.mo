import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  type UserRole = {
    #admin;
    #user;
    #guest;
  };

  type UserProfile = {
    principal : Principal;
    role : UserRole;
    displayName : Text;
    email : Text;
    phone : Text;
    createdAt : Time.Time;
  };

  type Facility = {
    #parking;
    #catering;
    #ac;
    #stage;
    #soundSystem;
    #projector;
    #wifi;
    #restrooms;
  };

  type Hall = {
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

  type BookingStatus = {
    #pending;
    #confirmed;
    #cancelled;
    #completed;
  };

  type Booking = {
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

  type Review = {
    id : Text;
    bookingId : Text;
    hallId : Text;
    customerId : Principal;
    rating : Nat;
    comment : Text;
    createdAt : Time.Time;
  };

  type BookedDateRange = {
    startDate : Text;
    endDate : Text;
  };

  type PlatformStats = {
    totalBookings : Nat;
    totalRevenue : Nat;
    totalHalls : Nat;
    totalUsers : Nat;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    halls : Map.Map<Text, Hall>;
    bookings : Map.Map<Text, Booking>;
    reviews : Map.Map<Text, Review>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    halls : Map.Map<Text, Hall>;
    bookings : Map.Map<Text, Booking>;
    reviews : Map.Map<Text, Review>;
  };

  public func run(old : OldActor) : NewActor { old };
};
