type Sample = { x: number; y: number; t: number };

const MIN_DELAY_MS = 60;
const MAX_DELAY_MS = 400;
const DEFAULT_INTERVAL_MS = 90;
const MAX_SAMPLES = 16;
const STALE_GAP_MS = 2000;
const DELAY_HEADROOM = 1.6;
const INTERVAL_SMOOTHING = 0.2;

const MAX_RATE_ADJUST = 0.15;
const RATE_WINDOW_MS = 400;
const RESYNC_AHEAD_MS = 600;
const MAX_FRAME_DELTA_MS = 100;

export class PeerInterpolator {
  private samples: Sample[] = [];
  private intervalEstimate = DEFAULT_INTERVAL_MS;
  private lastArrival = 0;
  private renderTime = 0;
  private lastNow = 0;

  push(x: number, y: number, now: number) {
    if (this.lastArrival > 0) {
      const gap = now - this.lastArrival;
      if (gap >= STALE_GAP_MS) {
        this.samples.length = 0;
        this.renderTime = 0;
      } else if (gap > 0) {
        this.intervalEstimate =
          this.intervalEstimate * (1 - INTERVAL_SMOOTHING) + gap * INTERVAL_SMOOTHING;
      }
    }

    this.lastArrival = now;
    this.samples.push({ x, y, t: now });

    if (this.samples.length > MAX_SAMPLES) {
      this.samples.shift();
    }
  }

  get delayMs() {
    return Math.min(MAX_DELAY_MS, Math.max(MIN_DELAY_MS, this.intervalEstimate * DELAY_HEADROOM));
  }

  sample(now: number): { x: number; y: number } | null {
    const samples = this.samples;
    if (samples.length === 0) {
      return null;
    }

    this.advanceClock(now, samples[0].t);
    return this.positionAtRenderTime();
  }

  peek(): { x: number; y: number } | null {
    if (this.samples.length === 0) {
      return null;
    }
    if (this.renderTime === 0) {
      this.renderTime = this.samples[0].t;
    }
    return this.positionAtRenderTime();
  }

  private positionAtRenderTime() {
    const samples = this.samples;
    const first = samples[0];
    const last = samples[samples.length - 1];

    if (this.renderTime < first.t) {
      this.renderTime = first.t;
    }
    if (this.renderTime > last.t) {
      this.renderTime = last.t;
    }

    if (samples.length === 1) {
      return { x: first.x, y: first.y };
    }

    for (let index = samples.length - 1; index > 0; index -= 1) {
      const from = samples[index - 1];
      const to = samples[index];
      if (this.renderTime >= from.t && this.renderTime <= to.t) {
        const span = to.t - from.t;
        const progress = span > 0 ? (this.renderTime - from.t) / span : 1;
        return {
          x: from.x + (to.x - from.x) * progress,
          y: from.y + (to.y - from.y) * progress,
        };
      }
    }

    return { x: last.x, y: last.y };
  }

  private advanceClock(now: number, firstSampleTime: number) {
    if (this.renderTime === 0) {
      this.renderTime = firstSampleTime;
      this.lastNow = now;
      return;
    }

    const delta = Math.max(0, Math.min(MAX_FRAME_DELTA_MS, now - this.lastNow));
    this.lastNow = now;

    const desired = now - this.delayMs;
    const drift = desired - this.renderTime;

    if (drift > RESYNC_AHEAD_MS) {
      this.renderTime = desired;
      return;
    }

    const adjust = Math.max(-MAX_RATE_ADJUST, Math.min(MAX_RATE_ADJUST, drift / RATE_WINDOW_MS));
    this.renderTime += delta * (1 + adjust);
  }
}
