// A tiny, interruptible spring modelled on Apple's designer-facing parameters:
//   damping:  1.0 is critically damped (no overshoot), < 1 bounces.
//   response: roughly how quickly the value reaches its target, in seconds.
// Calling `to()` mid-flight re-targets from the *current* value and velocity,
// so motion never jumps and a reversal never hits a "brick wall".

export interface SpringOptions {
  damping?: number
  response?: number
  /** Initial velocity in units per second (e.g. a gesture's release velocity). */
  velocity?: number
}

const reducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export class Spring {
  value: number
  velocity = 0
  target: number
  private damping = 1
  private response = 0.4
  private frame = 0
  private last = 0
  private readonly precision: number
  private readonly onUpdate: (value: number) => void
  private readonly onRest?: (value: number) => void

  constructor(
    value: number,
    onUpdate: (value: number) => void,
    options: { onRest?: (value: number) => void; precision?: number } = {},
  ) {
    this.value = value
    this.target = value
    this.onUpdate = onUpdate
    this.onRest = options.onRest
    this.precision = options.precision ?? 0.5
  }

  get isAnimating() {
    return this.frame !== 0
  }

  to(target: number, options: SpringOptions = {}) {
    this.target = target
    if (options.damping !== undefined) this.damping = options.damping
    if (options.response !== undefined) this.response = options.response
    if (options.velocity !== undefined) this.velocity = options.velocity

    if (reducedMotion()) {
      this.set(target)
      this.onRest?.(target)
      return
    }
    if (!this.frame) {
      this.last = performance.now()
      this.frame = requestAnimationFrame(this.tick)
    }
  }

  /** Jump straight to a value, used while a finger is tracking 1:1. */
  set(value: number) {
    this.stop()
    this.value = value
    this.target = value
    this.velocity = 0
    this.onUpdate(value)
  }

  stop() {
    cancelAnimationFrame(this.frame)
    this.frame = 0
  }

  private tick = (now: number) => {
    // Clamp long frames (background tabs) so the simulation stays stable.
    const dt = Math.min((now - this.last) / 1000, 0.064)
    this.last = now

    const stiffness = (2 * Math.PI / this.response) ** 2
    const friction = (4 * Math.PI * this.damping) / this.response
    const steps = Math.max(1, Math.ceil(dt * 240))
    const h = dt / steps

    for (let i = 0; i < steps; i++) {
      const acceleration = -stiffness * (this.value - this.target) - friction * this.velocity
      this.velocity += acceleration * h
      this.value += this.velocity * h
    }

    const settled =
      Math.abs(this.velocity) < this.precision * 10 &&
      Math.abs(this.value - this.target) < this.precision

    if (settled) {
      this.value = this.target
      this.velocity = 0
      this.frame = 0
      this.onUpdate(this.value)
      this.onRest?.(this.value)
      return
    }

    this.onUpdate(this.value)
    this.frame = requestAnimationFrame(this.tick)
  }
}

/** Where a flick will come to rest (Apple's scroll-deceleration projection). */
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

/** Progressive resistance past a boundary instead of a hard stop. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

/** Tracks recent pointer samples to measure release velocity (px/s). */
export class VelocityTracker {
  private samples: { value: number; time: number }[] = []

  reset() {
    this.samples = []
  }

  add(value: number, time = performance.now()) {
    this.samples.push({ value, time })
    while (this.samples.length > 2 && time - this.samples[0].time > 100) this.samples.shift()
  }

  get velocity() {
    if (this.samples.length < 2) return 0
    const first = this.samples[0]
    const last = this.samples[this.samples.length - 1]
    const elapsed = last.time - first.time
    // A finger that stopped before lifting has no momentum.
    if (elapsed <= 0 || performance.now() - last.time > 80) return 0
    return ((last.value - first.value) / elapsed) * 1000
  }
}
