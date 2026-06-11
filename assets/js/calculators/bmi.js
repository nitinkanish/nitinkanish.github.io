document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calc-form');
  const results = document.getElementById('calc-results');
  if (!form) return;

  const engine = new CalculatorEngine({ form });
  engine.onCalculate = (v) => {
    let weight = engine.parseNumber(v.weight);
    let height = engine.parseNumber(v.height);
    const unit = v.unit || 'metric';

    if (unit === 'imperial') {
      weight = weight * 0.453592;
      height = height * 2.54 / 100;
    } else {
      height = height / 100;
    }

    if (!weight || !height) return null;
    const bmi = weight / (height * height);
    let category = 'Normal';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    const result = {
      primary: engine.formatNumber(bmi, 1),
      primaryLabel: 'Your BMI',
      items: [
        { label: 'Category', value: category },
        { label: 'Healthy Range', value: '18.5 – 24.9' },
        { label: 'Weight', value: `${engine.formatNumber(weight, 1)} kg` }
      ]
    };
    engine.renderResults(results, result);
    return result;
  };
  engine.init();
});
