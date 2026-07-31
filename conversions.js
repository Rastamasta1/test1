// conversions.js — pure ES module with all unit definitions and conversion logic

export const UNIT_TYPES = ['length', 'weight', 'temperature'];

export const UNITS = {
  length: [
    { value: 'mm',  label: 'Millimeter (mm)' },
    { value: 'cm',  label: 'Centimeter (cm)' },
    { value: 'm',   label: 'Meter (m)' },
    { value: 'km',  label: 'Kilometer (km)' },
    { value: 'in',  label: 'Inch (in)' },
    { value: 'ft',  label: 'Foot (ft)' },
    { value: 'yd',  label: 'Yard (yd)' },
    { value: 'mi',  label: 'Mile (mi)' },
  ],
  weight: [
    { value: 'mg',  label: 'Milligram (mg)' },
    { value: 'g',   label: 'Gram (g)' },
    { value: 'kg',  label: 'Kilogram (kg)' },
    { value: 't',   label: 'Tonne (t)' },
    { value: 'oz',  label: 'Ounce (oz)' },
    { value: 'lb',  label: 'Pound (lb)' },
    { value: 'st',  label: 'Stone (st)' },
  ],
  temperature: [
    { value: 'C',   label: 'Celsius (°C)' },
    { value: 'F',   label: 'Fahrenheit (°F)' },
    { value: 'K',   label: 'Kelvin (K)' },
  ],
};

// Length: base unit = meter
const LENGTH_TO_M = {
  mm: 0.001,
  cm: 0.01,
  m:  1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

// Weight: base unit = gram
const WEIGHT_TO_G = {
  mg: 0.001,
  g:  1,
  kg: 1000,
  t:  1_000_000,
  oz: 28.349523125,
  lb: 453.59237,
  st: 6350.29318,
};

// Temperature conversions (cannot use simple factor)
function convertTemp(value, from, to) {
  if (from === to) return value;
  // Convert to Celsius first
  let celsius;
  if (from === 'C') celsius = value;
  else if (from === 'F') celsius = (value - 32) * 5 / 9;
  else if (from === 'K') celsius = value - 273.15;
  // Convert from Celsius to target
  if (to === 'C') return celsius;
  if (to === 'F') return celsius * 9 / 5 + 32;
  if (to === 'K') return celsius + 273.15;
}

/**
 * Convert a numeric value between two units of the same type.
 * Returns { result: number, formula: string } or throws on error.
 */
export function convert(type, value, from, to) {
  if (!isFinite(value)) throw new Error('Value must be a finite number');

  if (type === 'temperature') {
    const result = convertTemp(value, from, to);
    const formula = buildTempFormula(from, to);
    return { result, formula };
  }

  if (type === 'length') {
    if (from === to) return { result: value, formula: '× 1' };
    const meters = value * LENGTH_TO_M[from];
    const result = meters / LENGTH_TO_M[to];
    const factor = LENGTH_TO_M[from] / LENGTH_TO_M[to];
    return { result, formula: formatFactor(factor) };
  }

  if (type === 'weight') {
    if (from === to) return { result: value, formula: '× 1' };
    const grams = value * WEIGHT_TO_G[from];
    const result = grams / WEIGHT_TO_G[to];
    const factor = WEIGHT_TO_G[from] / WEIGHT_TO_G[to];
    return { result, formula: formatFactor(factor) };
  }

  throw new Error('Unknown unit type: ' + type);
}

function formatFactor(factor) {
  // Show up to 8 significant digits
  const s = +factor.toPrecision(8);
  return '× ' + s;
}

function buildTempFormula(from, to) {
  if (from === to) return 'no conversion';
  const map = {
    'C→F': '°F = °C × 9/5 + 32',
    'C→K': 'K = °C + 273.15',
    'F→C': '°C = (°F − 32) × 5/9',
    'F→K': 'K = (°F − 32) × 5/9 + 273.15',
    'K→C': '°C = K − 273.15',
    'K→F': '°F = (K − 273.15) × 9/5 + 32',
  };
  return map[from + '→' + to] || '';
}

/**
 * Format a result number for display: up to 10 significant figures,
 * no unnecessary trailing zeros, scientific notation for very large/small.
 */
export function formatResult(num) {
  if (!isFinite(num)) return 'Error';
  if (num === 0) return '0';
  const abs = Math.abs(num);
  if (abs >= 1e12 || (abs < 1e-6 && abs > 0)) {
    return num.toExponential(6);
  }
  // toPrecision gives us sig figs; parseFloat strips trailing zeros
  return String(parseFloat(num.toPrecision(10)));
}
