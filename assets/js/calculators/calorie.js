document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calc-form');
  const results = document.getElementById('calc-results');
  if (!form) return;

  const engine = new CalculatorEngine({ form });
  const activityFactors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very: 1.9 };

  engine.onCalculate = (v) => {
    const weight = engine.parseNumber(v.weight);
    const height = engine.parseNumber(v.height);
    const age = engine.parseNumber(v.age);
    const sex = v.sex || 'male';
    if (!weight || !height || !age) return null;

    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += sex === 'male' ? 5 : -161;
    const tdee = bmr * (activityFactors[v.activity] || 1.2);

    const result = {
      primary: `${engine.formatNumber(tdee, 0)} kcal`,
      primaryLabel: 'Daily Calorie Needs',
      items: [
        { label: 'Weight Loss', value: `${engine.formatNumber(tdee - 500, 0)} kcal` },
        { label: 'Maintenance', value: `${engine.formatNumber(tdee, 0)} kcal` },
        { label: 'Muscle Gain', value: `${engine.formatNumber(tdee + 300, 0)} kcal` }
      ]
    };
    engine.renderResults(results, result);
    return result;
  };
  engine.init();
});
