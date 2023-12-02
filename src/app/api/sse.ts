export function createSSEStream(
  action: (send: (event: string, data: any) => void, count: number) => void,
  clear: ()=>void
) {
  let controller: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(c) {
      console.log(c);
      controller = c;
    },
    cancel() {
      controller = null;
    },
  });
  let count = 0;
  const interval = setInterval(() => {
    count++;
    if (!controller) {
      clearInterval(interval)
      clear()
      return;
    }
    const ctr = controller;
    action((event, data) => {
      ctr.enqueue(`event: ${event}\n`);
      ctr.enqueue(`data: ${JSON.stringify(data)}\n\n`);
    }, count);
  }, 1000);

  return stream;
}
