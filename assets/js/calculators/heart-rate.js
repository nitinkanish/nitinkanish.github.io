document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="heart-rate"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });
  const zonesPanel = document.getElementById('tz-zones-output');

  const zones = [
    { name: 'Zone 1 — Warm Up', pct: [50, 60], color: '#94A3B8' },
    { name: 'Zone 2 — Fat Burn', pct: [60, 70], color: '#22C55E' },
    { name: 'Zone 3 — Cardio', pct: [70, 80], color: '#EAB308' },
    { name: 'Zone 4 — Hard', pct: [80, 90], color: '#F97316' },
    { name: 'Zone 5 — Maximum', pct: [90, 100], color: '#EF4444' }
  ];

  engine.onCalculate = (v) => {
    const age = engine.parseNumber(v.age);
    const resting = engine.parseNumber(v.resting_hr) || 60;
    if (!age) return null;

    const maxHR = 220 - age;
    const useKarvonen = resting > 40;
    const reserve = maxHR - resting;

    const zoneData = zones.map((z) => {
      const lo = useKarvonen
        ? Math.round(reserve * (z.pct[0] / 100) + resting)
        : Math.round(maxHR * (z.pct[0] / 100));
      const hi = useKarvonen
        ? Math.round(reserve * (z.pct[1] / 100) + resting)
        : Math.round(maxHR * (z.pct[1] / 100));
      return { ...z, lo, hi };
    });

    if (zonesPanel) {
      zonesPanel.hidden = false;
      zonesPanel.innerHTML = '<h3 class="hr-zones-title">Your training zones</h3>' +
        zoneData.map((z) =>
          `<div class="hr-zone-row" style="--zone-color:${z.color}">
            <span class="hr-zone-name">${z.name}</span>
            <span class="hr-zone-range">${z.lo}–${z.hi} bpm</span>
            <span class="hr-zone-pct">${z.pct[0]}–${z.pct[1]}%</span>
          </div>`
        ).join('');
    }

    UI.publishDashboard(engine, {
      primary: maxHR + ' bpm',
      metrics: [
        zoneData[1].lo + '–' + zoneData[1].hi + ' fat burn',
        zoneData[2].lo + '–' + zoneData[2].hi + ' cardio',
        resting + ' resting'
      ],
      compare: maxHR + ' bpm max',
      shareBadge: 'Max HR ' + maxHR,
      shareText: `My max heart rate is ${maxHR} bpm (age ${age})`,
      timeline: zoneData.map((z) => ({
        label: z.name.replace(' — ', ': '),
        balance: z.lo + '–' + z.hi + ' bpm',
        growth: z.pct[0] + '–' + z.pct[1] + '% max',
        milestone: '❤️'
      })),
      insights: [
        { icon: '❤️', text: `Estimated max HR: ${maxHR} bpm (220 − ${age}).` },
        { icon: '🔥', text: `Fat-burn zone (Z2): ${zoneData[1].lo}–${zoneData[1].hi} bpm.` },
        { icon: '🏃', text: `Cardio zone (Z3): ${zoneData[2].lo}–${zoneData[2].hi} bpm.` },
        { icon: '⚕️', text: 'Consult a doctor before high-intensity training if you have heart conditions.' }
      ]
    });
    return { maxHR, zoneData };
  };

  engine.init();
  engine.calculate();
});
