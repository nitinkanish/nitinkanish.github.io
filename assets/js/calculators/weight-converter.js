document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calc-form');
  const results = document.getElementById('calc-results');
  if (!form) return;

  const units = {
    mg: 0.000001, g: 0.001, kg: 1, t: 1000,
    oz: 0.0283495, lb: 0.453592, st: 6.35029
  };

  const engine = new CalculatorEngine({ form });
  const fromInput = form.querySelector('[name="from_value"]');
  const toInput = form.querySelector('[name="to_value"]');
  const fromUnit = form.querySelector('[name="from_unit"]');
  const toUnit = form.querySelector('[name="to_unit"]');

  function convert() {
    const val = engine.parseNumber(fromInput.value);
    if (!val) return;
    const kg = val * units[fromUnit.value];
    const result = kg / units[toUnit.value];
    toInput.value = engine.formatNumber(result, 6);
    engine.renderResults(results, {
      primary: `${engine.formatNumber(result, 4)} ${toUnit.value}`,
      primaryLabel: 'Converted Value',
      items: [
        { label: 'From', value: `${val} ${fromUnit.value}` },
        { label: 'Kilograms', value: engine.formatNumber(kg, 4) }
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
