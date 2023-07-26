import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from './Auth';
import { MainHeader } from '../Components/Header';
import { Footer } from '../Components/Footer';

// If a user has not logged in, redirect to login
export const PrivateRoute = ({ children }: any)  => {
    const authCtx = useContext(AuthContext);
    return authCtx.isLoggedIn ? <><MainHeader /> {children} <Footer /></> : <Navigate to="/login" />;
}

// if a user has logged in and tries to go to login, redirect to home page
export const LoginRoute = ({ children }: any) => {
    const authCtx = useContext(AuthContext);
    return authCtx.isLoggedIn ? <Navigate to="/" /> : <>{children}</>; 
}