import { Outlet } from "react-router-dom";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function Layout(){
    return <div className="max-w-lvw">
        <Nav/>
        <main className="min-h-172 flex flex-col items-center">
            <Outlet/>
        </main>
        <Footer/>
    </div>
}