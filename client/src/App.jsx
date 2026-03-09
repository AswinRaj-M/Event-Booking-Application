import React from 'react';
import AppRoutes from './routes/AppRoutes';
import AdminRoutes from './routes/AdminRoutes';
import VendorRoutes from './routes/vendorRoutes';
import { Toaster } from "sonner";
import { Routes, Route} from 'react-router-dom';

function App() {
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
