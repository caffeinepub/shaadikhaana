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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSearch } from "@tanstack/react-router";
import { ArrowUpDown, Clock, Search, SlidersHorizontal, X } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Facility } from "../backend.d";
import type { Hall } from "../backend.d";
import HallCard from "../components/HallCard";
import { CITY_OPTIONS, FACILITY_LABELS } from "../data/sampleHalls";
import { useGetAllHalls, useGetHallReviews } from "../hooks/useQueries";
import { getRating } from "../lib/formatters";

type SortOption =
  | "price-asc"
  | "price-desc"
  | "capacity-asc"
  | "capacity-desc"
  | "rating";

function HallCardWithReviews({ hall, index }: { hall: Hall; index: number }) {
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

function FilterPanel({
  city,
  setCity,
  minCapacity,
  setMinCapacity,
  maxCapacity,
  setMaxCapacity,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  selectedFacilities,
  toggleFacility,
  onReset,
}: {
  city: string;
  setCity: (v: string) => void;
  minCapacity: string;
  setMinCapacity: (v: string) => void;
  maxCapacity: string;
  setMaxCapacity: (v: string) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  selectedFacilities: Facility[];
  toggleFacility: (f: Facility) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-xs h-7"
        >
          Reset All
        </Button>
      </div>
      <Separator />

      {/* City */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">City</Label>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All cities" />
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

      {/* Capacity */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">
          Capacity (Guests)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
            min="0"
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(e.target.value)}
            min="0"
          />
        </div>
      </div>

      {/* Price */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">
          Price / Day (₹)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min="0"
          />
          <Input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min="0"
          />
        </div>
      </div>

      {/* Facilities */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Facilities</Label>
        <div className="space-y-2.5">
          {Object.values(Facility).map((f) => (
            <div key={f} className="flex items-center gap-2">
              <Checkbox
                id={`facility-${f}`}
                checked={selectedFacilities.includes(f)}
                onCheckedChange={() => toggleFacility(f)}
              />
              <label
                htmlFor={`facility-${f}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {FACILITY_LABELS[f]}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const searchParams = useSearch({ strict: false }) as Record<string, string>;

  const [searchQuery, setSearchQuery] = useState(searchParams.q || "");
  const [city, setCity] = useState(searchParams.city || "all");
  const [minCapacity, setMinCapacity] = useState(searchParams.capacity || "");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedFacilities, setSelectedFacilities] = useState<Facility[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");

  const { data: halls = [], isLoading } = useGetAllHalls();
  const allHalls = halls;

  const toggleFacility = (f: Facility) => {
    setSelectedFacilities((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  };

  const resetFilters = () => {
    setCity("all");
    setMinCapacity("");
    setMaxCapacity("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedFacilities([]);
    setSearchQuery("");
  };

  const filteredHalls = useMemo(() => {
    let result = allHalls.filter((h) => h.isActive);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q),
      );
    }

    if (city && city !== "all") {
      result = result.filter(
        (h) => h.city.toLowerCase() === city.toLowerCase(),
      );
    }

    if (minCapacity) {
      result = result.filter(
        (h) => Number(h.capacity) >= Number.parseInt(minCapacity),
      );
    }

    if (maxCapacity) {
      result = result.filter(
        (h) => Number(h.capacity) <= Number.parseInt(maxCapacity),
      );
    }

    if (minPrice) {
      // minPrice in rupees → cents
      result = result.filter(
        (h) => Number(h.pricePerDay) >= Number.parseInt(minPrice) * 100,
      );
    }

    if (maxPrice) {
      result = result.filter(
        (h) => Number(h.pricePerDay) <= Number.parseInt(maxPrice) * 100,
      );
    }

    if (selectedFacilities.length > 0) {
      result = result.filter((h) =>
        selectedFacilities.every((f) => h.facilities.includes(f)),
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return Number(a.pricePerDay) - Number(b.pricePerDay);
        case "price-desc":
          return Number(b.pricePerDay) - Number(a.pricePerDay);
        case "capacity-asc":
          return Number(a.capacity) - Number(b.capacity);
        case "capacity-desc":
          return Number(b.capacity) - Number(a.capacity);
        default:
          return 0;
      }
    });

    return result;
  }, [
    allHalls,
    searchQuery,
    city,
    minCapacity,
    maxCapacity,
    minPrice,
    maxPrice,
    selectedFacilities,
    sortBy,
  ]);

  const activeFilterCount = [
    city && city !== "all" ? 1 : 0,
    minCapacity || maxCapacity ? 1 : 0,
    minPrice || maxPrice ? 1 : 0,
    selectedFacilities.length,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-16 z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search halls, cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-ocid="search.query.search_input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortOption)}
            >
              <SelectTrigger className="w-44 hidden sm:flex">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="capacity-asc">
                  Capacity: Small First
                </SelectItem>
                <SelectItem value="capacity-desc">
                  Capacity: Large First
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile filter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filter Venues</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterPanel
                    city={city}
                    setCity={setCity}
                    minCapacity={minCapacity}
                    setMinCapacity={setMinCapacity}
                    maxCapacity={maxCapacity}
                    setMaxCapacity={setMaxCapacity}
                    minPrice={minPrice}
                    setMinPrice={setMinPrice}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    selectedFacilities={selectedFacilities}
                    toggleFacility={toggleFacility}
                    onReset={resetFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Results count */}
            <p className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">
              {filteredHalls.length} venue
              {filteredHalls.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-card rounded-xl p-5 border border-border sticky top-36">
              <FilterPanel
                city={city}
                setCity={setCity}
                minCapacity={minCapacity}
                setMinCapacity={setMinCapacity}
                maxCapacity={maxCapacity}
                setMaxCapacity={setMaxCapacity}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                selectedFacilities={selectedFacilities}
                toggleFacility={toggleFacility}
                onReset={resetFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Active filters chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {city && city !== "all" && (
                  <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                    City: {city}
                    <button type="button" onClick={() => setCity("all")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(minCapacity || maxCapacity) && (
                  <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                    Capacity filter
                    <button
                      type="button"
                      onClick={() => {
                        setMinCapacity("");
                        setMaxCapacity("");
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedFacilities.map((f) => (
                  <span
                    key={f}
                    className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full"
                  >
                    {FACILITY_LABELS[f]}
                    <button type="button" onClick={() => toggleFacility(f)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
                    key={i}
                    className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[16/10] bg-muted" />
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredHalls.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  {allHalls.length === 0 ? (
                    <Clock className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <Search className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {allHalls.length === 0
                    ? "Venues Coming Soon"
                    : "No venues found"}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  {allHalls.length === 0
                    ? "We're onboarding hall owners. Check back soon or register your venue to be among the first listed."
                    : "Try adjusting your filters or search terms to find available venues."}
                </p>
                {allHalls.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    data-ocid="search.clear_filters.button"
                  >
                    Clear All Filters
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredHalls.map((hall, i) => (
                  <HallCardWithReviews key={hall.id} hall={hall} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
