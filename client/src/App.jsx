import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import AdminRoutes from './routes/AdminRoutes';
import VendorRoutes from './routes/vendorRoutes';
import { ROUTES } from './constants/routes';
import { Toaster } from "sonner";
import { Routes, Route} from 'react-router-dom';
import { checkUserAuthThunk } from './features/user.slice.js';
import { checkAdminAuthThunk } from './features/admin.slice.js';
import { checkVendorAuthThunk } from './features/vendorSlice.js';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const isRootAdmin = location.pathname.startsWith(ROUTES.ADMIN_ROOT);
    const isRootVendor = location.pathname.startsWith(ROUTES.VENDOR_ROOT);

    if (isRootAdmin) {
      dispatch(checkAdminAuthThunk());
    } else if (isRootVendor) {
      dispatch(checkVendorAuthThunk());
    } else {
      dispatch(checkUserAuthThunk());
    }
  }, [dispatch, location.pathname]);

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
      <Route path={`${ROUTES.ADMIN_ROOT}/*`} element={<AdminRoutes/>}/>
      <Route path={`${ROUTES.VENDOR_ROOT}/*`} element={<VendorRoutes/>}/>
    </Routes>
    </>
  );
}

export default App;
