window.LottoLogic = (() => {
  const MAX = 49;
  const allNums = () => Array.from({ length: MAX }, (_, i) => i + 1);

  const sortedUnique = (nums) => [...new Set(nums)].sort((a, b) => a - b);

  const validate = (nums) => {
    if (nums.length !== 6) return "ต้องกรอก 6 ตัวเลข";
    if (new Set(nums).size !== 6) return "ตัวเลขห้ามซ้ำ";
    if (nums.some((n) => !Number.isInteger(n) || n < 1 || n > MAX)) {
      return "ต้องเป็นเลข 1-49 เท่านั้น";
    }
    return "";
  };

  const countFreq = (draws) => {
    const freq = Array(MAX + 1).fill(0);
    draws.forEach((d) => d.nums.forEach((n) => (freq[n] += 1)));
    return freq;
  };

  const estimate = (draws) => {
    const freq = countFreq(draws);
    const totalSlots = Math.max(draws.length * 6, 1);
    const odds = freq.map((c) => c / totalSlots);
    const top = allNums()
      .sort((a, b) => odds[b] - odds[a])
      .slice(0, 6);
    return { freq, odds, top };
  };

  const rankByFreq = (draws, asc = false) => {
    const freq = countFreq(draws);
    return allNums().sort((a, b) => (asc ? freq[a] - freq[b] : freq[b] - freq[a]));
  };

  const trend = (draws, win = [30, 60, 90]) => win.map((w) => ({
    label: `${w} งวด`, top: rankByFreq(draws.slice(-w)).slice(0, 6),
  }));

  const predictSets = (draws) => {
    const hot = rankByFreq(draws).slice(0, 6);
    const cold = rankByFreq(draws, true).slice(0, 6);
    const f = countFreq(draws);
    const mid = allNums().sort((a, b) => Math.abs(f[a] - f[25]) - Math.abs(f[b] - f[25]));
    const balanced = sortedUnique([...hot.slice(0, 3), ...mid.slice(0, 3)]).slice(0, 6);
    const score = (set) => set.reduce((s, n) => s + f[n], 0);
    return { hot, cold, balanced, score };
  };

  const pickOddEven = (draws) => {
    const r = rankByFreq(draws);
    const odd = r.filter((n) => n % 2).slice(0, 3);
    const even = r.filter((n) => n % 2 === 0).slice(0, 3);
    return sortedUnique([...odd, ...even]);
  };

  const pickSpread = (draws) => {
    const r = rankByFreq(draws);
    const a = r.filter((n) => n <= 16).slice(0, 2);
    const b = r.filter((n) => n >= 17 && n <= 33).slice(0, 2);
    const c = r.filter((n) => n >= 34).slice(0, 2);
    return sortedUnique([...a, ...b, ...c]);
  };

  const predictModes = (draws) => {
    const p = predictSets(draws);
    return { ...p, oddEven: pickOddEven(draws), spread: pickSpread(draws) };
  };

  const backtest = (draws, lookback = 120) => {
    const names = ["hot", "cold", "balanced", "oddEven", "spread"];
    const base = Object.fromEntries(names.map((k) => [k, { sum: 0, best: 0, rounds: 0 }]));
    const start = Math.max(1, draws.length - lookback - 1);
    for (let i = start; i < draws.length - 1; i += 1) {
      const model = predictModes(draws.slice(0, i + 1));
      const next = new Set(draws[i + 1].nums);
      names.forEach((k) => {
        const hit = model[k].filter((n) => next.has(n)).length;
        base[k].sum += hit; base[k].best = Math.max(base[k].best, hit); base[k].rounds += 1;
      });
    }
    return names.map((k) => ({ mode: k, avg: (base[k].sum / Math.max(base[k].rounds, 1)).toFixed(2), best: base[k].best }));
  };

  const predictBonus = (draws) => {
    const freq = Array(MAX + 1).fill(0);
    draws.forEach((d) => { if (d.bonus) freq[d.bonus] += 1; });
    return allNums().sort((a, b) => freq[b] - freq[a]).slice(0, 5);
  };

  return { sortedUnique, validate, estimate, trend, predictSets, predictModes, backtest, predictBonus };
})();
