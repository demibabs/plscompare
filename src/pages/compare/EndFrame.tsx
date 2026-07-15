import { useOutletContext } from "react-router-dom";
import { SideBySideEditor } from "./sideBySideEditor/SideBySideEditor";

export function EndFrame() {
    const { isLoading } = useOutletContext<{ isLoading: boolean }>()
    return !isLoading && <SideBySideEditor part="end"/>
}