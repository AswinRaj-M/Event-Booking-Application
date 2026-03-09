    import { Routes, Route } from 'react-router-dom';
    import Landing from '../pages/landing/Landing.jsx';
    import Login from '../pages/auth/Login.jsx';
    import Signup from '../pages/auth/Signup.jsx';
    import VerifyOtp from '../pages/auth/VerifyOtp.jsx';
    import Home from '../pages/home.jsx'
    import ProtectedRoute from '../auth/ProtectedRoute.jsx';
    import Loader from '../components/common/Loader.jsx';

    const AppRoutes = () => {
        return (
            <Routes>
                
                <Route path='/home' element={<Home/>}/>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/spinner" element={<Loader/>}/>
            </Routes>
        );
    };

    export default AppRoutes;
