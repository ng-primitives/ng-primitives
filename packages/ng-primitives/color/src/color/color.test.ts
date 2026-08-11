import { Color } from './color';

describe('Color.parse', () => {
  it('parses 6-digit hex', () => {
    const c = Color.parse('#3366cc');
    expect(c.getColorSpace()).toBe('rgb');
    expect(c.getChannelValue('red')).toBe(51);
    expect(c.getChannelValue('green')).toBe(102);
    expect(c.getChannelValue('blue')).toBe(204);
    expect(c.getChannelValue('alpha')).toBe(1);
  });

  it('parses 3-digit shorthand hex', () => {
    const c = Color.parse('#f00');
    expect(c.getChannelValue('red')).toBe(255);
    expect(c.getChannelValue('green')).toBe(0);
    expect(c.getChannelValue('blue')).toBe(0);
  });

  it('parses 8-digit hex with alpha', () => {
    const c = Color.parse('#3366cc80');
    expect(c.getChannelValue('red')).toBe(51);
    expect(c.getChannelValue('alpha')).toBeCloseTo(0.502, 2);
  });

  it('parses rgb() and rgba()', () => {
    expect(Color.parse('rgb(51, 102, 204)').getChannelValue('blue')).toBe(204);
    expect(Color.parse('rgba(51, 102, 204, 0.5)').getChannelValue('alpha')).toBe(0.5);
  });

  it('parses hsl() and hsla()', () => {
    const c = Color.parse('hsl(220, 60%, 50%)');
    expect(c.getColorSpace()).toBe('hsl');
    expect(c.getChannelValue('hue')).toBe(220);
    expect(c.getChannelValue('saturation')).toBe(60);
    expect(c.getChannelValue('lightness')).toBe(50);
  });

  it('parses hsb()/hsba()', () => {
    const c = Color.parse('hsb(220, 75%, 80%)');
    expect(c.getColorSpace()).toBe('hsb');
    expect(c.getChannelValue('brightness')).toBe(80);
  });

  it('is case and whitespace insensitive', () => {
    expect(Color.parse('  #FFF  ').getChannelValue('red')).toBe(255);
    expect(Color.parse('RGB(1,2,3)').getChannelValue('red')).toBe(1);
  });

  it('parses modern space-separated syntax with alpha', () => {
    const c = Color.parse('rgb(51 102 204 / 0.5)');
    expect(c.getChannelValue('red')).toBe(51);
    expect(c.getChannelValue('alpha')).toBe(0.5);
  });

  it('clamps out-of-range channel values and wraps hue', () => {
    expect(Color.parse('rgb(999, 0, 300)').getChannelValue('red')).toBe(255);
    expect(Color.parse('rgb(999, 0, 300)').getChannelValue('blue')).toBe(255);
    // hue wraps modulo 360 to match CSS (hsl(400) -> 40), the rest clamp
    expect(Color.parse('hsl(400, 150%, 50%)').getChannelValue('hue')).toBe(40);
    expect(Color.parse('hsl(400, 150%, 50%)').getChannelValue('saturation')).toBe(100);
    expect(Color.parse('rgba(0,0,0,2)').getChannelValue('alpha')).toBe(1);
  });

  it('throws on invalid input', () => {
    expect(() => Color.parse('not a color')).toThrow();
    expect(() => Color.parse('#gg0000')).toThrow();
    expect(() => Color.parse('#12345')).toThrow();
  });
});

describe('getChannelValue (auto-converting reads)', () => {
  // #3366cc = rgb(51,102,204) = hsl(220,60,50) = hsb(220,75,80)
  const rgb = Color.parse('#3366cc');

  it('reads in-space channels directly', () => {
    expect(rgb.getChannelValue('red')).toBe(51);
  });

  it('reads a foreign channel by converting (hue -> hsb/hsl are equal)', () => {
    expect(rgb.getChannelValue('hue')).toBeCloseTo(220, 0);
  });

  it('reads lightness by converting to hsl', () => {
    expect(rgb.getChannelValue('lightness')).toBeCloseTo(50, 0);
  });

  it('reads brightness by converting to hsb', () => {
    expect(rgb.getChannelValue('brightness')).toBeCloseTo(80, 0);
  });

  it('resolves the ambiguous saturation channel to hsb', () => {
    // hsb saturation = 75, hsl saturation = 60 — must pick hsb
    expect(rgb.getChannelValue('saturation')).toBeCloseTo(75, 0);
  });

  it('reads saturation in-space when the color is already hsl', () => {
    expect(Color.parse('hsl(220, 60%, 50%)').getChannelValue('saturation')).toBe(60);
  });
});

