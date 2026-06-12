document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="calorie"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
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

    UI.publishDashboard(engine, {
      primary: tdee,
      primaryFormat: 'number',
      decimals: 0,
      metrics: [
        engine.formatNumber(tdee - 500, 0) + ' kcal',
        engine.formatNumber(tdee, 0) + ' kcal',
        engine.formatNumber(tdee + 300, 0) + ' kcal'
      ],
      sticky: engine.formatNumber(tdee, 0) + ' kcal',
      compare: engine.formatNumber(tdee, 0) + ' kcal/day',
      shareBadge: 'TDEE Plan',
      shareText: `My daily calorie needs: ${engine.formatNumber(tdee, 0)} kcal — plan yours free!`,
      insights: [
        { icon: '🍽', text: `Maintenance: ${engine.formatNumber(tdee, 0)} kcal/day to stay at current weight.` },
        { icon: '📉', text: `Weight loss target: ${engine.formatNumber(tdee - 500, 0)} kcal/day (safe 0.5 kg/week).` },
        { icon: '💪', text: `Muscle gain target: ${engine.formatNumber(tdee + 300, 0)} kcal/day with strength training.` },
        { icon: '⚖️', text: 'Adjust calories by 100–200 kcal every 2 weeks based on scale trends.' }
      ]
    });

    return { tdee };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: (d) => {
      let b = 10 * d.weight + 6.25 * d.height - 5 * d.age + (d.sex === 'male' ? 5 : -161);
      const f = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very: 1.9 };
      return engine.formatNumber(b * (f[d.activity] || 1.2), 0) + ' kcal';
    },
    apply: (d, f) => {
      ['weight', 'height', 'age'].forEach((k) => setVal(f, k, d[k]));
      if (d.sex) f.querySelector('#sex').value = d.sex;
      if (d.activity) f.querySelector('#activity').value = d.activity;
      engine.calculate();
    }
  });

  function setVal(f, id, val) {
    const el = f.querySelector('#' + id);
    if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
  }
});
