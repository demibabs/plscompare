export function getShortenedVideoTimestampOffsets(startPacketTimestamp: number, minimumRetainedTimestamp: number) {
  if (!Number.isFinite(startPacketTimestamp) || !Number.isFinite(minimumRetainedTimestamp)) {
    throw new Error("Cannot map timestamps for an empty or invalid packet range.");
  }

  return {
    // Leading B-frames can have presentation timestamps before the random-access
    // packet, so the muxer needs the minimum retained PTS as its timestamp origin.
    muxTimestampOffset: minimumRetainedTimestamp,
    // FFmpeg starts decoding at the random-access packet and treats that point as
    // seek time zero, even when earlier-presented leading pictures are retained.
    sourceTimeOffset: startPacketTimestamp,
  };
}

export async function getOpenGopSafeEndPacket<Packet>(
  endKeyPacket: Packet,
  getNextKeyPacket: (packet: Packet) => Promise<Packet | null>,
): Promise<Packet | undefined> {
  const followingKeyPacket = await getNextKeyPacket(endKeyPacket);
  if (!followingKeyPacket) return undefined;

  // In an open GOP, pictures presented before followingKeyPacket can occur after
  // it in decode order. The exclusive boundary must therefore be the next key.
  return (await getNextKeyPacket(followingKeyPacket)) ?? undefined;
}
