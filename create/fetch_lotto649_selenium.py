from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
import csv
import json

url = "https://www.welovelotto.com/lottery-results/canada-lotto-649/draw-history"
options = Options()
options.add_argument("--headless")
driver = webdriver.Chrome(options=options)
driver.get(url)
time.sleep(5)
results = []
rows = driver.find_elements(By.TAG_NAME, "tr")
for row in rows:
    cols = row.find_elements(By.TAG_NAME, "td")
    if len(cols) >= 3:
        date = cols[1].text.strip()
        nums = cols[2].text.strip()
        nums = [int(n) for n in nums.replace("-", " ").split() if n.isdigit()]
        if len(nums) == 6:
            results.append({"date": date, "nums": nums})
driver.quit()
with open("lotto649_results_selenium.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["date", "n1", "n2", "n3", "n4", "n5", "n6"])
    for r in results:
        writer.writerow([r["date"]] + r["nums"])
with open("lotto649_results_selenium.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print(f"Saved {len(results)} results to lotto649_results_selenium.csv and lotto649_results_selenium.json")
