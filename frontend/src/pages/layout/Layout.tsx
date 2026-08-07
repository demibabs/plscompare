import { Outlet } from "react-router-dom";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function Layout(){
    return <div className="w-full min-h-dvh flex flex-col">
        <Nav/>
        <main className="grow flex flex-col items-center overflow-x-hidden">
            <Outlet/>
        </main>
        <Footer/>
    </div>
}