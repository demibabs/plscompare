import { Outlet } from "react-router-dom";
import { Nav } from "./Nav";

export function Layout(){
    return <div>
        <Nav/>
        <main className="min-h-screen flex flex-col items-center">
            <Outlet/>
        </main>
    </div>
}