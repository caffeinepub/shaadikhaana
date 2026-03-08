import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Hall } from "../backend.d";
import HallCard from "../components/HallCard";
import { CITY_OPTIONS } from "../data/sampleHalls";
import { useGetAllHalls, useGetHallReviews } from "../hooks/useQueries";
import { getRating } from "../lib/formatters";

function HallWithRating({ hall, index }: { hall: Hall; index: number }) {
  const { data: reviews = [] } = useGetHallReviews(hall.id);
  return (
    <HallCard
      hall={hall}
      index={index}
      reviewCount={reviews.length}
      avgRating={getRating(reviews)}
    />
  );
}

/* ── Decorative SVG arch ornament ─────────────────────────────────────── */
function MughalArchOrnament() {
  return (
    <svg
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-28 h-10 opacity-30 mb-3"
      aria-hidden="true"
    >
      {/* Central pointed arch */}
      <path
        d="M60 2 C40 2 24 14 24 30 L36 30 C36 20 46 12 60 12 C74 12 84 20 84 30 L96 30 C96 14 80 2 60 2 Z"
        fill="oklch(0.72 0.165 68 / 0.6)"
      />
      {/* Side finials */}
      <circle cx="10" cy="30" r="4" fill="oklch(0.72 0.165 68 / 0.5)" />
      <circle cx="110" cy="30" r="4" fill="oklch(0.72 0.165 68 / 0.5)" />
      <line
        x1="14"
        y1="30"
        x2="24"
        y2="30"
        stroke="oklch(0.72 0.165 68 / 0.4)"
        strokeWidth="1.5"
      />
      <line
        x1="96"
        y1="30"
        x2="106"
        y2="30"
        stroke="oklch(0.72 0.165 68 / 0.4)"
        strokeWidth="1.5"
      />
      {/* Base horizontal rule */}
      <line
        x1="0"
        y1="38"
        x2="120"
        y2="38"
        stroke="oklch(0.72 0.165 68 / 0.25)"
        strokeWidth="0.75"
      />
      {/* Diamond accents */}
      <rect
        x="58"
        y="0"
        width="4"
        height="4"
        transform="rotate(45 60 2)"
        fill="oklch(0.84 0.13 72 / 0.7)"
      />
    </svg>
  );
}

