import { useOutletContext } from "react-router-dom";
import { SideBySideEditor, type VideoData } from "./sideBySideEditor/SideBySideEditor";
import { SomethingWentWrong } from "./SomethingWentWrong";

export function EndFrame() {
  const { videosData } = useOutletContext<{ videosData: VideoData[]; }>();
  if (videosData.some((vData) => vData.times.start === null)) {
    return <SomethingWentWrong data="start"></SomethingWentWrong>;
  }
  return <SideBySideEditor part="end" />;
}
