import { Facility } from "../backend.d";
import type { Hall } from "../backend.d";

// No sample halls - listings will appear once hall owners sign up and list their venues
export const SAMPLE_HALLS: Hall[] = [];

export const HALL_IMAGES: Record<string, string> = {
  "sample-1": "/assets/generated/hall-wedding-grand.dim_800x500.jpg",
  "sample-2": "/assets/generated/hall-traditional.dim_800x500.jpg",
  "sample-3": "/assets/generated/hall-rooftop.dim_800x500.jpg",
  "sample-4": "/assets/generated/hall-modern.dim_800x500.jpg",
  "sample-5": "/assets/generated/hall-wedding-grand.dim_800x500.jpg",
  "sample-6": "/assets/generated/hall-traditional.dim_800x500.jpg",
};

export const CITY_OPTIONS = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Jaipur",
  "Pune",
  "Ahmedabad",
  "Surat",
];

export const EVENT_TYPES = [
  "Wedding",
  "Birthday Party",
  "Corporate Event",
  "Engagement Ceremony",
  "Baby Shower",
  "Anniversary",
  "Cultural Event",
  "Graduation Party",
  "Religious Function",
  "Other",
];

export const FACILITY_LABELS: Record<Facility, string> = {
  [Facility.ac]: "Air Conditioning",
  [Facility.wifi]: "WiFi",
  [Facility.restrooms]: "Restrooms",
  [Facility.stage]: "Stage",
  [Facility.projector]: "Projector",
  [Facility.soundSystem]: "Sound System",
  [Facility.catering]: "Catering",
  [Facility.parking]: "Parking",
};

export const FACILITY_ICONS: Record<Facility, string> = {
  [Facility.ac]: "❄️",
  [Facility.wifi]: "📶",
  [Facility.restrooms]: "🚻",
  [Facility.stage]: "🎭",
  [Facility.projector]: "📽️",
  [Facility.soundSystem]: "🔊",
  [Facility.catering]: "🍽️",
  [Facility.parking]: "🅿️",
};
