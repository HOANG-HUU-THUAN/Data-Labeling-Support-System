<<<<<<< HEAD
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
=======
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
>>>>>>> 435e17add2b797d95c507200ca4f75349278c692
