// One country stamp in the passport grid. Links to the country detail page.

import Link from "next/link";
import Image from "next/image";

export type PassportTripCard = {
  country_code: string;
  name_th: string;
  stamp_svg_url: string | null;
  travel_date: string | null;
  is_public: boolean;
};

const ROTATIONS = ["-rotate-3", "rotate-2", "-rotate-2", "rotate-3", "rotate-1", "-rotate-1"];

function formatThaiDate(date: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CountryStamp({
  trip,
  username,
  index = 0,
  showPrivacy = false,
}: {
  trip: PassportTripCard;
  username: string;
  index?: number;
  showPrivacy?: boolean;
}) {
  const rotation = ROTATIONS[index % ROTATIONS.length];
  const src = trip.stamp_svg_url ?? `/stamps/${trip.country_code.toLowerCase()}.svg`;

  return (
    <Link
      href={`/passport/${username}/country/${trip.country_code.toLowerCase()}`}
      className={`group relative block rounded-xl border-2 border-border bg-white p-3 shadow-sm transition-transform ${rotation} hover:rotate-0 hover:scale-105`}
    >
      {showPrivacy && !trip.is_public && (
        <span
          className="absolute right-2 top-2 rounded-full bg-ink/70 px-1.5 py-0.5 text-[10px] text-white"
          title="ส่วนตัว"
        >
          🔒
        </span>
      )}
      <Image
        src={src}
        alt={trip.name_th}
        width={140}
        height={140}
        className="mx-auto"
      />
      <p className="mt-2 text-center text-sm font-medium text-primary">{trip.name_th}</p>
      {trip.travel_date && (
        <p className="text-center text-xs text-muted-foreground">
          {formatThaiDate(trip.travel_date)}
        </p>
      )}
    </Link>
  );
}
