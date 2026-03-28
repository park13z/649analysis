window.LottoChart = (() => {
  const drawFreq = (canvasId, freq) => {
    const c = document.getElementById(canvasId);
    if (!c || !c.getContext) return;
    const ctx = c.getContext("2d");
    const w = c.width = c.clientWidth || 900;
    const h = c.height = 160;
    ctx.clearRect(0, 0, w, h);
    const data = freq.slice(1);
    const max = Math.max(...data, 1);
    const bw = w / data.length;
    data.forEach((v, i) => {
      const bh = (v / max) * (h - 22);
      const x = i * bw + 1;
      const y = h - bh - 13;
      const gr = ctx.createLinearGradient(x, y, x, h - 13);
      gr.addColorStop(0, i % 2 ? "#f59e0b" : "#ef4444");
      gr.addColorStop(1, i % 2 ? "rgba(245,158,11,.1)" : "rgba(239,68,68,.1)");
      ctx.fillStyle = gr;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, Math.max(bw - 2, 1), bh, 3);
      else ctx.rect(x, y, Math.max(bw - 2, 1), bh);
      ctx.fill();
      if ((i + 1) % 7 === 0) {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "10px 'Segoe UI'";
        ctx.fillText(String(i + 1), x + 1, h - 2);
      }
    });
  };
  return { drawFreq };
})();
