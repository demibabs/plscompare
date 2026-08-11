import { createBrowserRouter, redirect, RouterProvider } from "react-router-dom";
import { Landing } from "./pages/landing/Landing";
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
import { TechnicalNotes } from "./pages/read-me/TechnicalNotes";
import { Acknowledgements } from "./pages/read-me/Acknowledgements";

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
            path: "/read-me/technical-notes",
            element: <TechnicalNotes></TechnicalNotes>,
          },
          {
            path: "/read-me/acknowledgements",
            element: <Acknowledgements></Acknowledgements>,
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
  return <RouterProvider router={router}></RouterProvider>;
}