describe('getChannelRange', () => {
  it('reports space-independent ranges per channel', () => {
    const c = Color.parse('#3366cc');
    expect(c.getChannelRange('red')).toEqual({ min: 0, max: 255, step: 1 });
    expect(c.getChannelRange('hue')).toEqual({ min: 0, max: 360, step: 1 });
    expect(c.getChannelRange('saturation')).toEqual({ min: 0, max: 100, step: 1 });
    expect(c.getChannelRange('alpha')).toEqual({ min: 0, max: 1, step: 0.01 });
  });
});

describe('getColorChannels', () => {
  it('lists the three non-alpha channels of the space', () => {
    expect(Color.parse('#3366cc').getColorChannels()).toEqual(['red', 'green', 'blue']);
    expect(Color.parse('hsl(0,0%,0%)').getColorChannels()).toEqual([
      'hue',
      'saturation',
      'lightness',
    ]);
    expect(Color.parse('hsb(0,0%,0%)').getColorChannels()).toEqual([
      'hue',
      'saturation',
      'brightness',
    ]);
  });
});

describe('toFormat', () => {
  const rgb = Color.parse('#3366cc');

  it('rgb -> hsl', () => {
    const hsl = rgb.toFormat('hsl');
    expect(hsl.getColorSpace()).toBe('hsl');
    expect(hsl.getChannelValue('hue')).toBeCloseTo(220, 0);
    expect(hsl.getChannelValue('saturation')).toBeCloseTo(60, 0);
    expect(hsl.getChannelValue('lightness')).toBeCloseTo(50, 0);
  });

  it('rgb -> hsb', () => {
    const hsb = rgb.toFormat('hsb');
    expect(hsb.getChannelValue('saturation')).toBeCloseTo(75, 0);
    expect(hsb.getChannelValue('brightness')).toBeCloseTo(80, 0);
  });

  it('round-trips primaries without drift', () => {
    const red = Color.parse('#ff0000');
    expect(red.toFormat('hsb').toFormat('rgb').toHex()).toBe('#ff0000');
    expect(red.toFormat('hsl').toFormat('rgb').toHex()).toBe('#ff0000');
  });

  it('handles achromatic colors', () => {
    expect(Color.parse('#ffffff').toFormat('hsb').getChannelValue('saturation')).toBe(0);
    expect(Color.parse('#000000').toFormat('hsl').getChannelValue('lightness')).toBe(0);
  });

  it('preserves alpha across conversion', () => {
    expect(Color.parse('rgba(255,0,0,0.5)').toFormat('hsb').getChannelValue('alpha')).toBe(0.5);
  });
});

describe('string outputs', () => {
  const c = Color.parse('#3366cc');
  const translucent = Color.parse('rgba(51, 102, 204, 0.5)');

  it('toHex / toHexa', () => {
    expect(c.toHex()).toBe('#3366cc');
    expect(translucent.toHexa()).toBe('#3366cc80');
  });

  it('toRgb / toRgba (comma form)', () => {
    expect(c.toRgb()).toBe('rgb(51, 102, 204)');
    expect(translucent.toRgba()).toBe('rgba(51, 102, 204, 0.5)');
  });

  it('toHsl / toHsla', () => {
    expect(c.toHsl()).toBe('hsl(220, 60%, 50%)');
    expect(translucent.toHsla()).toBe('hsla(220, 60%, 50%, 0.5)');
  });

  it('toHsb / toHsba', () => {
    expect(c.toHsb()).toBe('hsb(220, 75%, 80%)');
    expect(translucent.toHsba()).toBe('hsba(220, 75%, 80%, 0.5)');
  });

  it('toCss picks hex when opaque, rgba when translucent', () => {
    expect(c.toCss()).toBe('#3366cc');
    expect(translucent.toCss()).toBe('rgba(51, 102, 204, 0.5)');
  });

  it('toString delegates to toCss', () => {
    expect(c.toString()).toBe(c.toCss());
    expect(`${translucent}`).toBe('rgba(51, 102, 204, 0.5)');
  });
});

