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
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="/assets/generated/hero-banner.dim_1400x700.jpg"
            alt="Grand function hall"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-hero-pattern" />
          <div className="absolute inset-0 bg-grain" />
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 text-gold rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              India's Premier Venue Booking Platform
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Find & Book the
              <span className="block text-gold-gradient">Perfect Venue</span>
              for Your Event
            </h1>

            <p className="text-white/70 text-lg mb-8 leading-relaxed max-w-xl">
              Discover thousands of function halls for weddings, parties, and
              celebrations. Compare venues, check availability, and book
              instantly — all in one place.
            </p>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-card/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {/* City */}
                <div className="relative">
                  <p className="block text-xs font-semibold text-muted-foreground mb-1.5 ml-1">
                    City / Location
                  </p>
                  <Select value={searchCity} onValueChange={setSearchCity}>
                    <SelectTrigger className="w-full">
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
                      className="pl-9"
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
                      className="pl-9"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSearch}
                data-ocid="home.search.primary_button"
                className="w-full gap-2 bg-primary text-primary-foreground h-11 text-sm font-semibold shadow-gold hover:shadow-gold-sm transition-all"
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
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── Stats Banner ─────────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "10+", label: "Cities Covered" },
              { value: "Free", label: "To List Your Hall" },
              { value: "3.5%", label: "Booking Charge Only" },
              { value: "100%", label: "Secure Payments" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="font-display text-3xl font-bold text-gold mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-primary-foreground/70">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">
              Simple Process
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Book in 3 Easy Steps
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              From searching to celebration, we make venue booking effortless
              and secure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Search,
                title: "Search & Discover",
                desc: "Browse hundreds of verified venues filtered by city, date, capacity, and facilities. Find the perfect match for your event.",
                color: "from-rose-50 to-rose-100/50",
                iconBg: "bg-rose-100",
                iconColor: "text-rose-600",
              },
              {
                step: "02",
                icon: Calendar,
                title: "Book & Pay Securely",
                desc: "Select your dates, review the pricing, and complete your booking with our secure Stripe-powered payment gateway.",
                color: "from-amber-50 to-amber-100/50",
                iconBg: "bg-amber-100",
                iconColor: "text-amber-600",
              },
              {
                step: "03",
                icon: Star,
                title: "Celebrate & Review",
                desc: "Enjoy your event at the booked venue! After the event, share your experience to help others in their search.",
                color: "from-green-50 to-green-100/50",
                iconBg: "bg-green-100",
                iconColor: "text-green-600",
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative p-6 rounded-2xl bg-gradient-to-br ${step.color} border border-border/50`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 ${step.iconBg} rounded-xl flex items-center justify-center`}
                  >
                    <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                  </div>
                  <span className="font-display text-4xl font-bold text-foreground/10">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.desc}
                </p>
                {i < 2 && (
                  <ChevronRight className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-border hidden md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Halls ────────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4"
          >
            <div>
              <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-2">
                Featured Venues
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                Popular Function Halls
              </h2>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/search" })}
              className="gap-2 shrink-0"
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
                  className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse"
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
              className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-2xl border border-border border-dashed"
            >
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-4">
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
                className="mt-6 gap-2 bg-primary text-primary-foreground"
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">
                Why ShaadiKhaana?
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
                The Smarter Way to
                <br />
                Book Event Venues
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Verified Venues",
                    desc: "Every hall is verified and reviewed by real customers for quality assurance.",
                  },
                  {
                    title: "Secure Payments",
                    desc: "All transactions are secured via Stripe with transparent pricing and no hidden fees.",
                  },
                  {
                    title: "Flexible Cancellation",
                    desc: "Cancel up to 7 days before your event for an 80% refund. Transparent refund policies.",
                  },
                  {
                    title: "24/7 Support",
                    desc: "Our team is always available to assist you with any queries or issues.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {item.title}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
                <img
                  src="/assets/generated/hall-wedding-grand.dim_800x500.jpg"
                  alt="Beautiful wedding venue"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-4 -left-4 bg-card shadow-xl rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
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
              </div>
              {/* Rating card */}
              <div className="absolute -top-4 -right-4 bg-card shadow-xl rounded-xl p-3 border border-border">
                <div className="flex items-center gap-1 text-gold">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-gold" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  4.9/5 Customer Rating
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-30" />
        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Building2 className="w-10 h-10 text-gold mx-auto mb-4" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Own a Function Hall?
            </h2>
            <p className="text-primary-foreground/70 max-w-md mx-auto mb-8">
              List your venue on ShaadiKhaana and reach thousands of event
              planners looking for the perfect space. It's free to sign up.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-gold text-foreground hover:bg-gold/90 font-semibold gap-2"
                onClick={() => navigate({ to: "/register" })}
                data-ocid="home.list_hall.primary_button"
              >
                List Your Hall
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
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
