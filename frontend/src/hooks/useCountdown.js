import { useEffect, useState } from "react";

const useCountdown = (initial = 60, autoStart = false) => {
  const [seconds, setSeconds] = useState(initial);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    if (!isRunning || seconds <= 0) return;
    const id = setInterval(() => setSeconds((prev) => prev - 1), 1000);
    return () => clearInterval(id);
  }, [isRunning, seconds]);

  const reset = (value = initial) => {
    setSeconds(value);
    setIsRunning(false);
  };

  return {
    seconds,
    isRunning,
    setIsRunning,
    reset
  };
};

export default useCountdown;
