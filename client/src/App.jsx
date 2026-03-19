import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import AdminRoutes from './routes/AdminRoutes';
import VendorRoutes from './routes/vendorRoutes';
import { Toaster } from "sonner";
import { Routes, Route} from 'react-router-dom';
import { checkUserAuthThunk } from './features/user.slice.js';
import { checkAdminAuthThunk } from './features/admin.slice.js';
import { checkVendorAuthThunk } from './features/vendorSlice.js';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      dispatch(checkAdminAuthThunk());
    } else if (location.pathname.startsWith('/vendor')) {
      dispatch(checkVendorAuthThunk());
    } else {
      dispatch(checkUserAuthThunk());
    }
  }, [dispatch]);

  return (
    <>
      <Toaster position="bottom-center" theme='dark'
      toastOptions={{style: {
            background: "#0B0914",
            border: "1px solid #6d28d9",
            color: "#ffffff"
          }
        }}
 />
    <Routes>
      <Route path="/*" element={<AppRoutes />}/>
      <Route path="/admin/*" element={<AdminRoutes/>}/>
      <Route path='/vendor/*' element={<VendorRoutes/>}/>
    </Routes>
    </>
  );
}

export default App;
