import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Heart,
  MapPin,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    desc: "We verify all hall listings and ensure transparent pricing — no hidden charges, no surprises.",
  },
  {
    icon: Heart,
    title: "Celebration First",
    desc: "Every booking is a celebration. We make the process as joyful as the event itself.",
  },
  {
    icon: Users,
    title: "Community Driven",
    desc: "We empower hall owners to grow their business while helping families find perfect venues.",
  },
  {
    icon: Star,
    title: "Quality Assured",
    desc: "Reviews and ratings from real customers keep our standards high across every listing.",
  },
];

const stats = [
  { value: "10+", label: "Cities Covered" },
  { value: "2.5%", label: "Booking Charge Only" },
  { value: "100%", label: "Secure Payments" },
  { value: "Free", label: "To List Your Hall" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-20" />
        <div className="container mx-auto px-4 max-w-4xl relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center shadow-gold">
                <Building2 className="w-8 h-8 text-foreground" />
              </div>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              About ShaadiKhaana
            </h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto leading-relaxed">
              South Asia's premier platform for discovering and booking function
              halls for weddings, parties, and every celebration that matters to
              you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">
                Our Story
              </p>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Born from the Love of
                <br />
                <span className="text-gold-gradient">Celebrations</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                ShaadiKhaana was founded with one simple belief: finding the
                perfect venue for your special occasion should be as joyful as
                the celebration itself.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                In India and Pakistan, every wedding, birthday, and family
                gathering is a grand affair. Yet, finding the right hall — one
                that fits your budget, your guest list, and your vision — has
                always been a challenge.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We built ShaadiKhaana to bridge that gap: a marketplace where
                hall owners can showcase their properties and families can
                discover, compare, and book venues with complete confidence.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-muted">
                <img
                  src="/assets/generated/hall-wedding-grand.dim_800x500.jpg"
                  alt="Grand wedding venue"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card shadow-xl rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <p className="font-semibold text-sm text-foreground">
                    India & Pakistan
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Serving celebrations across South Asia
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="font-display text-4xl font-bold text-gold mb-1">
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

      {/* Values */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">
              What We Stand For
            </p>
            <h2 className="font-display text-3xl font-bold text-foreground">
              Our Values
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {v.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">
              The ShaadiKhaana Model
            </p>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              How Our Platform Works
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We keep it simple and fair for both customers and hall owners.
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Find Your Venue",
                desc: "Browse halls filtered by city, capacity, price, and facilities. Every listing shows real photos, pricing, and availability.",
              },
              {
                step: "02",
                title: "Pay the Booking Charge",
                desc: "Lock your date by paying just 3.5% of the hall price online. This booking charge goes to ShaadiKhaana as a service fee.",
              },
              {
                step: "03",
                title: "Pay Hall Owner Directly",
                desc: "The remaining 96.5% of the hall price is paid directly to the hall owner. You deal with them directly — we just facilitate the connection.",
              },
              {
                step: "04",
                title: "Celebrate!",
                desc: "Enjoy your event. After the function, leave a review to help other families find amazing venues.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 bg-card rounded-xl border border-border p-5"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-primary text-sm">
                    {item.step}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-20" />
        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Building2 className="w-10 h-10 text-gold mx-auto mb-4" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Find Your Perfect Venue?
            </h2>
            <p className="text-primary-foreground/70 max-w-md mx-auto mb-8">
              Join thousands of families who have found their dream venues on
              ShaadiKhaana.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-gold text-foreground hover:bg-gold/90 font-semibold gap-2"
                asChild
              >
                <Link to="/search">
                  Browse Venues
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="/register">List Your Hall</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
