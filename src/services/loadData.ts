import * as fs from "fs";
import path from "path";

export async function loadData() {
  const file = fs.readFileSync(
    path.resolve(__dirname, "../../../mock/mock_ae.txt"),
    "utf-8"
  );
  const data: Object[] = [];
  file.split("\n").map((line) => {
    if (!line.startsWith("#") && line !== "") {
      const [date, time, c1, c2, rms] = line.trim().split(/\s+/);
      data.push({
        timestamp: date + " " + time,
        c1: parseFloat(c1),
        c2: parseFloat(c2),
        rms: parseFloat(rms),
      });
    }
  });
  console.log(data);
}
