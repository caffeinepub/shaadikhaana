import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  ChevronLeft,
  DollarSign,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Square,
  Upload,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Facility } from "../backend.d";
import type { Hall } from "../backend.d";
import { CITY_OPTIONS, FACILITY_LABELS } from "../data/sampleHalls";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateHall, useUpdateHall } from "../hooks/useQueries";

interface HallFormProps {
  hall: Hall | null;
  onClose: () => void;
}

export default function HallForm({ hall, onClose }: HallFormProps) {
  const { identity } = useInternetIdentity();
  const createHall = useCreateHall();
  const updateHall = useUpdateHall();
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState(hall?.name || "");
  const [description, setDescription] = useState(hall?.description || "");
  const [city, setCity] = useState(hall?.city || "");
  const [address, setAddress] = useState(hall?.address || "");
  const [capacity, setCapacity] = useState(
    hall ? Number(hall.capacity).toString() : "",
  );
  const [size, setSize] = useState(hall ? Number(hall.size).toString() : "");
  const [priceOnDemand, setPriceOnDemand] = useState(
    hall ? hall.pricePerDay === BigInt(0) : false,
  );
  const [pricePerDay, setPricePerDay] = useState(
    hall && hall.pricePerDay > BigInt(0)
      ? (Number(hall.pricePerDay) / 100).toString()
      : "",
  );
  const [selectedFacilities, setSelectedFacilities] = useState<Facility[]>(
    hall?.facilities || [],
  );
  const [contactPhone, setContactPhone] = useState(hall?.contactPhone || "");
  const [contactEmail, setContactEmail] = useState(hall?.contactEmail || "");
  const [isActive, setIsActive] = useState(hall?.isActive !== false);

  const toggleFacility = (f: Facility) => {
    setSelectedFacilities((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  };

  const isValid =
    name.trim() &&
    city &&
    address.trim() &&
    capacity &&
    (priceOnDemand || pricePerDay) &&
    contactPhone.trim();

  const handleSave = async () => {
    if (!identity || !isValid) return;
    setIsSaving(true);
    try {
      const hallData: Hall = {
        id: hall?.id || crypto.randomUUID(),
        owner: identity.getPrincipal(),
        name: name.trim(),
        description: description.trim(),
        city,
        address: address.trim(),
        capacity: BigInt(Number.parseInt(capacity)),
        size: BigInt(Number.parseInt(size) || 0),
        pricePerDay: priceOnDemand
          ? BigInt(0)
          : BigInt(Math.round(Number.parseFloat(pricePerDay) * 100)),
        facilities: selectedFacilities,
        photoIds: hall?.photoIds || [],
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        isActive,
        createdAt: hall?.createdAt ?? BigInt(Date.now()) * BigInt(1_000_000),
      };

      if (hall) {
        await updateHall.mutateAsync(hallData);
        toast.success("Hall updated successfully!");
      } else {
        await createHall.mutateAsync(hallData);
        toast.success("Hall created successfully!");
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save hall. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-card border-b border-border py-4 sticky top-16 z-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <Separator orientation="vertical" className="h-4" />
            <p className="text-sm font-semibold text-foreground">
              {hall ? "Edit Hall" : "Add New Hall"}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-6"
        >
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              {hall ? "Edit Hall Details" : "Add New Hall"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Fill in the details about your function hall
            </p>
          </div>

          <Separator />

          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Basic Information
            </h2>

            <div>
              <Label className="mb-1.5 block">Hall Name *</Label>
              <Input
                placeholder="e.g., The Grand Maharaja Palace"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-1.5 block">Description</Label>
              <Textarea
                placeholder="Describe your hall — its ambiance, specialties, what makes it unique..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-4">
            <h2 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Location
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">City *</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITY_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Full Address *</Label>
                <Input
                  placeholder="Street, Area, City, State"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Capacity & Pricing */}
          <div className="space-y-4">
            <h2 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Capacity & Pricing
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="mb-1.5 block">Capacity (Guests) *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="e.g., 500"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="pl-9"
                    min="1"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Area (Sq. Ft)</Label>
                <div className="relative">
                  <Square className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="e.g., 5000"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="pl-9"
                    min="0"
                  />
                </div>
              </div>
              <div className="space-y-3">
                {/* Price on Demand toggle */}
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <Checkbox
                    id="price-on-demand"
                    checked={priceOnDemand}
                    onCheckedChange={(v) => {
                      setPriceOnDemand(v === true);
                      if (v === true) setPricePerDay("");
                    }}
                  />
                  <div>
                    <label
                      htmlFor="price-on-demand"
                      className="font-medium text-sm cursor-pointer text-amber-300"
                    >
                      Price on Demand
                    </label>
                    <p className="text-xs text-amber-400 mt-0.5 leading-snug">
                      Customers will see "Contact for Price" instead of a fixed
                      price. Your actual pricing is only used for our internal
                      2.5% booking charge calculation — it will NOT be shown on
                      the website.
                    </p>
                  </div>
                </div>

                {priceOnDemand ? (
                  <div>
                    <Label className="mb-1.5 block">
                      Your Price / Day (₹) — Internal Only *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        ₹
                      </span>
                      <Input
                        type="number"
                        placeholder="e.g., 50000 (not shown to customers)"
                        value={pricePerDay}
                        onChange={(e) => setPricePerDay(e.target.value)}
                        className="pl-7 border-amber-300 focus:border-amber-500"
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      This price is used only to calculate the 2.5% ShaadiKhaana
                      booking charge. It will not be displayed to customers.
                    </p>
                  </div>
                ) : (
                  <div>
                    <Label className="mb-1.5 block">Price / Day (₹) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        ₹
                      </span>
                      <Input
                        type="number"
                        placeholder="e.g., 50000"
                        value={pricePerDay}
                        onChange={(e) => setPricePerDay(e.target.value)}
                        className="pl-7"
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Facilities */}
          <div className="space-y-4">
            <h2 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Facilities & Amenities
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {Object.values(Facility).map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Checkbox
                    id={`fac-${f}`}
                    checked={selectedFacilities.includes(f)}
                    onCheckedChange={() => toggleFacility(f)}
                  />
                  <label
                    htmlFor={`fac-${f}`}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {FACILITY_LABELS[f]}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Contact */}
          <div className="space-y-4">
            <h2 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Contact Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Contact Phone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+91 99999 99999"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="contact@yourhal.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border">
            <Checkbox
              id="active"
              checked={isActive}
              onCheckedChange={(v) => setIsActive(v === true)}
            />
            <div>
              <label
                htmlFor="active"
                className="font-medium text-sm cursor-pointer"
              >
                List as Active
              </label>
              <p className="text-xs text-muted-foreground">
                Active halls are visible to customers and can receive bookings
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-ocid="hall_form.cancel.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid || isSaving}
              className="flex-1 bg-primary text-primary-foreground shadow-gold"
              data-ocid="hall_form.save.submit_button"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {hall ? "Update Hall" : "Create Hall"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
