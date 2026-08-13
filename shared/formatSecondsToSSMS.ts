export function formatSecondsToSSMS(totalSeconds: number) {
  const clampedSeconds = Math.max(0, totalSeconds);
  const wholeSeconds = Math.floor(clampedSeconds);
  const milliseconds = Math.floor((clampedSeconds - wholeSeconds) * 1000);

  const ss = String(wholeSeconds).padStart(2, "0");
  const ms = String(milliseconds).padStart(3, "0");

  return `${ss}.${ms}`;
}
