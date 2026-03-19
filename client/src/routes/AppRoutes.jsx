import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/landing/Landing.jsx';
import Login from '../pages/auth/Login.jsx';
import Signup from '../pages/auth/Signup.jsx';
import VerifyOtp from '../pages/auth/VerifyOtp.jsx';
import Home from '../pages/home.jsx'
import { ProtectedRoute, PublicRoute } from '../auth/ProtectedRoute.jsx';
import Loader from '../components/common/Loader.jsx';
import ForgotPassword from '../pages/auth/ForgotPassword.jsx';
import ResetPassword from '../pages/auth/ResetPassword.jsx';
import { ROUTES } from '../constants/routes';

const AppRoutes = () => {
    return (
        <Routes>

            <Route path={ROUTES.HOME} element={
                <ProtectedRoute role="user">
                    <Home />
                </ProtectedRoute>
            } />
            <Route path={ROUTES.FORGOT_PASSWORD} element={
                <PublicRoute>
                     <ForgotPassword/>
                </PublicRoute>
            } />
                <Route path={ROUTES.RESET_PASSWORD} element={
                <PublicRoute>
                     <ResetPassword/>
                </PublicRoute>
            } />
            <Route path={ROUTES.LANDING} element={
                <PublicRoute>
                    <Landing />
                </PublicRoute>
            } />

            <Route path={ROUTES.LOGIN} element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />
            <Route path={ROUTES.SIGNUP} element={
                <PublicRoute>
                    <Signup />
                </PublicRoute>
            } />
            <Route path={ROUTES.VERIFY_OTP} element={
                <PublicRoute>
                    <VerifyOtp />
                </PublicRoute>
            } />

            <Route path={ROUTES.SPINNER} element={<Loader />} />
        </Routes>
    );
};

export default AppRoutes;
