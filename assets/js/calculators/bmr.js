document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="bmr"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });
  const activityFactors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very: 1.9 };
  const activityLabels = { sedentary: 'Sedentary', light: 'Light', moderate: 'Moderate', active: 'Active', very: 'Very Active' };

  engine.onCalculate = (v) => {
    const weight = engine.parseNumber(v.weight);
    const height = engine.parseNumber(v.height);
    const age = engine.parseNumber(v.age);
    const sex = v.sex || 'male';
    if (!weight || !height || !age) return null;

    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += sex === 'male' ? 5 : -161;
    const factor = activityFactors[v.activity] || 1.2;
    const tdee = bmr * factor;

    UI.publishDashboard(engine, {
      primary: bmr,
      primaryFormat: 'number',
      decimals: 0,
      metrics: [
        engine.formatNumber(tdee, 0) + ' kcal/day',
        engine.formatNumber(tdee - 500, 0) + ' kcal',
        activityLabels[v.activity] || 'Sedentary'
      ],
      sticky: engine.formatNumber(bmr, 0) + ' kcal',
      compare: engine.formatNumber(bmr, 0) + ' kcal/day',
      shareBadge: activityLabels[v.activity] || 'Sedentary',
      shareText: `My BMR is ${engine.formatNumber(bmr, 0)} kcal/day — calculate yours free!`,
      insights: [
        { icon: '🔥', text: `Your body burns ${engine.formatNumber(bmr, 0)} kcal/day at rest (BMR).` },
        { icon: '🏃', text: `With ${activityLabels[v.activity] || 'sedentary'} activity, TDEE is ${engine.formatNumber(tdee, 0)} kcal/day.` },
        { icon: '📉', text: `A 500 kcal deficit (${engine.formatNumber(tdee - 500, 0)} kcal) supports ~0.5 kg/week fat loss.` },
        { icon: '💡', text: 'Recalculate BMR every 5 kg of weight change for accurate targets.' }
      ]
    });

    return { bmr, tdee };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: (d) => {
      let b = 10 * d.weight + 6.25 * d.height - 5 * d.age;
      b += d.sex === 'male' ? 5 : -161;
      return engine.formatNumber(b, 0) + ' kcal BMR';
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
