import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import LoginPage from "../pages/LoginPage";
import MyTasksPage from "../features/annotator/pages/MyTasksPage";
import AnnotationWorkspacePage from "../features/annotator/pages/AnnotationWorkspacePage";

 />
// wrapper layout
const withLayout = (element: React.ReactNode) => (
  <MainLayout>{element}</MainLayout>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Main */}
      <Route path="/" element={withLayout(<MyTasksPage />)} />

      {/* Task detail */}
      <Route
        path="/task/:id"
        element={withLayout(<AnnotationWorkspacePage />)}
      />
    </Routes>
  );
};

export default AppRoutes;