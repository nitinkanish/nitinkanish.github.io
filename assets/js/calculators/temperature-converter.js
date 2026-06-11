document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calc-form');
  const results = document.getElementById('calc-results');
  if (!form) return;

  const engine = new CalculatorEngine({ form });
  const fromInput = form.querySelector('[name="from_value"]');
  const toInput = form.querySelector('[name="to_value"]');
  const fromUnit = form.querySelector('[name="from_unit"]');
  const toUnit = form.querySelector('[name="to_unit"]');

  function toCelsius(val, unit) {
    if (unit === 'c') return val;
    if (unit === 'f') return (val - 32) * 5 / 9;
    return val - 273.15;
  }

  function fromCelsius(c, unit) {
    if (unit === 'c') return c;
    if (unit === 'f') return c * 9 / 5 + 32;
    return c + 273.15;
  }

  function convert() {
    const val = engine.parseNumber(fromInput.value);
    if (isNaN(val)) return;
    const c = toCelsius(val, fromUnit.value);
    const result = fromCelsius(c, toUnit.value);
    toInput.value = engine.formatNumber(result, 2);
    engine.renderResults(results, {
      primary: `${engine.formatNumber(result, 2)}°${toUnit.value.toUpperCase()}`,
      primaryLabel: 'Converted Temperature',
      items: [
        { label: 'Celsius', value: `${engine.formatNumber(c, 2)}°C` },
        { label: 'Fahrenheit', value: `${engine.formatNumber(fromCelsius(c, 'f'), 2)}°F` }
      ]
    });
  }

  form.addEventListener('input', convert);
  form.querySelector('.swap-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    const tmp = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = tmp;
    fromInput.value = toInput.value;
    convert();
  });
  convert();
});
