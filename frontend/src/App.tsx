// Dự án: Hệ thống Hỗ trợ Gán nhãn Dữ liệu (Frontend)
// Công nghệ: React + TypeScript + Vite
// State management: Zustand
// UI: Material UI (MUI)
// API: Axios

// Mô tả:
// Đây là hệ thống quản lý quy trình gán nhãn dữ liệu phục vụ Machine Learning.
// Hệ thống có 4 vai trò:
// - Admin: quản lý người dùng
// - Manager: quản lý dự án, dataset, task
// - Annotator: gán nhãn dữ liệu
// - Reviewer: kiểm duyệt dữ liệu

// Các chức năng chính:
// - Đăng nhập (JWT)
// - Quản lý người dùng
// - Quản lý dự án
// - Upload dataset (ảnh)
// - Phân công task
// - Không gian gán nhãn (Annotation workspace)
// - Kiểm duyệt (Review)
// - Dashboard thống kê

// API base:
// /api/v1

// Xác thực:
// Sử dụng JWT lưu trong localStorage (key: "token")

// API quan trọng:
// Auth:
// POST /auth/login
// GET /auth/me

// Project:
// GET /projects
// POST /projects

// Task:
// GET /tasks
// POST /projects/{projectId}/tasks

// Annotation:
// GET /images/{imageId}/annotations
// POST /annotations

/* Ghi chú:
 - Backend chưa hoàn thành → sử dụng mock API
 - UI sử dụng tiếng Việt
 - Code theo module: api / pages / components / store
 - Sử dụng React hooks + TypeScript 
  Yêu cầu:
 - Toàn bộ text UI phải dùng tiếng Việt
 - Tên biến code dùng tiếng Anh, nhưng label hiển thị dùng tiếng Việt */

/* Tất cả api sẽ sử dụng sau này:
0. BASE CONFIG
Base URL: /api/v1
Auth: Bearer Token (JWT)

🔐 1. AUTH API
POST   /auth/login
POST   /auth/refresh-token
POST   /auth/logout
GET    /auth/me

👤 2. USER (ADMIN)
GET    /users
POST   /users
GET    /users/{id}
PUT    /users/{id}
DELETE /users/{id}              (soft delete)
PATCH  /users/{id}/lock
PATCH  /users/{id}/unlock

📁 3. PROJECT (MANAGER)
GET    /projects
POST   /projects
GET    /projects/{id}
PUT    /projects/{id}
DELETE /projects/{id}           (soft delete)

🧠 4. LABEL
GET    /projects/{projectId}/labels
POST   /projects/{projectId}/labels
PUT    /labels/{id}
DELETE /labels/{id}             (soft delete)

🖼️ 5. DATASET (IMAGE)
POST   /projects/{projectId}/datasets/upload
GET    /projects/{projectId}/datasets
GET    /datasets/{id}
DELETE /datasets/{id}           (soft delete)

📦 6. TASK (QUAN TRỌNG NHẤT)
GET    /tasks
POST   /projects/{projectId}/tasks
GET    /tasks/{id}
PUT    /tasks/{id}
DELETE /tasks/{id}              (soft delete)

PATCH  /tasks/{id}/assign
PATCH  /tasks/{id}/status

✏️ 7. ANNOTATOR API
Task của tôi
GET    /annotator/tasks
GET    /annotator/tasks/{taskId}
Ảnh trong task
GET    /tasks/{taskId}/images
GET    /images/{id}
Lock (tránh conflict)
POST   /images/{id}/lock
POST   /images/{id}/unlock
Annotation
GET    /images/{imageId}/annotations
POST   /annotations
PUT    /annotations/{id}
DELETE /annotations/{id}        (soft delete)
Submit
POST   /tasks/{taskId}/submit

🔍 8. REVIEWER API
GET    /reviewer/tasks
GET    /reviewer/tasks/{taskId}
Review detail
GET    /tasks/{taskId}/review
Approve / Reject
POST   /reviews/{taskId}/approve
POST   /reviews/{taskId}/reject

📊 9. DASHBOARD / REPORT
GET    /projects/{id}/stats
GET    /projects/{id}/progress
GET    /users/{id}/performance

📤 10. EXPORT
GET    /projects/{id}/export
Query:
?format=yolo
?format=coco
?format=json

🤖 11. AI AUTO LABEL
POST   /ai/auto-label

🧾 12. AUDIT LOG
GET    /audit-logs
GET    /audit-logs/{id}
*/

import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;