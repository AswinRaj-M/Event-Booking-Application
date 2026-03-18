import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/landing/Landing.jsx';
import Login from '../pages/auth/Login.jsx';
import Signup from '../pages/auth/Signup.jsx';
import VerifyOtp from '../pages/auth/VerifyOtp.jsx';
import Home from '../pages/home.jsx'
import { ProtectedRoute, PublicRoute } from '../auth/ProtectedRoute.jsx';
import Loader from '../components/common/Loader.jsx';

const AppRoutes = () => {
    return (
        <Routes>

            <Route path='/home' element={
                <ProtectedRoute role="user">
                    <Home />
                </ProtectedRoute>
            } />
            <Route path="/" element={
                <PublicRoute>
                    <Landing />
                </PublicRoute>
            } />

            <Route path="/login" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />
            <Route path="/signup" element={
                <PublicRoute>
                    <Signup />
                </PublicRoute>
            } />
            <Route path="/verify-otp" element={
                <PublicRoute>
                    <VerifyOtp />
                </PublicRoute>
            } />

            <Route path="/spinner" element={<Loader />} />
        </Routes>
    );
};

export default AppRoutes;
