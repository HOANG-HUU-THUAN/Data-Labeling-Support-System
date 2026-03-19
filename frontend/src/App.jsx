import { BrowserRouter, Routes, Route } from 'react-router-dom';
import  MainLayout  from './components/Layout/MainLayout';

function App() {
  
  const userRole = 'Manager'; 

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout role={userRole} />}>
          {/* Route mặc định khi vào trang chủ */}
          <Route index element={
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h1 className="text-2xl font-bold text-gray-800">Chào mừng quay trở lại!</h1>
              <p className="text-gray-600 mt-2">Đây là màn hình Dashboard tổng quan dành cho {userRole}.</p>
            </div>
          } />

          {/* Các Route dành cho Manager */}
          <Route path="projects" element={<div className="text-xl">Trang quản lý dự án gán nhãn</div>} />
          
          {/* Các Route dành cho Annotator */}
          <Route path="tasks" element={<div className="text-xl">Danh sách dữ liệu cần gán nhãn</div>} />
          
          {/* Các Route dành cho Admin */}
          <Route path="users" element={<div className="text-xl">Quản lý danh sách người dùng</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;