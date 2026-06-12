document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="bmi"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });

  UI.bindSliders(form);

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
    let status = 'Healthy range';
    if (bmi < 18.5) { category = 'Underweight'; status = 'Below healthy range'; }
    else if (bmi < 25) { category = 'Normal'; status = 'Healthy weight'; }
    else if (bmi < 30) { category = 'Overweight'; status = 'Above healthy range'; }
    else { category = 'Obese'; status = 'High health risk'; }

    const idealLow = 18.5 * height * height;
    const idealHigh = 24.9 * height * height;

    const timeline = [
      { label: 'Underweight', balance: 'BMI < 18.5', growth: '< 18.5', milestone: '⚠️ May need nutrition support' },
      { label: 'Normal', balance: 'BMI 18.5 – 24.9', growth: 'Healthy', milestone: '✅ WHO recommended' },
      { label: 'Overweight', balance: 'BMI 25 – 29.9', growth: 'Elevated', milestone: '📋 Monitor diet & activity' },
      { label: 'Obese', balance: 'BMI ≥ 30', growth: 'High risk', milestone: '🏥 Consult healthcare provider' }
    ];

    UI.publishDashboard(engine, {
      primary: bmi,
      primaryFormat: 'number',
      decimals: 1,
      metrics: [category, idealLow.toFixed(0) + ' – ' + idealHigh.toFixed(0) + ' kg', status],
      compare: 'BMI ' + engine.formatNumber(bmi, 1),
      shareBadge: category,
      shareText: `My BMI is ${engine.formatNumber(bmi, 1)} (${category}) — check yours free!`,
      timeline,
      goalValue: bmi,
      fieldDisplays: {
        weight: engine.formatNumber(engine.parseNumber(v.weight), 0) + (unit === 'imperial' ? ' lbs' : ' kg'),
        height: engine.formatNumber(engine.parseNumber(v.height), 0) + (unit === 'imperial' ? ' in' : ' cm')
      },
      insights: [
        { icon: '📏', text: `Your BMI is ${engine.formatNumber(bmi, 1)} — classified as ${category}.` },
        { icon: '🎯', text: `Healthy weight range for your height: ${idealLow.toFixed(0)}–${idealHigh.toFixed(0)} kg.` },
        { icon: '💪', text: 'BMI is a screening tool — muscle mass and body composition also matter.' },
        { icon: '📊', text: 'India adult average BMI is around 24.0 — track monthly for trends.' }
      ]
    });

    return { bmi, category };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: (d) => {
      const h = d.unit === 'imperial' ? d.height * 2.54 / 100 : d.height / 100;
      const w = d.unit === 'imperial' ? d.weight * 0.453592 : d.weight;
      return 'BMI ' + engine.formatNumber(w / (h * h), 1);
    },
    apply: (d, f) => {
      if (d.unit) f.querySelector('#unit').value = d.unit;
      setField(f, 'weight', d.weight);
      setField(f, 'height', d.height);
      engine.calculate();
    }
  });

  function setField(f, id, val) {
    const input = f.querySelector('#' + id);
    const range = f.querySelector('#' + id + '-range');
    if (input) { input.value = val; input.dispatchEvent(new Event('input', { bubbles: true })); }
    if (range) range.value = val;
  }
});
