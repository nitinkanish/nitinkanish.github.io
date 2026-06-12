document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="temperature-converter"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
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

    UI.publishDashboard(engine, {
      primary: engine.formatNumber(result, 2) + '°' + toUnit.value.toUpperCase(),
      metrics: [
        engine.formatNumber(c, 2) + '°C',
        engine.formatNumber(fromCelsius(c, 'f'), 2) + '°F',
        engine.formatNumber(c + 273.15, 2) + ' K'
      ],
      compare: engine.formatNumber(result, 2) + '°' + toUnit.value.toUpperCase(),
      shareBadge: fromUnit.value.toUpperCase() + ' → ' + toUnit.value.toUpperCase(),
      shareText: `${val}°${fromUnit.value.toUpperCase()} = ${engine.formatNumber(result, 2)}°${toUnit.value.toUpperCase()}`,
      insights: [
        { icon: '🌡', text: `${val}°${fromUnit.value.toUpperCase()} = ${engine.formatNumber(result, 2)}°${toUnit.value.toUpperCase()}.` },
        { icon: '🔬', text: `Celsius: ${engine.formatNumber(c, 2)}°C · Fahrenheit: ${engine.formatNumber(fromCelsius(c, 'f'), 2)}°F.` },
        { icon: '💡', text: 'Water freezes at 0°C (32°F) and boils at 100°C (212°F).' },
        { icon: '🧪', text: 'Absolute zero is −273.15°C (0 K).' }
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

  UI.bindExamples(form, {
    preview: (d) => {
      const c = toCelsius(d.from_value, d.from_unit);
      return engine.formatNumber(fromCelsius(c, d.to_unit), 1) + '°' + d.to_unit.toUpperCase();
    },
    apply: (d) => {
      fromInput.value = d.from_value;
      fromUnit.value = d.from_unit;
      toUnit.value = d.to_unit;
      convert();
    }
  });

  convert();
});
