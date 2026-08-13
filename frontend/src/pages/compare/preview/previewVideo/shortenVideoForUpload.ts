import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  EncodedPacketSink,
  EncodedVideoPacketSource,
  Input,
  Mp4OutputFormat,
  Output,
} from "mediabunny";

type TimeRange = {
  start: number;
  end: number;
};

export type ShortenedVideo = {
  file: File;
  sourceTimeOffset: number;
};

const keyPacketOptions = { verifyKeyPackets: true } as const;

function shortenedFileName(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  const baseName = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
  return `${baseName}.upload.mp4`;
}

/**
 * Copies the selected GOPs into a new MP4 without decoding or encoding any frames.
 * The returned offset maps timestamps in the original file to the shortened file.
 */
export async function shortenVideoForUpload(
  file: File,
  times: TimeRange,
  signal?: AbortSignal,
): Promise<ShortenedVideo> {
  if (!Number.isFinite(times.start) || !Number.isFinite(times.end) || times.start < 0 || times.end <= times.start) {
    throw new Error(`Invalid export range for ${file.name}.`);
  }

  signal?.throwIfAborted();

  const input = new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(file),
  });
  let output: Output<Mp4OutputFormat, BufferTarget> | null = null;

  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track) throw new Error(`${file.name} does not contain a video track.`);

    const codec = await track.getCodec();
    if (!codec) throw new Error(`${file.name} uses an unsupported video codec.`);

    const sink = new EncodedPacketSink(track);
    const startPacket =
      (await sink.getKeyPacket(times.start, keyPacketOptions)) ?? (await sink.getFirstKeyPacket(keyPacketOptions));
    if (!startPacket) throw new Error(`${file.name} does not contain a usable keyframe.`);

    const endKeyPacket = await sink.getKeyPacket(times.end, keyPacketOptions);
    if (!endKeyPacket) throw new Error(`The selected range is outside ${file.name}.`);

    // The end packet is exclusive, so selecting the following keyframe retains
    // every dependency required to decode the requested final frame.
    const endPacket = (await sink.getNextKeyPacket(endKeyPacket, keyPacketOptions)) ?? undefined;

    // A GOP can begin with decode-order packets whose presentation timestamps
    // precede the keyframe (B-frames). Use the lowest retained PTS as timestamp 0.
    let sourceTimeOffset = Infinity;
    for await (const packet of sink.packets(startPacket, endPacket, { metadataOnly: true })) {
      signal?.throwIfAborted();
      sourceTimeOffset = Math.min(sourceTimeOffset, packet.timestamp);
    }
    if (!Number.isFinite(sourceTimeOffset)) {
      throw new Error(`The selected range in ${file.name} does not contain video frames.`);
    }

    const [decoderConfig, rotation] = await Promise.all([track.getDecoderConfig(), track.getRotation()]);
    const target = new BufferTarget();
    output = new Output({
      // This file is immediately uploaded, so a trailing moov atom is fine and
      // avoids an additional in-memory copy of all encoded packets.
      format: new Mp4OutputFormat({ fastStart: false }),
      target,
    });
    const source = new EncodedVideoPacketSource(codec);
    output.addVideoTrack(source, { rotation });
    await output.start();

    let isFirstPacket = true;
    for await (const packet of sink.packets(startPacket, endPacket, keyPacketOptions)) {
      signal?.throwIfAborted();
      await source.add(
        packet.clone({ timestamp: packet.timestamp - sourceTimeOffset }),
        isFirstPacket ? { decoderConfig: decoderConfig ?? undefined } : undefined,
      );
      isFirstPacket = false;
    }

    source.close();
    await output.finalize();
    if (!target.buffer) throw new Error(`Failed to create the shortened copy of ${file.name}.`);

    return {
      file: new File([target.buffer], shortenedFileName(file.name), {
        type: "video/mp4",
        lastModified: file.lastModified,
      }),
      sourceTimeOffset,
    };
  } catch (error: unknown) {
    if (output && output.state !== "canceled" && output.state !== "finalized") {
      await output.cancel();
    }
    throw error;
  } finally {
    input.dispose();
  }
}
