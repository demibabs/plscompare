import { useOutletContext } from "react-router-dom";
import { SideBySideEditor } from "./sideBySideEditor/SideBySideEditor";

export function StartFrame() {
    const { isLoading } = useOutletContext<{ isLoading: boolean }>()
    return !isLoading && <SideBySideEditor part="start"/>
}