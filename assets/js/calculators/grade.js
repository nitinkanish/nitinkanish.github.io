document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="grade"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });

  engine.onCalculate = (v) => {
    let total = 0;
    let weightSum = 0;
    for (let i = 1; i <= 4; i++) {
      const score = engine.parseNumber(v['score' + i]);
      const weight = engine.parseNumber(v['weight' + i]);
      if (!weight || weight <= 0) continue;
      total += score * weight;
      weightSum += weight;
    }
    if (weightSum === 0) return null;
    const grade = total / weightSum;
    const letter = letterGrade(grade);

    UI.publishDashboard(engine, {
      primary: engine.formatNumber(grade, 1) + '%',
      metrics: [letter, weightSum + '% weight', grade >= 60 ? 'Passing' : 'Below 60%'],
      compare: letter + ' (' + engine.formatNumber(grade, 1) + '%)',
      shareBadge: engine.formatNumber(grade, 1) + '% grade',
      shareText: `My weighted course grade is ${engine.formatNumber(grade, 1)}% (${letter})`,
      insights: [
        { icon: '📚', text: `Weighted average: ${engine.formatNumber(grade, 1)}% across ${weightSum}% of categories.` },
        { icon: '🎯', text: `Letter equivalent: ${letter}.` },
        { icon: '⚖️', text: weightSum !== 100 ? `Weights sum to ${weightSum}% — ideally use 100%.` : 'Weights total 100% — complete course breakdown.' },
        { icon: '💡', text: grade >= 90 ? 'Excellent work!' : grade >= 80 ? 'Solid performance — keep it up.' : 'Focus on highest-weight categories to improve.' }
      ]
    });
    return { grade, letter };
  };

  engine.init();
  engine.calculate();

  function letterGrade(pct) {
    if (pct >= 97) return 'A+';
    if (pct >= 93) return 'A';
    if (pct >= 90) return 'A−';
    if (pct >= 87) return 'B+';
    if (pct >= 83) return 'B';
    if (pct >= 80) return 'B−';
    if (pct >= 77) return 'C+';
    if (pct >= 73) return 'C';
    if (pct >= 70) return 'C−';
    if (pct >= 60) return 'D';
    return 'F';
  }
});
