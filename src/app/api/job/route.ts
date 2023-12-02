import { Worker } from "worker_threads";
import { createSSEStream } from "../sse";
import os from "os";

const createWorker = () =>
  new Worker(
    `
const fib = (n) => n < 2 ? n : fib(n-1) + fib(n-2)
while(true) fib(1000)
`,
    { eval: true }
  );

const createWorkers = (numCPUs = 16) => {
  const workers = Array(Math.floor((numCPUs * os.cpus().length) / 2))
    .fill(0)
    .map(createWorker);
  return () => workers.forEach((worker) => worker.terminate());
};

export async function GET(req: Request) {
  const cpus =
    new URLSearchParams(req.url.slice(req.url.indexOf("?"))).get("cpus") ?? 1;
  console.log(req.url, cpus);
  const freeWorkers = createWorkers(+cpus);
  const stream = createSSEStream(
    (send, count) => {
      console.log("...");
      send("message", { count });
    },
    () => {
      freeWorkers();
      console.log("clear");
    }
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

//   const sseStream = createSSEStream();

//   // Set up the stream to send data over time
//   let count = 0;
//   const interval = setInterval(() => {
//     count++;
//     sseStream.send('message', { count });

//     if (count >= 10) {
//       clearInterval(interval);
//       sseStream.send(null); // Close the stream
//     }
//   }, 1000);

//   // Return a response that uses the stream
//   return new Response(sseStream, {
//     headers: {
//       'Content-Type': 'text/event-stream',
//       'Cache-Control': 'no-cache',
//       'Connection': 'keep-alive',
//     },
//   });

//   console.log(arguments)
//   // Set headers for SSE
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");
//   res.flushHeaders();

//   const worker = new Worker(`
// const fib = (n) => n < 2 ? n : fib(n-1) + fib(n-2)
// fib(1000)
// `); // Worker logic here

//   // const interval = setInterval(()=> {
//   //     res.write(`data: ${JSON.stringify(progress)}\n\n`);
//   // }, 300)

//   worker.on("exit", () => {
//     res.end();
//   });

//   // Stop mechanism
//   req.on("close", () => {
//     if (worker) {
//       worker.terminate();
//     }
//   });
// }
