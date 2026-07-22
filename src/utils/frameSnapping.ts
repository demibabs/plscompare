export function getNearestFrameTime(time: number, allFrameTimes: number[] | undefined) {
  if (!allFrameTimes || allFrameTimes.length === 0) return time;

  let left = 0;
  let right = allFrameTimes.length - 1;
  let ans = allFrameTimes.length;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (allFrameTimes[mid] > time) {
      ans = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  const upperIdx = ans;
  if (upperIdx === 0) return allFrameTimes[0];
  if (upperIdx === allFrameTimes.length) return allFrameTimes[allFrameTimes.length - 1];

  const prev = allFrameTimes[upperIdx - 1];
  const next = allFrameTimes[upperIdx];
  return Math.abs(time - prev) < Math.abs(time - next) ? prev : next;
}

export function getNextFrameTime(time: number, allFrameTimes: number[] | undefined) {
  if (!allFrameTimes || allFrameTimes.length === 0) return time;
  let left = 0;
  let right = allFrameTimes.length - 1;
  let ans = allFrameTimes.length;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (allFrameTimes[mid] > time + 0.001) {
      ans = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return ans < allFrameTimes.length ? allFrameTimes[ans] : allFrameTimes[allFrameTimes.length - 1];
}

export function getPrevFrameTime(time: number, allFrameTimes: number[] | undefined) {
  if (!allFrameTimes || allFrameTimes.length === 0) return time;
  let left = 0;
  let right = allFrameTimes.length - 1;
  let ans = -1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (allFrameTimes[mid] < time - 0.001) {
      ans = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return ans >= 0 ? allFrameTimes[ans] : allFrameTimes[0];
}