describe('withChannelValue (immutable, auto-converting)', () => {
  it('returns a new color, leaving the original unchanged', () => {
    const a = Color.parse('#3366cc');
    const b = a.withChannelValue('red', 0);
    expect(a.getChannelValue('red')).toBe(51);
    expect(b.getChannelValue('red')).toBe(0);
    expect(b).not.toBe(a);
  });

  it('clamps to the channel range', () => {
    const hsb = Color.parse('hsb(220,75%,80%)');
    expect(hsb.withChannelValue('saturation', 500).getChannelValue('saturation')).toBe(100);
    expect(hsb.withChannelValue('brightness', -20).getChannelValue('brightness')).toBe(0);
    expect(Color.parse('#3366cc').withChannelValue('alpha', 5).getChannelValue('alpha')).toBe(1);
  });

  it('auto-converts when the channel is not in the color own space', () => {
    const green = Color.parse('#ff0000').withChannelValue('hue', 120);
    expect(green.getColorSpace()).toBe('hsb');
    expect(green.toHex()).toBe('#00ff00');
  });

  it('stays in space when the channel belongs to it', () => {
    const c = Color.parse('hsl(220,60%,50%)').withChannelValue('saturation', 30);
    expect(c.getColorSpace()).toBe('hsl');
    expect(c.getChannelValue('saturation')).toBe(30);
  });
});

describe('fluent getters', () => {
  const rgb = Color.parse('#3366cc');

  it('getRed/getGreen/getBlue read the rgb channels', () => {
    expect(rgb.getRed()).toBe(51);
    expect(rgb.getGreen()).toBe(102);
    expect(rgb.getBlue()).toBe(204);
  });

  it('getAlpha reads alpha', () => {
    expect(Color.parse('rgba(0,0,0,0.5)').getAlpha()).toBe(0.5);
    expect(rgb.getAlpha()).toBe(1);
  });

  it('getHue/getSaturation/getLightness/getBrightness auto-convert', () => {
    expect(rgb.getHue()).toBeCloseTo(220, 0);
    expect(rgb.getSaturation()).toBeCloseTo(75, 0); // ambiguous -> hsb
    expect(rgb.getLightness()).toBeCloseTo(50, 0);
    expect(rgb.getBrightness()).toBeCloseTo(80, 0);
  });

  it('getSaturation stays hsl when the color is hsl', () => {
    expect(Color.parse('hsl(220,60%,50%)').getSaturation()).toBe(60);
  });
});

describe('fluent withers', () => {
  it('withAlpha', () => {
    const c = Color.parse('#ff0000').withAlpha(0.5);
    expect(c.getChannelValue('alpha')).toBe(0.5);
    expect(c.toRgba()).toBe('rgba(255, 0, 0, 0.5)');
  });

  it('withRed/withGreen/withBlue operate in rgb', () => {
    expect(Color.parse('#000000').withRed(255).toHex()).toBe('#ff0000');
    expect(Color.parse('#000000').withGreen(255).toHex()).toBe('#00ff00');
    expect(Color.parse('#000000').withBlue(255).toHex()).toBe('#0000ff');
  });

  it('withHue auto-converts to hsb', () => {
    const c = Color.parse('#ff0000').withHue(240);
    expect(c.getColorSpace()).toBe('hsb');
    expect(c.toHex()).toBe('#0000ff');
  });

  it('withSaturation resolves to hsb by default', () => {
    const c = Color.parse('#ff0000').withSaturation(50);
    expect(c.getColorSpace()).toBe('hsb');
    expect(c.getChannelValue('saturation')).toBe(50);
  });

  it('withSaturation stays hsl when the color is hsl', () => {
    const c = Color.parse('hsl(0,100%,50%)').withSaturation(40);
    expect(c.getColorSpace()).toBe('hsl');
    expect(c.getChannelValue('saturation')).toBe(40);
  });

  it('withLightness -> hsl, withBrightness -> hsb', () => {
    expect(Color.parse('#ff0000').withLightness(100).getColorSpace()).toBe('hsl');
    expect(Color.parse('#ff0000').withBrightness(50).getColorSpace()).toBe('hsb');
  });

  it('withers clamp and are immutable', () => {
    const red = Color.parse('#ff0000');
    expect(red.withAlpha(9).getChannelValue('alpha')).toBe(1);
    expect(red.getChannelValue('alpha')).toBe(1); // original unchanged
    expect(red.withHue(400).getChannelValue('hue')).toBe(360);
  });
});
