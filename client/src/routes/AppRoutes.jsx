import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/landing/Landing.jsx';
import Login from '../pages/auth/Login.jsx';
import Signup from '../pages/auth/Signup.jsx';
import VerifyOtp from '../pages/auth/VerifyOtp.jsx';
import Home from '../pages/user/Home.jsx'
import UserProfile from '../pages/user/UserProfile.jsx';
import ChangePassword from '../pages/auth/ChangePassword.jsx';
import { ProtectedRoute, PublicRoute } from '../auth/ProtectedRoute.jsx';
import Loader from '../components/common/Loader.jsx';
import ForgotPassword from '../pages/auth/ForgotPassword.jsx';
import ResetPassword from '../pages/auth/ResetPassword.jsx';
import GoogleAuthSuccess from '../pages/auth/GoogleAuthSuccess.jsx';
import UserExploreEvent from '../pages/user/UserExploreEvent.jsx';
import UserEventDetails from '../pages/user/UserEventDetails.jsx';
import { COMMON_ROUTES, USER_ROUTES } from '../constants/Routes';

const AppRoutes = () => {
    return (
        <Routes>

            <Route path={USER_ROUTES.HOME} element={
                <ProtectedRoute role="user">
                    <Home />
                </ProtectedRoute>
            } />
            <Route path={USER_ROUTES.PROFILE} element={
                <ProtectedRoute role="user">
                    <UserProfile />
                </ProtectedRoute>
            } />
            <Route path={USER_ROUTES.CHANGE_PASSWORD} element={
                <ProtectedRoute role="user">
                    <ChangePassword />
                </ProtectedRoute>
            } />
            <Route path={USER_ROUTES.EXPLORE} element={
                <ProtectedRoute role="user">
                    <UserExploreEvent />
                </ProtectedRoute>
            } />
            <Route path={USER_ROUTES.EVENT_DETAILS} element={
                <ProtectedRoute role="user">
                    <UserEventDetails />
                </ProtectedRoute>
            } />
            <Route path={COMMON_ROUTES.LANDING} element={
                <PublicRoute>
                    <Landing />
                </PublicRoute>
            } />

            <Route path={COMMON_ROUTES.FORGOT_PASSWORD} element={
                <PublicRoute>
                    <ForgotPassword />
                </PublicRoute>
            } />
            <Route path={COMMON_ROUTES.RESET_PASSWORD} element={
                <PublicRoute>
                    <ResetPassword/>
                </PublicRoute>
            } />

            <Route path={COMMON_ROUTES.LOGIN} element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />
            <Route path={COMMON_ROUTES.SIGNUP} element={
                <PublicRoute>
                    <Signup />
                </PublicRoute>
            } />
            <Route path={COMMON_ROUTES.VERIFY_OTP} element={
                <PublicRoute>
                    <VerifyOtp />
                </PublicRoute>
            } />
            <Route path={COMMON_ROUTES.AUTH_SUCCESS} element={<GoogleAuthSuccess />} />

            <Route path={COMMON_ROUTES.SPINNER} element={<Loader />} />
        </Routes>
    );
};

export default AppRoutes;
