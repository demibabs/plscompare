import { Input, BlobSource, MP4, QTFF, MATROSKA, WEBM, MPEG_TS, HLS } from 'mediabunny';

export async function checkIsSupportedVideo(file: File): Promise<boolean> {
  // 1. Only include container singletons that can hold video tracks
  const videoContainers = [MP4, QTFF, MATROSKA, WEBM, MPEG_TS, HLS];

  const input = new Input({
    source: new BlobSource(file),
    formats: videoContainers 
  });

  // 2. Verify if the container structure is readable
  const isReadableContainer = await input.canRead();
  if (!isReadableContainer) {
    return false;
  }

  // 3. Confirm that a video track actually exists inside the container
  try {
    const videoTrack = await input.getPrimaryVideoTrack();
    return videoTrack !== null;
  } catch {
    // Fails if it's an audio-only file using a shared container (e.g., an .m4a file)
    return false;
  } finally {
    input.dispose()
  }
}
