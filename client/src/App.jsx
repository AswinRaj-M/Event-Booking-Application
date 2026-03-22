import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, Routes, Route } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import AdminRoutes from './routes/AdminRoutes';
import VendorRoutes from './routes/VendorRoutes';
import { ROUTES } from './constants/routes';
import { Toaster } from "sonner";
import { checkUserAuthThunk } from './features/user.slice.js';
import { checkAdminAuthThunk } from './features/admin.slice.js';
import { checkVendorAuthThunk } from './features/vendorSlice.js';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  
  const userState = useSelector((state) => state.user);
  const vendorState = useSelector((state) => state.vendor);
  const adminState = useSelector((state) => state.admin);

  useEffect(() => {
    // Check Admin Auth
    if (!adminState.authChecked && !adminState.loading) {
      dispatch(checkAdminAuthThunk());
    }

    // Check Vendor Auth
    if (!vendorState.authChecked && !vendorState.loading) {
      dispatch(checkVendorAuthThunk());
    }

    // Check User Auth
    if (!userState.authChecked && !userState.loading) {
      dispatch(checkUserAuthThunk());
    }
  }, [dispatch, adminState.authChecked, vendorState.authChecked, userState.authChecked, adminState.loading, vendorState.loading, userState.loading]);

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
      <Route path={`${ROUTES.ADMIN_ROOT}/*`} element={<AdminRoutes/>}/>
      <Route path={`${ROUTES.VENDOR_ROOT}/*`} element={<VendorRoutes/>}/>
      <Route path="/*" element={<AppRoutes />}/>
    </Routes>
    </>
  );
}

export default App;
