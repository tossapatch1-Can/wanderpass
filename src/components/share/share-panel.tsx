"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { createClient } from "@/lib/supabase/client";
import { ShareCard, type ShareStamp } from "@/components/share/share-card";
import type { SharePlatform } from "@/lib/types";

type Common = {
  username: string;
  displayName: string;
  sharePath: string; // relative; origin added client-side
  tripId: string | null; // null = whole passport
};

type Props =
  | (Common & {
      mode: "passport";
      avatarEmoji: string;
      countries: number;
      continents: number;
      stamps: ShareStamp[];
    })
  | (Common & {
      mode: "country";
      country: ShareStamp;
      travelDate: string | null;
      comment: string | null;
    });

function dataUrlToFile(dataUrl: string, name: string): File {
  const [head, b64] = dataUrl.split(",");
  const mime = head.match(/:(.*?);/)?.[1] ?? "image/png";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], name, { type: mime });
}

export function SharePanel(props: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileName =
    props.mode === "country"
      ? `wanderpass-${props.country.country_code.toLowerCase()}.png`
      : `wanderpass-${props.username}.png`;

  async function logShare(platform: SharePlatform) {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("share_stats")
          .insert({ user_id: user.id, trip_id: props.tripId, platform });
      }
    } catch {
      /* best-effort */
    }
  }

  async function makePng(): Promise<string> {
    if (!cardRef.current) throw new Error("no card");
    return toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#1f3a5f",
    });
  }

  async function download() {
    setBusy(true);
    try {
      const url = await makePng();
      const a = document.createElement("a");
      a.download = fileName;
      a.href = url;
      a.click();
      logShare("download");
    } finally {
      setBusy(false);
    }
  }

  async function nativeShare() {
    setBusy(true);
    try {
      const url = await makePng();
      const file = dataUrlToFile(url, fileName);
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: "ดูพาสปอร์ตการเดินทางของฉันบน Wanderpass" });
        logShare("native");
      } else {
        // Fallback: download
        const a = document.createElement("a");
        a.download = fileName;
        a.href = url;
        a.click();
        logShare("download");
      }
    } catch {
      /* cancelled */
    } finally {
      setBusy(false);
    }
  }

  const absoluteUrl = () =>
    typeof window !== "undefined" ? window.location.origin + props.sharePath : props.sharePath;

  async function copyLink() {
    await navigator.clipboard.writeText(absoluteUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    logShare("copy_link");
  }

  function shareFacebook() {
    const u = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteUrl())}`;
    window.open(u, "_blank", "noopener,width=640,height=640");
    logShare("fb");
  }

  async function saveForApp(platform: SharePlatform) {
    setBusy(true);
    try {
      const url = await makePng();
      const a = document.createElement("a");
      a.download = fileName;
      a.href = url;
      a.click();
      logShare(platform);
      alert("เซฟรูปลงเครื่องแล้ว — เปิดแอปแล้วโพสต์รูปนี้ได้เลย ✨");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex justify-center">
        {props.mode === "passport" ? (
          <ShareCard
            ref={cardRef}
            mode="passport"
            displayName={props.displayName}
            avatarEmoji={props.avatarEmoji}
            countries={props.countries}
            continents={props.continents}
            stamps={props.stamps}
          />
        ) : (
          <ShareCard
            ref={cardRef}
            mode="country"
            displayName={props.displayName}
            country={props.country}
            travelDate={props.travelDate}
            comment={props.comment}
          />
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={nativeShare}
          disabled={busy}
          className="rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          📤 แชร์
        </button>
        <button
          onClick={download}
          disabled={busy}
          className="rounded-full bg-accent px-5 py-3 font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          📥 ดาวน์โหลด
        </button>
        <button
          onClick={() => saveForApp("ig")}
          disabled={busy}
          className="rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-ink transition hover:border-accent disabled:opacity-60"
        >
          📸 Instagram
        </button>
        <button
          onClick={() => saveForApp("tiktok")}
          disabled={busy}
          className="rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-ink transition hover:border-accent disabled:opacity-60"
        >
          🎵 TikTok
        </button>
        <button
          onClick={shareFacebook}
          className="rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-ink transition hover:border-accent"
        >
          📘 Facebook
        </button>
        <button
          onClick={copyLink}
          className="rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-ink transition hover:border-accent"
        >
          {copied ? "✓ คัดลอกแล้ว" : "🔗 คัดลอกลิงก์"}
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        ทุกรูปที่แชร์ติดลายน้ำ Wanvela · IG/TikTok ให้เซฟรูปแล้วโพสต์ในแอป
      </p>
    </div>
  );
}
