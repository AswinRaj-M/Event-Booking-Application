import React from 'react';
import AppRoutes from './routes/AppRoutes';
import AdminRoutes from './routes/AdminRoutes';
import { Routes, Route} from 'react-router-dom';
function App() {
  return (
    <Routes>
      <Route path="/*" element={<AppRoutes />}/>
      <Route path="/admin/*" element={<AdminRoutes/>}/>
    </Routes>
  );
}

export default App;
