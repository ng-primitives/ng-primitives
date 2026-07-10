/**
 * A minimal immutable color model supporting the rgb, hsl and hsb color spaces (each with alpha).
 * Construct with {@link Color.parse}; derive new colors with the immutable `with*` methods. Reads and
 * withers auto-convert across spaces, so any channel is accessible regardless of the color's own space.
 */
export type ColorSpace = 'rgb' | 'hsl' | 'hsb';

export type ColorChannel =
  | 'red'
  | 'green'
  | 'blue'
  | 'hue'
  | 'saturation'
  | 'lightness'
  | 'brightness'
  | 'alpha';

export interface ColorChannelRange {
  min: number;
  max: number;
  step: number;
}

const SPACE_CHANNELS: Record<ColorSpace, [ColorChannel, ColorChannel, ColorChannel]> = {
  rgb: ['red', 'green', 'blue'],
  hsl: ['hue', 'saturation', 'lightness'],
  hsb: ['hue', 'saturation', 'brightness'],
};

const RANGES: Record<ColorChannel, ColorChannelRange> = {
  red: { min: 0, max: 255, step: 1 },
  green: { min: 0, max: 255, step: 1 },
  blue: { min: 0, max: 255, step: 1 },
  hue: { min: 0, max: 360, step: 1 },
  saturation: { min: 0, max: 100, step: 1 },
  lightness: { min: 0, max: 100, step: 1 },
  brightness: { min: 0, max: 100, step: 1 },
  alpha: { min: 0, max: 1, step: 0.01 },
};

/** The space a channel resolves to when it is not present in a color's own space (ambiguous → hsb). */
const CHANNEL_SPACE: Record<Exclude<ColorChannel, 'alpha'>, ColorSpace> = {
  red: 'rgb',
  green: 'rgb',
  blue: 'rgb',
  lightness: 'hsl',
  brightness: 'hsb',
  hue: 'hsb',
  saturation: 'hsb',
};

function clamp(value: number, { min, max }: ColorChannelRange): number {
  return Math.min(max, Math.max(min, value));
}

function isChannelInSpace(space: ColorSpace, channel: ColorChannel): boolean {
  return channel === 'alpha' || SPACE_CHANNELS[space].includes(channel);
}

const ZERO: Record<ColorChannel, number> = {
  red: 0,
  green: 0,
  blue: 0,
  hue: 0,
  saturation: 0,
  lightness: 0,
  brightness: 0,
  alpha: 1,
};

export class Color {
  private constructor(
    private readonly space: ColorSpace,
    private readonly values: Record<ColorChannel, number>,
    private readonly alpha: number,
  ) {}

  /** Parse a CSS color string (hex, rgb(a), hsl(a) or hsb(a)) into a `Color`. Throws on invalid input. */
  static parse(value: string): Color {
    const input = value.trim();

    const hex = HEX_RE.exec(input);
    if (hex) {
      return Color.fromHex(hex[1]);
    }

    // normalise out-of-range channel values to match CSS semantics: hue wraps (hsl(400) -> 40),
    // the rest clamp to their range (rgb(999,...) -> 255)
    const ch = (v: string, channel: ColorChannel) =>
      channel === 'hue' ? ((+v % 360) + 360) % 360 : clamp(+v, RANGES[channel]);
    const alpha = (v: string | undefined) => (v === undefined ? 1 : clamp(+v, RANGES.alpha));

    const rgb = RGB_RE.exec(input);
    if (rgb) {
      return new Color(
        'rgb',
        { ...ZERO, red: ch(rgb[1], 'red'), green: ch(rgb[2], 'green'), blue: ch(rgb[3], 'blue') },
        alpha(rgb[4]),
      );
    }

    const hsl = HSL_RE.exec(input);
    if (hsl) {
      return new Color(
        'hsl',
        {
          ...ZERO,
          hue: ch(hsl[1], 'hue'),
          saturation: ch(hsl[2], 'saturation'),
          lightness: ch(hsl[3], 'lightness'),
        },
        alpha(hsl[4]),
      );
    }

    const hsb = HSB_RE.exec(input);
    if (hsb) {
      return new Color(
        'hsb',
        {
          ...ZERO,
          hue: ch(hsb[1], 'hue'),
          saturation: ch(hsb[2], 'saturation'),
          brightness: ch(hsb[3], 'brightness'),
        },
        alpha(hsb[4]),
      );
    }

    throw new Error(`Invalid color value: "${value}"`);
  }

  /** The color space this color is defined in. */
  getColorSpace(): ColorSpace {
    return this.space;
  }

  /** The three non-alpha channels of this color's space, in order. */
  getColorChannels(): ColorChannel[] {
    return [...SPACE_CHANNELS[this.space]];
  }

