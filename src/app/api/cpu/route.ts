import os from "os";
import { createSSEStream } from "../sse";

type CPU = {
  idle: number;
  total: number;
};

const getCPUInfo = () => {
  const cpus = os.cpus();
  let user = 0;
  let nice = 0;
  let sys = 0;
  let idle = 0;
  let irq = 0;
  let total = 0;

  for (let cpu of cpus) {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  }

  total += user + nice + sys + idle + irq;

  return { idle, total };
};

const calculateDiff = (start: CPU, end: CPU) => {
  const idleDifference = end.idle - start.idle;
  const totalDifference = end.total - start.total;
  const percentageCPU =
    100 - Math.floor((100 * idleDifference) / totalDifference);
  return percentageCPU;
};

export async function GET(req: Request) {
  console.log(req.url)

  let start = getCPUInfo();
  const stream = createSSEStream(
    (send) => {
      const end = getCPUInfo();
      const diff = calculateDiff(start, end);
      console.log({diff})
      send("message", diff);
      start = end;
    },
    () => {}
  );


  // Return a response that uses the stream
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
