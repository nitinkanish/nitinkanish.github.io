document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="gpa"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });

  engine.onCalculate = (v) => {
    let totalPoints = 0;
    let totalCredits = 0;
    const courses = [];

    for (let i = 1; i <= 4; i++) {
      const grade = engine.parseNumber(v['grade' + i]);
      const credits = engine.parseNumber(v['credits' + i]);
      if (!credits || credits <= 0) continue;
      totalPoints += grade * credits;
      totalCredits += credits;
      courses.push({ grade, credits });
    }

    if (totalCredits === 0) return null;

    const gpa = totalPoints / totalCredits;
    const letter = gpaToLetter(gpa);

    UI.publishDashboard(engine, {
      primary: engine.formatNumber(gpa, 2),
      metrics: [
        letter,
        totalCredits + ' credits',
        courses.length + ' courses'
      ],
      compare: letter + ' (' + engine.formatNumber(gpa, 2) + ')',
      shareBadge: 'GPA ' + engine.formatNumber(gpa, 2),
      shareText: `My GPA is ${engine.formatNumber(gpa, 2)} (${letter}) on ${totalCredits} credits`,
      insights: [
        { icon: '🎓', text: `Weighted GPA: ${engine.formatNumber(gpa, 2)} across ${totalCredits} credit hours.` },
        { icon: '📊', text: `Letter equivalent: ${letter} on the standard 4.0 scale.` },
        { icon: '⭐', text: gpa >= 3.5 ? 'Strong academic standing — competitive for many programs.' : gpa >= 3.0 ? 'Solid performance — room to improve with strong grades.' : 'Focus on high-credit courses to raise GPA fastest.' },
        { icon: '📝', text: `${courses.length} courses included. Add all graded courses for cumulative GPA.` }
      ]
    });

    return { gpa, totalCredits, letter };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: () => 'GPA 3.5',
    apply: (d, f) => {
      for (let i = 1; i <= 4; i++) {
        if (d['grade' + i] !== undefined) setField(f, 'grade' + i, d['grade' + i]);
        if (d['credits' + i] !== undefined) setField(f, 'credits' + i, d['credits' + i]);
      }
      engine.calculate();
    }
  });

  function gpaToLetter(gpa) {
    if (gpa >= 3.85) return 'A';
    if (gpa >= 3.5) return 'A- / B+';
    if (gpa >= 3.0) return 'B';
    if (gpa >= 2.5) return 'B- / C+';
    if (gpa >= 2.0) return 'C';
    if (gpa >= 1.0) return 'D';
    return 'F';
  }

  function setField(f, id, val) {
    const el = f.querySelector('#' + id);
    if (el) { el.value = val; el.dispatchEvent(new Event('change', { bubbles: true })); }
  }
});