  /** The value of a channel. Channels outside this color's space are read by converting. */
  getChannelValue(channel: ColorChannel): number {
    if (channel === 'alpha') {
      return this.alpha;
    }
    if (isChannelInSpace(this.space, channel)) {
      return this.values[channel];
    }
    return this.toFormat(CHANNEL_SPACE[channel]).getChannelValue(channel);
  }

  /** The valid range and step for a channel. */
  getChannelRange(channel: ColorChannel): ColorChannelRange {
    return RANGES[channel];
  }

  /** The red channel (0-255), converting to rgb if needed. */
  getRed(): number {
    return this.getChannelValue('red');
  }
  /** The green channel (0-255), converting to rgb if needed. */
  getGreen(): number {
    return this.getChannelValue('green');
  }
  /** The blue channel (0-255), converting to rgb if needed. */
  getBlue(): number {
    return this.getChannelValue('blue');
  }
  /** The hue (0-360), converting if needed. */
  getHue(): number {
    return this.getChannelValue('hue');
  }
  /** The saturation (0-100), resolving to hsb when the color is not already hsl/hsb. */
  getSaturation(): number {
    return this.getChannelValue('saturation');
  }
  /** The lightness (0-100), converting to hsl if needed. */
  getLightness(): number {
    return this.getChannelValue('lightness');
  }
  /** The brightness (0-100), converting to hsb if needed. */
  getBrightness(): number {
    return this.getChannelValue('brightness');
  }
  /** The alpha (0-1). */
  getAlpha(): number {
    return this.alpha;
  }

  /** A new color with `channel` set to `value` (clamped). Converts space if the channel is foreign. */
  withChannelValue(channel: ColorChannel, value: number): Color {
    if (channel === 'alpha') {
      return new Color(this.space, { ...this.values }, clamp(value, RANGES.alpha));
    }
    const targetSpace = isChannelInSpace(this.space, channel) ? this.space : CHANNEL_SPACE[channel];
    const base = this.toFormat(targetSpace);
    return new Color(
      targetSpace,
      { ...base.values, [channel]: clamp(value, RANGES[channel]) },
      base.alpha,
    );
  }

  /** @returns a new color with the red channel set (in rgb). */
  withRed(value: number): Color {
    return this.withChannelValue('red', value);
  }
  /** @returns a new color with the green channel set (in rgb). */
  withGreen(value: number): Color {
    return this.withChannelValue('green', value);
  }
  /** @returns a new color with the blue channel set (in rgb). */
  withBlue(value: number): Color {
    return this.withChannelValue('blue', value);
  }
  /** @returns a new color with the hue set (in hsb, unless already hsl). */
  withHue(value: number): Color {
    return this.withChannelValue('hue', value);
  }
  /** @returns a new color with the saturation set (in hsb, unless already hsl). */
  withSaturation(value: number): Color {
    return this.withChannelValue('saturation', value);
  }
  /** @returns a new color with the lightness set (in hsl). */
  withLightness(value: number): Color {
    return this.withChannelValue('lightness', value);
  }
  /** @returns a new color with the brightness set (in hsb). */
  withBrightness(value: number): Color {
    return this.withChannelValue('brightness', value);
  }
  /** @returns a new color with the alpha set (0-1). */
  withAlpha(value: number): Color {
    return this.withChannelValue('alpha', value);
  }

  /** This color converted to another color space (alpha preserved). */
  toFormat(space: ColorSpace): Color {
    if (space === this.space) {
      return this;
    }
    const { r, g, b } = this.toRgbChannels();
    return Color.fromRgb(space, r, g, b, this.alpha);
  }

