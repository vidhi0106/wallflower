import { FLOWER_MAP, type FlowerId } from "./catalog";

export interface Stem {
  uid: string;
  flowerId: FlowerId;
  src: string;
  /** small random rotation/x jitter, -1..1 */
  jr: number;
  /** random drop-height jitter, 0..1 */
  jd: number;
  /** random scale jitter */
  sc: number;
}

let uidCounter = 0;

export function makeStem(flowerId: FlowerId): Stem {
  uidCounter += 1;
  return {
    uid: `s${uidCounter}`,
    flowerId,
    src: FLOWER_MAP[flowerId].src,
    jr: (Math.random() - 0.5) * 2,
    jd: Math.random(),
    sc: 0.9 + Math.random() * 0.2,
  };
}

/**
 * Tight, converged fan layout: stems bunch toward the center at the base and
 * fan outward/upward as they move away from center, mirroring the reference
 * bouquet the design was matched against.
 */
export function tightTransform(stem: Stem, index: number, total: number) {
  const centered = total === 1 ? 0 : index - (total - 1) / 2;
  const dx = centered * 26 + stem.jr * 6;
  const dy = -(20 + stem.jd * 55 + Math.abs(centered) * 16);
  const rot = centered * 3 + stem.jr * 4;
  return { dx, dy, rot, scale: stem.sc, z: Math.round(20 - Math.abs(dx)) };
}
