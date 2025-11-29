import type { ReactNode } from 'react';
import Home from './pages/Home';
import Browse from './pages/Browse';
import AnimeDetail from './pages/AnimeDetail';
import Watch from './pages/Watch';
import Watchlist from './pages/Watchlist';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />
  },
  {
    name: 'Browse',
    path: '/browse',
    element: <Browse />
  },
  {
    name: 'Watchlist',
    path: '/watchlist',
    element: <Watchlist />
  },
  {
    name: 'Anime Detail',
    path: '/anime/:id',
    element: <AnimeDetail />,
    visible: false
  },
  {
    name: 'Watch',
    path: '/watch/:episodeId',
    element: <Watch />,
    visible: false
  },
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    visible: false
  },
  {
    name: 'Signup',
    path: '/signup',
    element: <Signup />,
    visible: false
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <Admin />,
    visible: false
  },
  {
    name: 'Not Found',
    path: '*',
    element: <NotFound />,
    visible: false
  }
];

export default routes;