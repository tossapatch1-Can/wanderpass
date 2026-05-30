// The visual that gets rasterized to PNG (with the Wanvela watermark baked in).
// Two variants: whole passport, or a single country. Uses same-origin stamp
// SVGs only (no cross-origin photos) so html-to-image never taints the canvas.

import { forwardRef } from "react";

export type ShareStamp = {
  country_code: string;
  name_th: string;
  stamp_svg_url: string | null;
  flag_emoji: string | null;
};

type PassportProps = {
  mode: "passport";
  displayName: string;
  avatarEmoji: string;
  countries: number;
  continents: number;
  stamps: ShareStamp[];
};

type CountryProps = {
  mode: "country";
  displayName: string;
  country: ShareStamp;
  travelDate: string | null;
  comment: string | null;
};

type Props = PassportProps | CountryProps;

function Watermark() {
  return (
    <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-3 text-primary-foreground/80">
      <span className="text-xs tracking-[0.2em]">WANDERPASS</span>
      <span className="text-sm font-semibold tracking-wide">
        wanvela<span className="text-accent">.</span>
      </span>
    </div>
  );
}

function stampSrc(s: ShareStamp): string {
  return s.stamp_svg_url ?? `/stamps/${s.country_code.toLowerCase()}.svg`;
}

export const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard(props, ref) {
  return (
    <div
      ref={ref}
      className="w-[360px] rounded-3xl bg-primary p-6 text-primary-foreground"
    >
      {props.mode === "passport" ? (
        <>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{props.avatarEmoji || "🧳"}</span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground/70">
                Passport
              </p>
              <p className="text-xl font-bold">{props.displayName}</p>
            </div>
          </div>

          <p className="mt-3 text-sm text-primary-foreground/80">
            เยือนแล้ว {props.countries} ประเทศ · {props.continents} ทวีป
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {props.stamps.slice(0, 12).map((s) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.country_code}
                src={stampSrc(s)}
                alt={s.name_th}
                width={100}
                height={100}
                className="w-full rounded-lg bg-white"
              />
            ))}
          </div>
          {props.stamps.length > 12 && (
            <p className="mt-2 text-right text-xs text-primary-foreground/70">
              +{props.stamps.length - 12} ประเทศ
            </p>
          )}
        </>
      ) : (
        <>
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground/70">
            Wanderpass · {props.displayName}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stampSrc(props.country)}
            alt={props.country.name_th}
            width={220}
            height={220}
            className="mx-auto mt-3 rounded-2xl bg-white"
          />
          <p className="mt-4 text-center text-2xl font-bold">
            {props.country.flag_emoji} {props.country.name_th}
          </p>
          {props.travelDate && (
            <p className="text-center text-sm text-primary-foreground/80">
              {new Date(props.travelDate).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
          {props.comment && (
            <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-center text-sm">
              {props.comment}
            </p>
          )}
        </>
      )}

      <Watermark />
    </div>
  );
});
