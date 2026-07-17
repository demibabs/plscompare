import { useOutletContext } from "react-router-dom";
import { SideBySideEditor, type VideoData } from "./sideBySideEditor/SideBySideEditor";
import { SomethingWentWrong } from "./SomethingWentWrong";

export function EndFrame() {
  const { videosData, isLoading } = useOutletContext<{ videosData: VideoData[]; isLoading: boolean }>();
  if (!videosData || videosData.some((vData) => vData.times.start === null)) {
    return <SomethingWentWrong data="start"></SomethingWentWrong>;
  }
  return !isLoading && <SideBySideEditor part="end" />;
}
