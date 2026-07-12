import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import { Landing } from './landing/Landing'
import { Compare } from './pages/compare/Compare'
import { StartFrame } from './pages/compare/StartFrame'
import { EndFrame } from './pages/compare/EndFrame'
import { Preview } from './pages/compare/preview/Preview'
import { Layout } from './pages/layout/Layout'

const router = createBrowserRouter([
  {
    element: <Layout/>,
    children: [{
      path: "/",
      element: <Landing />
    },
    {
      path: "/compare",
      element: <Compare />,
      children: [
        {
          path: "start-frame",
          element: <StartFrame />
        },
        {
          path: "end-frame",
          element: <EndFrame />
        },
        {
          path: "preview",
          element: <Preview />
        }
      ]
    }]
  }
])

export function App() {
  return <RouterProvider router={router}></RouterProvider>
}
