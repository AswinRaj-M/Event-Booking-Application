import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/landing/Landing.jsx';
import Login from '../pages/auth/Login.jsx';
import Signup from '../pages/auth/Signup.jsx';
import VerifyOtp from '../pages/auth/VerifyOtp.jsx';
import Home from '../pages/user/Home.jsx'
import UserProfile from '../pages/user/UserProfile.jsx';
import { ProtectedRoute, PublicRoute } from '../auth/ProtectedRoute.jsx';
import Loader from '../components/common/Loader.jsx';
import ForgotPassword from '../pages/auth/ForgotPassword.jsx';
import ResetPassword from '../pages/auth/ResetPassword.jsx';
import GoogleAuthSuccess from '../pages/auth/GoogleAuthSuccess.jsx';
import UserExploreEvent from '../pages/user/UserExploreEvent.jsx';

const AppRoutes = () => {
    return (
        <Routes>

            <Route path='/user/home' element={
                <ProtectedRoute role="user">
                    <Home />
                </ProtectedRoute>
            } />
            <Route path='/user/profile' element={
                <ProtectedRoute role="user">
                    <UserProfile />
                </ProtectedRoute>
            } />
            <Route path='/user/explore' element={
                <ProtectedRoute role="user">
                    <UserExploreEvent />
                </ProtectedRoute>
            } />
            <Route path="/" element={
                <PublicRoute>
                    <Landing />
                </PublicRoute>
            } />

            <Route path="/forgot-password" element={
                <PublicRoute>
                    <ForgotPassword />
                </PublicRoute>
            } />
            <Route path="/reset-password/:resetToken" element={
                <PublicRoute>
                    <ResetPassword/>
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
            <Route path="/auth/success" element={<GoogleAuthSuccess />} />

            <Route path="/spinner" element={<Loader />} />
        </Routes>
    );
};

export default AppRoutes;
