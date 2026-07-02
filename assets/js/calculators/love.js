document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="love"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });

  engine.onCalculate = (v) => {
    const rawA = (v.name1 || '').trim();
    const rawB = (v.name2 || '').trim();
    if (!rawA || !rawB) return null;

    const a = normalize(rawA);
    const b = normalize(rawB);
    if (!a || !b) return null;

    const letterScore = letterOverlapScore(a, b);
    const seqScore = sequenceScore(a, b);
    const vowelScore = vowelHarmony(a, b);
    const hashScore = deterministicHash(rawA + '|' + rawB) % 21;

    let score = Math.round(letterScore * 0.5 + seqScore * 0.3 + vowelScore * 0.1 + hashScore * 0.1);
    score = Math.max(0, Math.min(100, score));

    const band = bandFor(score);

    UI.publishDashboard(engine, {
      primary: score,
      primaryFormat: 'number',
      decimals: 0,
      metrics: [
        band.label,
        engine.formatNumber(letterScore, 0) + '% overlap',
        band.vibe
      ],
      compare: score + '% compatibility',
      shareBadge: score + '% ♥',
      shareText: `${rawA} + ${rawB} = ${score}% compatibility (${band.label})`,
      insights: [
        { icon: '💞', text: `${rawA} + ${rawB} = ${score}% (${band.label}).` },
        { icon: '🔤', text: `Name overlap score: ${engine.formatNumber(letterScore, 0)}% · Sequence score: ${engine.formatNumber(seqScore, 0)}%.` },
        { icon: '✨', text: band.message },
        { icon: 'ℹ️', text: 'Entertainment only — real relationships depend on trust, communication, and respect.' }
      ]
    });

    return { score, band: band.label };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: (d) => {
      if (!d.name1 || !d.name2) return '—';
      const s = quickScore(d.name1, d.name2);
      return s + '%';
    },
    apply: (d, f) => {
      setVal(f, 'name1', d.name1);
      setVal(f, 'name2', d.name2);
      engine.calculate();
    }
  });

  function normalize(name) {
    return String(name).toLowerCase().replace(/[^a-z]/g, '');
  }

  function countMap(s) {
    const m = {};
    for (const ch of s) m[ch] = (m[ch] || 0) + 1;
    return m;
  }

  function letterOverlapScore(a, b) {
    const am = countMap(a);
    const bm = countMap(b);
    let common = 0;
    Object.keys(am).forEach((k) => {
      if (bm[k]) common += Math.min(am[k], bm[k]);
    });
    return (common / Math.max(a.length, b.length)) * 100;
  }

  function sequenceScore(a, b) {
    const minLen = Math.min(a.length, b.length);
    if (minLen === 0) return 0;
    let matches = 0;
    for (let i = 0; i < minLen; i++) {
      if (a[i] === b[i]) matches++;
    }
    return (matches / minLen) * 100;
  }

  function vowelHarmony(a, b) {
    const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
    const av = [...a].filter((c) => vowels.has(c)).length;
    const bv = [...b].filter((c) => vowels.has(c)).length;
    const maxv = Math.max(1, av + bv);
    return 100 - (Math.abs(av - bv) / maxv) * 100;
  }

  function deterministicHash(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return Math.abs(h >>> 0);
  }

  function bandFor(score) {
    if (score >= 75) return { label: 'Strong Match', vibe: 'High spark', message: 'Playful chemistry looks strong — keep the good communication going.' };
    if (score >= 60) return { label: 'Warm Match', vibe: 'Good balance', message: 'A balanced connection with room for fun and growth.' };
    if (score >= 25) return { label: 'Mixed Match', vibe: 'Curious energy', message: 'Interesting mix — learn more about each other beyond the score.' };
    return { label: 'Low Match', vibe: 'Early spark', message: 'Treat it lightly. Real compatibility is built through shared effort.' };
  }

  function quickScore(name1, name2) {
    const a = normalize(name1);
    const b = normalize(name2);
    if (!a || !b) return 0;
    const letterScore = letterOverlapScore(a, b);
    const seqScore = sequenceScore(a, b);
    const vowelScore = vowelHarmony(a, b);
    const hashScore = deterministicHash(name1 + '|' + name2) % 21;
    return Math.max(0, Math.min(100, Math.round(letterScore * 0.5 + seqScore * 0.3 + vowelScore * 0.1 + hashScore * 0.1)));
  }

  function setVal(f, id, val) {
    const el = f.querySelector('#' + id);
    if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
  }
});
