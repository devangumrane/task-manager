import Bree from "bree";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const bree = new Bree({
  root: path.join(__dirname, "workers"),
  jobs: [
    { name: "taskReminderWorker", interval: "1m" },
    { name: "recurringTaskWorker", interval: "1m" }
  ]
});

export default bree;
