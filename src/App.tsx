import { createBrowserRouter, redirect, RouterProvider } from "react-router-dom";
import "./App.css";
import { Landing } from "./landing/Landing";
import { Compare } from "./pages/compare/Compare";
import { StartFrame } from "./pages/compare/StartFrame";
import { EndFrame } from "./pages/compare/EndFrame";
import { Preview } from "./pages/compare/preview/Preview";
import { Layout } from "./pages/layout/Layout";
import { useEffect, useState } from "react";
import { clear } from "idb-keyval";
import { SomethingWentWrong } from "./pages/compare/SomethingWentWrong";
import { ReadMe } from "./pages/read-me/ReadMe";
import { ComparisonTips } from "./pages/read-me/ComparisonTips";
import { NotesFromTheDev } from "./pages/read-me/NotesFromTheDev";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        errorElement: <SomethingWentWrong data="error"></SomethingWentWrong>,
        children: [
          {
            path: "/",
            element: <Landing />,
          },
          {
            path: "/compare",
            element: <Compare />,
            children: [
              {
                index: true,
                loader: () => redirect("start-frame"),
              },
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
            path: "/read-me",
            element: <ReadMe></ReadMe>,
          },
          {
            path: "/read-me/comparison-tips",
            element: <ComparisonTips></ComparisonTips>,
          },
          {
            path: "notes-from-the-dev",
            element: <NotesFromTheDev></NotesFromTheDev>,
          },
          {
            path: "*",
            element: <SomethingWentWrong data="404"></SomethingWentWrong>,
          },
        ],
      },
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
    void checkSession();
  }, []);
  return !isInitializing && <RouterProvider router={router}></RouterProvider>;
}
