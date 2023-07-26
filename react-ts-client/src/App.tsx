import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PrivateRoute, LoginRoute } from "./Providers/AuthRoutes"
import { Login } from "./screens/Login";
import { FullLED } from './screens/Visualize';
import { About } from "./screens/About";
import { CMS } from './screens/CMS';

// TODO: if screen size is not above certain threshold, show page saying site only available on desktop

export const App = () => {

  return (
    <Router>
      <Routes>

        {/* Login */}
        {/* If Logged in, navigates to home page directly */}
        <Route path="/login" element={
        <LoginRoute>
          <Login />
        </LoginRoute>
        } />

        {/* Visualize Page for Viewing Configs */}
        <Route path="/visualize" element={
          <PrivateRoute>
            <FullLED />
          </PrivateRoute>
          } />

        {/* About Page */}
        <Route path="/" element={
          <PrivateRoute>
            <About />
          </PrivateRoute>
          } />


        {/* CMS */}
        <Route path="/CMS" element={
          <PrivateRoute>
            <CMS />
          </PrivateRoute>
          } />

      </Routes>
    </Router>
  );

};


