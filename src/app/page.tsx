"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [publicIP, setPublicIP] = useState("");
  const [cpu, setCpu] = useState("");
  const [[source, nb], setSource] = useState<[EventSource | null, number]>([
    null,
    0,
  ]);

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => setPublicIP(data.ip));
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("/api/cpu");
    eventSource.onmessage = function (event) {
      console.log("event.data");
      setCpu(event.data);
    };
    eventSource.onopen = function () {
      console.log("..............");
    };
    eventSource.onerror = function (er) {
      console.log("..............", er);
    };
    return () => eventSource.close();
  }, []);

  const setCPUTo = (n: number) => {
    source?.close();
    setSource([n ? new EventSource(`/api/job?cpus=${n}`) : null, n]);
  };

  const increment = () => setCPUTo(nb + 1);
  const decrement = () => setCPUTo(nb - 1);

  return (
    <div>
      <h1>Your Public IP: {publicIP}</h1>
      {cpu} %
      <div className="workers">
        <button onClick={decrement} disabled={!nb}>
          -
        </button>
        {nb}
        <button onClick={increment}>+</button>
      </div>
    </div>
  );
}
