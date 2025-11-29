import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { ScrollToTop } from '@/components/auth/ScrollToTop';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/common/Header';
import routes from './routes';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Toaster />
        <RequireAuth whiteList={['/login', '/signup', '/', '/browse', '/anime/*', '/admin', '/admin-login']}>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                {routes.map((route, index) => (
                  <Route
                    key={index}
                    path={route.path}
                    element={route.element}
                  />
                ))}
              </Routes>
            </main>
          </div>
        </RequireAuth>
      </AuthProvider>
    </Router>
  );
};

export default App;