  /** '#rrggbb' */
  toHex(): string {
    const { r, g, b } = this.toRgbChannels();
    return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
  }
  /** '#rrggbbaa' */
  toHexa(): string {
    return `${this.toHex()}${hex2(this.alpha * 255)}`;
  }
  /** 'rgb(r, g, b)' */
  toRgb(): string {
    const { r, g, b } = this.toRgbChannels();
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }
  /** 'rgba(r, g, b, a)' */
  toRgba(): string {
    const { r, g, b } = this.toRgbChannels();
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${round2(this.alpha)})`;
  }
  /** 'hsl(h, s%, l%)' */
  toHsl(): string {
    const c = this.toFormat('hsl');
    return `hsl(${Math.round(c.values.hue)}, ${Math.round(c.values.saturation)}%, ${Math.round(c.values.lightness)}%)`;
  }
  /** 'hsla(h, s%, l%, a)' */
  toHsla(): string {
    const c = this.toFormat('hsl');
    return `hsla(${Math.round(c.values.hue)}, ${Math.round(c.values.saturation)}%, ${Math.round(c.values.lightness)}%, ${round2(this.alpha)})`;
  }
  /** 'hsb(h, s%, b%)' */
  toHsb(): string {
    const c = this.toFormat('hsb');
    return `hsb(${Math.round(c.values.hue)}, ${Math.round(c.values.saturation)}%, ${Math.round(c.values.brightness)}%)`;
  }
  /** 'hsba(h, s%, b%, a)' */
  toHsba(): string {
    const c = this.toFormat('hsb');
    return `hsba(${Math.round(c.values.hue)}, ${Math.round(c.values.saturation)}%, ${Math.round(c.values.brightness)}%, ${round2(this.alpha)})`;
  }
  /** The shortest sensible CSS: hex when opaque, rgba when translucent. */
  toCss(): string {
    return this.alpha < 1 ? this.toRgba() : this.toHex();
  }
  /** Delegates to {@link toCss}, so `${color}` yields a valid CSS string. */
  toString(): string {
    return this.toCss();
  }

  /** Convert this color to rgb channels in the 0-255 range (unrounded). */
  private toRgbChannels(): { r: number; g: number; b: number } {
    if (this.space === 'rgb') {
      return { r: this.values.red, g: this.values.green, b: this.values.blue };
    }
    const h = this.values.hue;
    const s = this.values.saturation / 100;
    if (this.space === 'hsl') {
      return hslToRgb(h, s, this.values.lightness / 100);
    }
    return hsbToRgb(h, s, this.values.brightness / 100);
  }

  private static fromHex(hex: string): Color {
    const full =
      hex.length <= 4
        ? hex
            .split('')
            .map(c => c + c)
            .join('')
        : hex;
    return new Color(
      'rgb',
      {
        ...ZERO,
        red: parseInt(full.slice(0, 2), 16),
        green: parseInt(full.slice(2, 4), 16),
        blue: parseInt(full.slice(4, 6), 16),
      },
      full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1,
    );
  }

  private static fromRgb(space: ColorSpace, r: number, g: number, b: number, alpha: number): Color {
    if (space === 'rgb') {
      return new Color('rgb', { ...ZERO, red: r, green: g, blue: b }, alpha);
    }
    const { h, s, x } = space === 'hsl' ? rgbToHsl(r, g, b) : rgbToHsb(r, g, b);
    const third = space === 'hsl' ? 'lightness' : 'brightness';
    return new Color(space, { ...ZERO, hue: h, saturation: s, [third]: x }, alpha);
  }
}

function hex2(value: number): string {
  return Math.round(clamp(value, RANGES.red)).toString(16).padStart(2, '0');
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function rgbHue(r: number, g: number, b: number, max: number, delta: number): number {
  if (delta === 0) {
    return 0;
  }
  let h: number;
  if (max === r) {
    h = ((g - b) / delta) % 6;
  } else if (max === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }
  h *= 60;
  return h < 0 ? h + 360 : h;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; x: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h: rgbHue(r, g, b, max, delta), s: s * 100, x: l * 100 };
}

function rgbToHsb(r: number, g: number, b: number): { h: number; s: number; x: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const s = max === 0 ? 0 : delta / max;
  return { h: rgbHue(r, g, b, max, delta), s: s * 100, x: max * 100 };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const [r, g, b] = hueChroma(h, c, l - c / 2);
  return { r: r * 255, g: g * 255, b: b * 255 };
}

function hsbToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const c = v * s;
  const [r, g, b] = hueChroma(h, c, v - c);
  return { r: r * 255, g: g * 255, b: b * 255 };
}

function hueChroma(h: number, c: number, m: number): [number, number, number] {
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let rgb: [number, number, number];
  if (hp < 1) rgb = [c, x, 0];
  else if (hp < 2) rgb = [x, c, 0];
  else if (hp < 3) rgb = [0, c, x];
  else if (hp < 4) rgb = [0, x, c];
  else if (hp < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return [rgb[0] + m, rgb[1] + m, rgb[2] + m];
}

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
// accept comma- or space-separated channels, and a comma or slash before alpha (modern CSS)
const RGB_RE = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+)\s*)?\)$/i;
const HSL_RE = /^hsla?\(\s*([\d.]+)[\s,]+([\d.]+)%[\s,]+([\d.]+)%\s*(?:[,/]\s*([\d.]+)\s*)?\)$/i;
const HSB_RE = /^hsba?\(\s*([\d.]+)[\s,]+([\d.]+)%[\s,]+([\d.]+)%\s*(?:[,/]\s*([\d.]+)\s*)?\)$/i;
