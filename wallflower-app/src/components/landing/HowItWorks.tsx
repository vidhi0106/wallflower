"use client";

import { useEffect, useRef, useState } from "react";

const ICON_PROPS = {
  width: 34,
  height: 34,
  viewBox: "0 0 34 34",
  fill: "none",
  stroke: "#4a3d2c",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const STEPS = [
  {
    title: "Set up an event",
    body: "Name the person and the occasion. You get a private link — no account setup beyond that.",
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="4" y="9" width="26" height="18" rx="2.5" />
        <path d="M4 11l13 9 13-9" />
        <circle cx="27" cy="7" r="5" fill="#F7EFDD" />
        <path d="M27 4.8v4.4M24.8 7h4.4" />
      </svg>
    ),
  },
  {
    title: "Invite loved ones",
    body: "Share the link or a QR code however you like — text, email, group chat. No sign-up required to contribute.",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M14.5 19.5l5-5" />
        <path d="M13 22.5a5 5 0 0 1 0-7.1l3-3a5 5 0 0 1 7.1 7.1l-1.4 1.4" />
        <path d="M21 11.5a5 5 0 0 1 0 7.1l-3 3a5 5 0 0 1-7.1-7.1l1.4-1.4" />
      </svg>
    ),
  },
  {
    title: "Send bouquets & notes",
    body: "Each person builds a little bouquet, writes a note, and tucks it into an envelope. Stays private until reveal day.",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M17 28V15" />
        <path d="M17 15c0-5-3-7-7-7 0 5 3 7 7 7Z" />
        <path d="M17 15c0-5 3-7 7-7 0 5-3 7-7 7Z" />
        <path d="M9 28h16" />
      </svg>
    ),
  },
  {
    title: "The wall of wishes",
    body: "Reveal it manually or set a date — every bouquet blooms together at once, into one shared garden.",
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="4" y="4" width="10" height="10" rx="2" />
        <rect x="20" y="4" width="10" height="10" rx="2" />
        <rect x="4" y="20" width="10" height="10" rx="2" />
        <rect x="20" y="20" width="10" height="10" rx="2" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="w-full" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
      <h2 className="font-caveat font-bold text-2xl text-center" style={{ color: "#4a3d2c" }}>
        How it works
      </h2>
      <div className="landing-steps mt-8">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="landing-step"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(18px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
              transitionDelay: `${i * 130}ms`,
            }}
          >
            <div className="landing-step-icon">{step.icon}</div>
            <div className="font-nunito font-bold text-sm mt-3" style={{ color: "#4a3d2c" }}>
              {i + 1}. {step.title}
            </div>
            <p className="text-xs mt-1.5" style={{ color: "#7c6a4e", lineHeight: 1.5 }}>
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
