import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { ChevronRight, MapPin, Star, Users } from "lucide-react";
import { motion } from "motion/react";
import type { Hall } from "../backend.d";
import { Facility } from "../backend.d";
import { FACILITY_LABELS, HALL_IMAGES } from "../data/sampleHalls";
import { formatPrice } from "../lib/formatters";

interface HallCardProps {
  hall: Hall;
  index?: number;
  reviewCount?: number;
  avgRating?: number;
}

const facilityColorMap: Partial<Record<Facility, string>> = {
  [Facility.ac]: "bg-blue-50 text-blue-700 border-blue-100",
  [Facility.wifi]: "bg-purple-50 text-purple-700 border-purple-100",
  [Facility.catering]: "bg-orange-50 text-orange-700 border-orange-100",
  [Facility.parking]: "bg-green-50 text-green-700 border-green-100",
  [Facility.stage]: "bg-pink-50 text-pink-700 border-pink-100",
  [Facility.soundSystem]: "bg-indigo-50 text-indigo-700 border-indigo-100",
  [Facility.projector]: "bg-yellow-50 text-yellow-700 border-yellow-100",
  [Facility.restrooms]: "bg-teal-50 text-teal-700 border-teal-100",
};

function getHallImage(hall: Hall): string {
  if (HALL_IMAGES[hall.id]) return HALL_IMAGES[hall.id];
  const images = [
    "/assets/generated/hall-wedding-grand.dim_800x500.jpg",
    "/assets/generated/hall-traditional.dim_800x500.jpg",
    "/assets/generated/hall-rooftop.dim_800x500.jpg",
    "/assets/generated/hall-modern.dim_800x500.jpg",
    "/assets/generated/hall-corporate.dim_800x500.jpg",
    "/assets/generated/hall-birthday.dim_800x500.jpg",
  ];
  const idx = hall.id.charCodeAt(hall.id.length - 1) % images.length;
  return images[idx];
}

export default function HallCard({
  hall,
  index = 0,
  reviewCount = 0,
  avgRating = 0,
}: HallCardProps) {
  const image = getHallImage(hall);
  const displayFacilities = hall.facilities.slice(0, 3);
  const extraCount = hall.facilities.length - 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group"
      data-ocid={`hall.item.${index + 1}`}
    >
      <Link
        to="/halls/$id"
        params={{ id: hall.id }}
        className="block"
        data-ocid={`hall.detail.link.${index + 1}`}
      >
        <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-card-hover transition-all duration-300 group-hover:-translate-y-0.5">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            <img
              src={image}
              alt={hall.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {/* Price badge */}
            <div className="absolute bottom-3 right-3 bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold font-body">
              {formatPrice(hall.pricePerDay)}
              <span className="text-xs opacity-80">/day</span>
            </div>
            {/* City badge */}
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {hall.city}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-display font-bold text-lg text-foreground leading-snug line-clamp-1 mb-1">
              {hall.name}
            </h3>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
              {hall.address}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-4 mb-3 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {Number(hall.capacity).toLocaleString("en-IN")} guests
                </span>
              </span>
              {reviewCount > 0 && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                  <span>
                    {avgRating.toFixed(1)} ({reviewCount})
                  </span>
                </span>
              )}
            </div>

            {/* Facilities */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {displayFacilities.map((f) => (
                <span
                  key={f}
                  className={`text-xs px-2 py-0.5 rounded-full border font-medium ${facilityColorMap[f] ?? "bg-muted text-muted-foreground border-border"}`}
                >
                  {FACILITY_LABELS[f]}
                </span>
              ))}
              {extraCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  +{extraCount} more
                </Badge>
              )}
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground">
                  Starting from
                </span>
                <p className="text-primary font-bold text-base font-body">
                  {formatPrice(hall.pricePerDay)}
                  <span className="text-xs font-normal text-muted-foreground">
                    /day
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                View Details
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
