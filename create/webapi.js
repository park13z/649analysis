window.LottoWebApi = (() => {
  const updateHistory = async () => {
    const res = await fetch("/api/update-history", { method: "POST" });
    if (!res.ok) throw new Error("เรียกอัปเดตไม่สำเร็จ");
    return res.json();
  };
  const loadHistoryFile = async () => {
    const res = await fetch("data/lotto649_history.json", { cache: "no-store" });
    if (!res.ok) throw new Error("โหลดไฟล์ย้อนหลังไม่สำเร็จ");
    return res.json();
  };
  return { updateHistory, loadHistoryFile };
})();
