import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Square,
  Star,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Hall } from "../backend.d";
import {
  FACILITY_ICONS,
  FACILITY_LABELS,
  HALL_IMAGES,
} from "../data/sampleHalls";
import { SAMPLE_HALLS } from "../data/sampleHalls";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetHall, useGetHallReviews } from "../hooks/useQueries";
import { formatDate, formatPrice, getRating, timeAgo } from "../lib/formatters";

function getHallImages(hall: Hall): string[] {
  const base = HALL_IMAGES[hall.id];
  if (base) {
    return [
      base,
      "/assets/generated/hall-wedding-grand.dim_800x500.jpg",
      "/assets/generated/hall-rooftop.dim_800x500.jpg",
      "/assets/generated/hall-modern.dim_800x500.jpg",
      "/assets/generated/hall-traditional.dim_800x500.jpg",
    ].slice(0, 5);
  }
  return [
    "/assets/generated/hall-wedding-grand.dim_800x500.jpg",
    "/assets/generated/hall-rooftop.dim_800x500.jpg",
    "/assets/generated/hall-modern.dim_800x500.jpg",
    "/assets/generated/hall-traditional.dim_800x500.jpg",
    "/assets/generated/hall-corporate.dim_800x500.jpg",
  ];
}

export default function HallDetailPage() {
  const params = useParams({ strict: false }) as { id?: string };
  const hallId = params.id || "";
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();

  const { data: hallData, isLoading } = useGetHall(hallId);
  const hall: Hall | null =
    hallData ?? SAMPLE_HALLS.find((h) => h.id === hallId) ?? null;

  const { data: reviews = [] } = useGetHallReviews(hallId);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="aspect-[16/7] bg-muted rounded-2xl" />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="h-6 bg-muted rounded w-2/3" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-full" />
            </div>
            <div className="bg-muted rounded-xl h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-2xl font-bold mb-4">Hall Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The venue you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate({ to: "/search" })}>
          Browse All Venues
        </Button>
      </div>
    );
  }

  const images = getHallImages(hall);
  const avgRating = getRating(reviews);

  const handleBook = () => {
    if (!identity) {
      login();
      return;
    }
    navigate({ to: `/book/${hall.id}` });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border py-3">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/search" className="hover:text-primary transition-colors">
              Browse Halls
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground line-clamp-1">{hall.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 mb-8 rounded-2xl overflow-hidden">
          {/* Main image */}
          <div className="lg:col-span-3 relative aspect-[4/3] lg:aspect-auto bg-muted overflow-hidden">
            <img
              src={images[currentImageIdx]}
              alt={hall.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentImageIdx(
                      (i) => (i - 1 + images.length) % images.length,
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentImageIdx((i) => (i + 1) % images.length)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((imgSrc, i) => (
                    <button
                      type="button"
                      key={imgSrc}
                      onClick={() => setCurrentImageIdx(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentImageIdx ? "bg-white w-4" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          {/* Thumbnail grid */}
          <div className="lg:col-span-2 hidden lg:grid grid-cols-2 gap-2">
            {images.slice(1, 5).map((img, i) => (
              <button
                type="button"
                key={img}
                onClick={() => setCurrentImageIdx(i + 1)}
                className={`relative overflow-hidden bg-muted transition-all ${
                  currentImageIdx === i + 1
                    ? "ring-2 ring-primary"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover aspect-[4/3]"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Rating */}
            <div>
              <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  {hall.name}
                </h1>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-gold/10 text-gold border border-gold/20 px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 fill-gold" />
                    <span className="font-bold text-sm">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({reviews.length} reviews)
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <p className="text-sm">
                  {hall.address}, {hall.city}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card rounded-xl p-4 border border-border text-center">
                <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="font-bold text-lg text-foreground">
                  {Number(hall.capacity).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground">Capacity</p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border text-center">
                <Square className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="font-bold text-lg text-foreground">
                  {Number(hall.size).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground">Sq. Ft</p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border text-center">
                <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="font-bold text-lg text-foreground font-body">
                  {formatPrice(hall.pricePerDay)}
                </p>
                <p className="text-xs text-muted-foreground">Per Day</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-display font-bold text-xl text-foreground mb-3">
                About This Venue
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {hall.description}
              </p>
            </div>

            {/* Facilities */}
            <div>
              <h2 className="font-display font-bold text-xl text-foreground mb-4">
                Facilities & Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hall.facilities.map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 border border-border/50"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-sm text-foreground">
                      {FACILITY_LABELS[f]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Reviews */}
            <div>
              <h2 className="font-display font-bold text-xl text-foreground mb-4">
                Guest Reviews
              </h2>
              {reviews.length === 0 ? (
                <div className="bg-muted/30 rounded-xl p-8 text-center border border-border/50">
                  <Star className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No reviews yet. Be the first to review this venue!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Rating summary */}
                  <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
                    <div className="text-center">
                      <p className="font-display text-4xl font-bold text-foreground">
                        {avgRating.toFixed(1)}
                      </p>
                      <div className="flex items-center gap-0.5 justify-center mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= Math.round(avgRating)
                                ? "fill-gold text-gold"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Individual reviews */}
                  {reviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-xl p-4 border border-border"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {review.customerId
                              .toString()
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= Number(review.rating)
                                      ? "fill-gold text-gold"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {timeAgo(review.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-2xl border border-border shadow-card p-6">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">
                  Starting from
                </p>
                <p className="font-display text-3xl font-bold text-primary">
                  {formatPrice(hall.pricePerDay)}
                </p>
                <p className="text-sm text-muted-foreground">per day</p>
              </div>

              <Separator className="my-4" />

              {/* Contact Info */}
              <div className="space-y-3 mb-5">
                <h3 className="font-semibold text-sm text-foreground">
                  Contact Details
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 shrink-0" />
                  <a
                    href={`tel:${hall.contactPhone}`}
                    className="hover:text-primary transition-colors"
                  >
                    {hall.contactPhone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 shrink-0" />
                  <a
                    href={`mailto:${hall.contactEmail}`}
                    className="hover:text-primary transition-colors truncate"
                  >
                    {hall.contactEmail}
                  </a>
                </div>
              </div>

              <Button
                className="w-full gap-2 bg-primary text-primary-foreground h-12 text-base font-semibold shadow-gold hover:shadow-gold-sm transition-all"
                onClick={handleBook}
                data-ocid="hall.book.primary_button"
              >
                <Calendar className="w-5 h-5" />
                Book This Venue
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-3">
                {identity
                  ? "Select dates in the next step"
                  : "Sign in required to book"}
              </p>

              <Separator className="my-4" />

              {/* Facilities summary */}
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-2">
                  Included Amenities
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {hall.facilities.map((f) => (
                    <span
                      key={f}
                      className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground border border-border"
                    >
                      {FACILITY_ICONS[f]} {FACILITY_LABELS[f]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
