document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="macro"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });

  engine.onCalculate = (v) => {
    const weight = engine.parseNumber(v.weight);
    const calories = engine.parseNumber(v.calories);
    const proteinPerKg = engine.parseNumber(v.protein_per_kg) || 1.8;
    const goal = v.goal || 'maintain';
    if (!weight || !calories) return null;

    const proteinG = Math.round(weight * proteinPerKg);
    const proteinCal = proteinG * 4;
    const fatPct = goal === 'lose' ? 0.25 : goal === 'gain' ? 0.20 : 0.30;
    const fatCal = Math.round(calories * fatPct);
    const fatG = Math.round(fatCal / 9);
    const carbCal = Math.max(0, calories - proteinCal - fatCal);
    const carbG = Math.round(carbCal / 4);

    const proteinPct = (proteinCal / calories) * 100;
    const fatPctActual = (fatG * 9 / calories) * 100;
    const carbPct = (carbG * 4 / calories) * 100;

    UI.publishDashboard(engine, {
      primary: proteinG + 'g protein',
      metrics: [
        carbG + 'g carbs',
        fatG + 'g fat',
        calories + ' kcal'
      ],
      compare: `${engine.formatNumber(proteinPct, 0)}% P · ${engine.formatNumber(carbPct, 0)}% C · ${engine.formatNumber(fatPctActual, 0)}% F`,
      shareBadge: calories + ' kcal/day',
      shareText: `My macros: ${proteinG}g protein, ${carbG}g carbs, ${fatG}g fat (${calories} cal)`,
      fieldDisplays: {
        weight: weight + ' kg',
        calories: calories + ' kcal',
        goal: goal === 'lose' ? 'Fat Loss' : goal === 'gain' ? 'Muscle Gain' : 'Maintain'
      },
      insights: [
        { icon: '🥩', text: `Protein: ${proteinG}g (${engine.formatNumber(proteinPct, 0)}%) — ${proteinPerKg}g per kg body weight.` },
        { icon: '🍞', text: `Carbs: ${carbG}g (${engine.formatNumber(carbPct, 0)}%) — fuel for training and recovery.` },
        { icon: '🥑', text: `Fat: ${fatG}g (${engine.formatNumber(fatPctActual, 0)}%) — hormones and nutrient absorption.` },
        { icon: '🎯', text: goal === 'lose' ? 'Higher protein supports muscle retention during a calorie deficit.' : goal === 'gain' ? 'Extra carbs support glycogen and muscle growth.' : 'Balanced split for maintenance and performance.' }
      ]
    });

    return { proteinG, carbG, fatG, calories };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: () => '135g protein',
    apply: (d, f) => {
      if (d.weight) setField(f, 'weight', d.weight);
      if (d.calories) setField(f, 'calories', d.calories);
      engine.calculate();
    }
  });

  function setField(f, id, val) {
    const el = f.querySelector('#' + id);
    if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
  }
});
