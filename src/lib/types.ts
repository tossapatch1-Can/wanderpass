// Shared TypeScript types — matches the Supabase schema in /supabase/schema.sql.

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_emoji: string;
};

export type Continent =
  | "Asia"
  | "Europe"
  | "Africa"
  | "North America"
  | "South America"
  | "Oceania";

export type Country = {
  code: string; // ISO 3166-1 alpha-2
  name_th: string;
  name_en: string;
  continent: Continent;
  flag_emoji: string | null;
  stamp_svg_url: string | null;
};

export type Trip = {
  id: string;
  user_id: string;
  country_code: string;
  travel_date: string | null; // "YYYY-MM-DD"
  comment: string | null;
  is_public: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
};

export type TripPhoto = {
  id: string;
  trip_id: string;
  user_id: string;
  storage_path: string;
  is_hidden: boolean;
  created_at: string;
};

// Daily plan produced by Claude for the Trip Planner
export type ItineraryDay = {
  day: number;
  title: string;
  activities: string[];
};

export type Itinerary = {
  summary: string;
  days: ItineraryDay[];
};

export type Wishlist = {
  id: string;
  user_id: string;
  destination: string;
  days: number | null;
  budget_min_thb: number | null;
  budget_max_thb: number | null;
  ai_itinerary: Itinerary | null;
  created_at: string;
};

export type SharePlatform =
  | "ig"
  | "fb"
  | "tiktok"
  | "copy_link"
  | "download"
  | "native";

export type Report = {
  id: string;
  photo_id: string;
  reporter_id: string | null;
  reason: string | null;
  status: "open" | "hidden" | "dismissed";
  created_at: string;
};
