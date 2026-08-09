export type FlowerId =
  | "lavender"
  | "tulip"
  | "daisy-pink"
  | "cluster-a"
  | "poppy"
  | "marigold"
  | "daisy-yellow"
  | "cluster-b"
  | "hollyhock";

export type EnvelopeColorId = "blue" | "green" | "pink" | "cream";

export interface Flower {
  id: FlowerId;
  label: string;
  src: string;
}

export interface EnvelopeColor {
  id: EnvelopeColorId;
  label: string;
  swatch: string;
  back: string;
  front: string;
}

export const FLOWERS: Flower[] = [
  { id: "lavender", label: "Lavender", src: "/flowers2/lavender.png" },
  { id: "tulip", label: "Tulip", src: "/flowers2/tulip.png" },
  { id: "daisy-pink", label: "Pink daisy", src: "/flowers2/daisy-pink.png" },
  { id: "cluster-a", label: "Pink cluster", src: "/flowers2/cluster-pink-a.png" },
  { id: "poppy", label: "Poppy", src: "/flowers2/poppy.png" },
  { id: "marigold", label: "Marigold", src: "/flowers2/marigold-orange.png" },
  { id: "daisy-yellow", label: "Yellow daisy", src: "/flowers2/daisy-yellow.png" },
  { id: "cluster-b", label: "Pink cluster b", src: "/flowers2/cluster-pink-b.png" },
  { id: "hollyhock", label: "Hollyhock", src: "/flowers2/hollyhock-pink.png" },
];

export const FLOWER_MAP: Record<FlowerId, Flower> = Object.fromEntries(
  FLOWERS.map((f) => [f.id, f])
) as Record<FlowerId, Flower>;

export const ENVELOPE_COLORS: EnvelopeColor[] = [
  { id: "blue", label: "Blue", swatch: "#a9c5da", back: "/envelope2/envelope-back.png", front: "/envelope2/envelope-front.png" },
  { id: "green", label: "Green", swatch: "#b7bd94", back: "/envelope2/envelope-back-green.png", front: "/envelope2/envelope-front-green.png" },
  { id: "pink", label: "Pink", swatch: "#dba7a0", back: "/envelope2/envelope-back-pink.png", front: "/envelope2/envelope-front-pink.png" },
  { id: "cream", label: "Cream", swatch: "#ece4d3", back: "/envelope2/envelope-back-cream.png", front: "/envelope2/envelope-front-cream.png" },
];

export const ENVELOPE_COLOR_MAP: Record<EnvelopeColorId, EnvelopeColor> = Object.fromEntries(
  ENVELOPE_COLORS.map((c) => [c.id, c])
) as Record<EnvelopeColorId, EnvelopeColor>;

export const MAX_STEMS = 7;

export function isFlowerId(value: string): value is FlowerId {
  return value in FLOWER_MAP;
}

export function isEnvelopeColorId(value: string): value is EnvelopeColorId {
  return value in ENVELOPE_COLOR_MAP;
}
