import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import { Landing } from './landing/Landing'
import { Compare } from './pages/compare/Compare'
import { FirstFrame } from './pages/compare/FirstFrame'
import { LastFrame } from './pages/compare/LastFrame'
import { Preview } from './pages/compare/Preview'
import { Layout } from './pages/Layout/Layout'

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
          path: "first-frame",
          element: <FirstFrame />
        },
        {
          path: "last-frame",
          element: <LastFrame />
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
