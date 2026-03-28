import csv
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

url = "https://www.olg.ca/en/lottery/play-lotto-649-encore/past-results.html"
options = Options()
options.add_argument("--headless")
driver = webdriver.Chrome(options=options)
driver.get(url)
time.sleep(5)
rows = driver.find_elements(By.CSS_SELECTOR, "table.results-table tbody tr")
results = []
for row in rows:
    try:
        date = row.find_element(By.CSS_SELECTOR, "td.results-table__date").text.strip()
        nums = row.find_element(By.CSS_SELECTOR, "td.results-table__numbers").text.strip()
        nums = [int(n) for n in nums.replace("\n", " ").replace("-", " ").split() if n.isdigit()]
        if len(nums) == 6:
            results.append({"date": date, "nums": nums})
    except Exception:
        continue
driver.quit()
# Save as CSV
with open("lotto649_results.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["date", "n1", "n2", "n3", "n4", "n5", "n6"])
    for r in results:
        writer.writerow([r["date"]] + r["nums"])
# Save as JSON
import json
with open("lotto649_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print(f"Saved {len(results)} results to lotto649_results.csv and lotto649_results.json")
