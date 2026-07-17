import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { Landing } from "./landing/Landing";
import { Compare } from "./pages/compare/Compare";
import { StartFrame } from "./pages/compare/StartFrame";
import { EndFrame } from "./pages/compare/EndFrame";
import { Preview } from "./pages/compare/preview/Preview";
import { Layout } from "./pages/layout/Layout";
import { useEffect, useState } from "react";
import { clear, get } from "idb-keyval";
import type { FileData } from "./pages/compare/sideBySideEditor/SideBySideEditor";
import { SomethingWentWrong } from "./pages/compare/SomethingWentWrong";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Landing />,
        errorElement: <SomethingWentWrong data="error"></SomethingWentWrong>
      },
      {
        path: "/compare",
        element: <Compare />,
        children: [
          {
            path: "start-frame",
            element: <StartFrame />,
          },
          {
            path: "end-frame",
            element: <EndFrame />,
          },
          {
            path: "preview",
            element: <Preview />,
          },
        ],
      },
      {
        path:"*",
        element: <SomethingWentWrong data="404"></SomethingWentWrong>
      }
    ],
  },
]);

export function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const isExistingSession = sessionStorage.getItem("videos_session");
      if (!isExistingSession) {
        await clear();
        sessionStorage.setItem("videos_session", "true");
      }
      setIsInitializing(false);
    }
    checkSession();
  }, []);
  return !isInitializing && <RouterProvider router={router}></RouterProvider>;
}
