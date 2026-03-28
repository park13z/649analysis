(() => {
  const KEY = "lotto649_draws_v1";
  const DAY_KEY = "lotto649_auto_day";
  const { sortedUnique, validate, estimate, trend, predictModes, backtest, predictBonus } = window.LottoLogic;
  const { setupInputs, getNums, getBonus, renderHistory, renderStats, renderBonusPick, renderTrend, renderPicks, renderBacktest, setStatus, el } = window.LottoUI;
  const { updateHistory, loadHistoryFile } = window.LottoWebApi;
  const today = () => new Date().toISOString().slice(0, 10);

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
  const save = (draws) => localStorage.setItem(KEY, JSON.stringify(draws));
  const idOf = (d) => `${d.date}|${d.nums.join("-")}|${d.bonus ?? 0}`;

  const mergeUnique = (draws, incoming) => {
    const seen = new Set(draws.map(idOf));
    incoming.forEach((d) => { const k = idOf(d); if (!seen.has(k)) { draws.push(d); seen.add(k); } });
  };

  const syncHistory = async (draws) => {
    try {
      const data = await loadHistoryFile();
      const valid = data.filter((d) => d.date && Array.isArray(d.nums) && d.nums.length === 6)
        .map((d) => ({ date: d.date, nums: d.nums.map(Number), bonus: Number(d.bonus || 0) }));
      mergeUnique(draws, valid); save(draws);
    } catch {}
  };

  const refresh = (draws) => {
    const report = estimate(draws);
    renderHistory(draws); renderStats(draws, report);
    renderBonusPick(predictBonus(draws));
    renderTrend(trend(draws)); renderPicks(predictModes(draws)); renderBacktest(backtest(draws));
  };

  const draws = load();
  setupInputs();

  const init = async () => {
    await syncHistory(draws);
    if (localStorage.getItem(DAY_KEY) !== today()) {
      try {
        await updateHistory();
        localStorage.setItem(DAY_KEY, today());
        await syncHistory(draws);
        setStatus("อัปเดตรายวันอัตโนมัติแล้ว");
      } catch { setStatus("อัปเดตรายวันอัตโนมัติไม่สำเร็จ"); }
    }
    refresh(draws);
  };
  init();

  el("drawForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const date = el("drawDate").value;
    const nums = sortedUnique(getNums());
    const bonus = getBonus();
    const msg = validate(nums);
    if (!date || msg) return alert(msg || "กรุณาเลือกวันที่");
    if (!bonus || bonus < 1 || bonus > 49) return alert("Bonus ต้องเป็นเลข 1-49");
    draws.push({ date, nums, bonus }); save(draws); refresh(draws); e.target.reset();
  });

  el("resetBtn").addEventListener("click", () => {
    if (!confirm("ต้องการล้างข้อมูลทั้งหมดใช่ไหม")) return;
    draws.length = 0; save(draws); refresh(draws);
  });

  el("updateBtn").addEventListener("click", async () => {
    setStatus("กำลังอัปเดตผลย้อนหลัง...");
    try {
      const res = await updateHistory();
      await syncHistory(draws); refresh(draws); setStatus(res.log || "อัปเดตสำเร็จ");
    } catch (e) { setStatus(e.message || "อัปเดตไม่สำเร็จ"); }
  });
})();