/* ── Ornamental gold divider line ─────────────────────────────────────── */
function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${className}`}
      aria-hidden="true"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30" />
      <div className="w-1.5 h-1.5 rotate-45 bg-gold/60" />
      <div className="w-2 h-2 rotate-45 border border-gold/60" />
      <div className="w-1.5 h-1.5 rotate-45 bg-gold/60" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30" />
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState("");
  const [searchCapacity, setSearchCapacity] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const { data: halls = [], isLoading } = useGetAllHalls();

  const featuredHalls = useMemo(
    () => halls.filter((h) => h.isActive).slice(0, 6),
    [halls],
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCity && searchCity !== "all") params.set("city", searchCity);
    if (searchCapacity) params.set("capacity", searchCapacity);
    if (searchDate) params.set("date", searchDate);
    navigate({ to: `/search?${params.toString()}` });
  };

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0">
          <img
            src="/assets/generated/hero-banner.dim_1400x700.jpg"
            alt="Grand function hall"
            className="w-full h-full object-cover"
          />
          {/* Primary dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
          {/* Royal Mughal atmosphere overlay */}
          <div className="absolute inset-0 bg-hero-pattern" />
          {/* Grain texture */}
          <div className="absolute inset-0 bg-grain opacity-60" />
          {/* Subtle bottom vignette */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            {/* Arch ornament above eyebrow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <MughalArchOrnament />
            </motion.div>

            {/* Eyebrow pill */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-gold/15 border border-gold/40 text-gold rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              India's Premier Venue Booking Platform
            </motion.div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-2">
              Find & Book the
              <span className="block text-gold-gradient mt-1">
                Perfect Venue
              </span>
            </h1>
            <p className="font-serif-accent italic text-2xl sm:text-3xl text-white/55 mb-6 mt-3">
              for weddings, parties &amp; every celebration
            </p>

            <p className="text-white/65 text-base mb-8 leading-relaxed max-w-xl">
              Discover verified function halls for weddings, parties, and
              celebrations. Compare venues, check availability, and book
              instantly — all in one place.
            </p>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-card/90 backdrop-blur-md rounded-xl p-4 shadow-card mughal-border"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {/* City */}
                <div className="relative">
                  <p className="block text-xs font-semibold text-muted-foreground mb-1.5 ml-1">
                    City / Location
                  </p>
                  <Select value={searchCity} onValueChange={setSearchCity}>
                    <SelectTrigger className="w-full bg-background/60 border-border/60">
                      <SelectValue placeholder="Select city..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {CITY_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div>
                  <p className="block text-xs font-semibold text-muted-foreground mb-1.5 ml-1">
                    Event Date
                  </p>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="pl-9 bg-background/60 border-border/60"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <p className="block text-xs font-semibold text-muted-foreground mb-1.5 ml-1">
                    Guests
                  </p>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="No. of guests"
                      value={searchCapacity}
                      onChange={(e) => setSearchCapacity(e.target.value)}
                      className="pl-9 bg-background/60 border-border/60"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSearch}
                data-ocid="home.search.primary_button"
                className="w-full gap-2 bg-gold text-accent-foreground h-11 text-sm font-semibold shadow-gold hover:bg-gold-light hover:shadow-gold transition-all duration-200"
              >
                <Search className="w-4 h-4" />
                Search Venues
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 2,
            ease: "easeInOut",
          }}
        >
          <div className="w-6 h-10 border-2 border-gold/30 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-gold/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── Stats Banner ─────────────────────────────────────────────────── */}
      <section className="bg-[oklch(0.10_0.015_25)] border-y border-gold/15 py-10 relative overflow-hidden">
        {/* Subtle bg glow */}
        <div className="absolute inset-0 bg-mughal-pattern opacity-60" />
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-wrap justify-center items-center gap-0 divide-x divide-gold/15">
            {[
              { value: "10+", label: "Cities Covered" },
              { value: "Free", label: "To List Your Hall" },
              { value: "Instant", label: "Date Locking" },
              { value: "100%", label: "Secure Payments" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex-1 min-w-[140px] text-center px-6 py-2"
              >
                <p className="font-display text-4xl font-bold text-gold mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-foreground/50 tracking-widest uppercase">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-mughal-pattern" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold font-serif-accent italic text-base mb-3">
              Simple Process
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Book in 3 Easy Steps
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              From searching to celebration, we make venue booking effortless
              and secure.
            </p>
            <GoldDivider className="mt-6 max-w-xs mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Search,
                title: "Search & Discover",
                desc: "Browse verified venues filtered by city, date, capacity, and facilities. Find the perfect match for your event.",
                gradient: "from-card to-[oklch(0.18_0.04_12)]",
              },
              {
                step: "02",
                icon: Calendar,
                title: "Book & Pay Securely",
                desc: "Select your dates, review the pricing, and complete your booking with our secure Razorpay-powered payment gateway.",
                gradient: "from-card to-[oklch(0.18_0.04_55)]",
              },
              {
                step: "03",
                icon: Star,
                title: "Celebrate & Review",
                desc: "Enjoy your event at the booked venue! After the event, share your experience to help others in their search.",
                gradient: "from-card to-[oklch(0.18_0.04_145)]",
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative p-7 rounded-lg bg-gradient-to-br ${step.gradient} mughal-border shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5`}
              >
                {/* Step number watermark */}
                <span className="absolute top-4 right-5 font-display text-6xl font-bold text-gold/10 select-none pointer-events-none leading-none">
                  {step.step}
                </span>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-gold/15 rounded-lg flex items-center justify-center shadow-gold-sm">
                    <step.icon className="w-6 h-6 text-gold" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.desc}
                </p>
                {i < 2 && (
                  <div className="absolute -right-5 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-10 h-10 z-10">
                    <ChevronRight className="w-6 h-6 text-gold/50 drop-shadow-[0_0_6px_oklch(0.72_0.165_68/0.5)]" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Halls ────────────────────────────────────────────────── */}
      <section className="py-24 bg-[oklch(0.14_0.02_25)] relative overflow-hidden">
        <div className="absolute inset-0 bg-mughal-pattern opacity-50" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4"
          >
            <div>
              <p className="text-gold font-serif-accent italic text-base mb-2">
                Featured Venues
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                Popular Function Halls
              </h2>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/search" })}
              className="gap-2 shrink-0 border-gold/30 text-gold hover:bg-gold/10 hover:text-gold hover:border-gold/50"
              data-ocid="home.view_all_venues.secondary_button"
            >
              View All Venues
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
                  key={i}
                  className="bg-card rounded-lg border border-border overflow-hidden animate-pulse"
                  data-ocid="halls.loading_state"
                >
                  <div className="aspect-[16/10] bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-5 bg-muted rounded w-16" />
                      <div className="h-5 bg-muted rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredHalls.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-lg mughal-border border-dashed"
              data-ocid="halls.empty_state"
            >
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-4 shadow-gold-sm">
                <Clock className="w-8 h-8 text-gold" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Venues Coming Soon
              </h3>
              <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                We're onboarding verified hall owners. Be the first to list your
                venue or check back soon to discover amazing spaces near you.
              </p>
              <Button
                className="mt-6 gap-2 bg-gold text-accent-foreground hover:bg-gold-light font-semibold"
                onClick={() => navigate({ to: "/register" })}
                data-ocid="home.register_owner.primary_button"
              >
                Register as a Hall Owner
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredHalls.map((hall, i) => (
                <HallWithRating key={hall.id} hall={hall} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-mughal-pattern" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-gold font-serif-accent italic text-base mb-3">
                Why ShaadiKhaana?
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3">
                The Smarter Way to
              </h2>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-gradient mb-8">
                Book Event Venues
              </h2>
              <GoldDivider className="mb-8 max-w-[200px]" />
              <div className="space-y-5">
                {[
                  {
                    title: "Verified Venues",
                    desc: "Every hall is verified and reviewed by real customers for quality assurance.",
                  },
                  {
                    title: "Secure Payments",
                    desc: "All transactions are secured via Razorpay with transparent pricing and no hidden fees.",
                  },
                  {
                    title: "Flexible Cancellation",
                    desc: "Cancel up to 7 days before your event for an 80% refund. Transparent refund policies.",
                  },
                  {
                    title: "24/7 Support",
                    desc: "Our team is always available to assist you with any queries or issues.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm mb-0.5">
                        {item.title}
                      </p>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-xl overflow-hidden shadow-card aspect-[4/3] mughal-border">
                <img
                  src="/assets/generated/hall-wedding-grand.dim_800x500.jpg"
                  alt="Beautiful wedding venue"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              {/* Floating security card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-5 -left-5 bg-card shadow-card rounded-lg p-4 mughal-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-gold-sm">
                    <Building2 className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">
                      Secure Platform
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Verified hall owners
                    </p>
                  </div>
                </div>
              </motion.div>
              {/* Rating card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute -top-5 -right-5 bg-card shadow-card rounded-lg p-3 mughal-border"
              >
                <div className="flex items-center gap-0.5 text-gold mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  4.9/5 Customer Rating
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        {/* Background: deep burgundy-to-dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-[oklch(0.22_0.07_15)] to-[oklch(0.10_0.015_25)]" />
        <div className="absolute inset-0 bg-grain opacity-30" />
        {/* Top gold ornamental line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        {/* Bottom gold ornamental line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mx-auto mb-5 shadow-gold-sm">
              <Building2 className="w-6 h-6 text-gold" />
            </div>
            <GoldDivider className="max-w-[200px] mx-auto mb-6" />
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Own a Function Hall?
            </h2>
            <p className="text-foreground/60 max-w-md mx-auto mb-8 leading-relaxed">
              List your venue on ShaadiKhaana and reach thousands of event
              planners looking for the perfect space. It's free to sign up.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-gold text-accent-foreground hover:bg-gold-light font-bold gap-2 shadow-gold hover:shadow-gold transition-all duration-200"
                onClick={() => navigate({ to: "/register" })}
                data-ocid="home.list_hall.primary_button"
              >
                List Your Hall
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/60 transition-all duration-200"
                onClick={() => navigate({ to: "/search" })}
                data-ocid="home.browse_venues.secondary_button"
              >
                Browse Venues
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
