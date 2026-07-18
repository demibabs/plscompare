import { Outlet } from "react-router-dom";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function Layout(){
    return <div className="max-w-lvw min-h-dvh flex flex-col">
        <Nav/>
        <main className="grow flex flex-col items-center">
            <Outlet/>
        </main>
        <Footer/>
    </div>
}