import type { AuditLog, AuditLogFilters } from '../types/auditLog';

const LOGS: AuditLog[] = [
  { id: 1,  user: 'Admin',     action: 'LOGIN',    entity: 'AUTH',       entityId: 1, detail: 'Đăng nhập thành công.',                              createdAt: '2026-04-01T08:00:00.000Z' },
  { id: 2,  user: 'Admin',     action: 'CREATE',   entity: 'USER',       entityId: 5, detail: 'Tạo tài khoản mới: annotator2@gmail.com.',           createdAt: '2026-04-01T08:05:00.000Z' },
  { id: 3,  user: 'Manager',   action: 'LOGIN',    entity: 'AUTH',       entityId: 2, detail: 'Đăng nhập thành công.',                              createdAt: '2026-04-01T08:10:00.000Z' },
  { id: 4,  user: 'Manager',   action: 'CREATE',   entity: 'PROJECT',    entityId: 1, detail: 'Tạo dự án: Project A.',                              createdAt: '2026-04-01T08:15:00.000Z' },
  { id: 5,  user: 'Manager',   action: 'CREATE',   entity: 'TASK',       entityId: 1, detail: 'Tạo task: Gán nhãn ảnh batch 1.',                   createdAt: '2026-04-01T08:20:00.000Z' },
  { id: 6,  user: 'Annotator', action: 'LOGIN',    entity: 'AUTH',       entityId: 3, detail: 'Đăng nhập thành công.',                              createdAt: '2026-04-01T09:00:00.000Z' },
  { id: 7,  user: 'Annotator', action: 'UPDATE',   entity: 'ANNOTATION', entityId: 1, detail: 'Cập nhật annotation cho ảnh #1.',                   createdAt: '2026-04-01T09:10:00.000Z' },
  { id: 8,  user: 'Reviewer',  action: 'APPROVE',  entity: 'TASK',       entityId: 4, detail: 'Duyệt task: Gán nhãn ảnh batch 4.',                 createdAt: '2026-04-01T10:00:00.000Z' },
  { id: 9,  user: 'Reviewer',  action: 'REJECT',   entity: 'TASK',       entityId: 5, detail: 'Từ chối task: Gán nhãn ảnh batch 5. Lý do: Sai nhãn.', createdAt: '2026-04-01T10:15:00.000Z' },
  { id: 10, user: 'Admin',     action: 'LOCK',     entity: 'USER',       entityId: 5, detail: 'Khóa tài khoản: annotator2@gmail.com.',             createdAt: '2026-04-02T08:00:00.000Z' },
  { id: 11, user: 'Admin',     action: 'UNLOCK',   entity: 'USER',       entityId: 5, detail: 'Mở khóa tài khoản: annotator2@gmail.com.',          createdAt: '2026-04-02T09:00:00.000Z' },
  { id: 12, user: 'Manager',   action: 'UPDATE',   entity: 'PROJECT',    entityId: 1, detail: 'Cập nhật dự án: thay đổi mô tả Project A.',         createdAt: '2026-04-02T10:00:00.000Z' },
  { id: 13, user: 'Manager',   action: 'DELETE',   entity: 'TASK',       entityId: 3, detail: 'Xóa task: Gán nhãn ảnh batch 3.',                   createdAt: '2026-04-03T08:30:00.000Z' },
  { id: 14, user: 'Manager',   action: 'EXPORT',   entity: 'PROJECT',    entityId: 1, detail: 'Xuất dữ liệu dự án Project A (định dạng JSON).',    createdAt: '2026-04-03T09:00:00.000Z' },
  { id: 15, user: 'Annotator', action: 'LOGOUT',   entity: 'AUTH',       entityId: 3, detail: 'Đăng xuất.',                                         createdAt: '2026-04-03T17:00:00.000Z' },
];

export const getAuditLogs = (filters?: AuditLogFilters): Promise<AuditLog[]> =>
  new Promise((resolve) =>
    setTimeout(() => {
      let result = [...LOGS];

      if (filters?.user) {
        const q = filters.user.toLowerCase();
        result = result.filter((l) => l.user.toLowerCase().includes(q));
      }

      if (filters?.action) {
        const q = filters.action.toUpperCase();
        result = result.filter((l) => l.action === q);
      }

      if (filters?.from) {
        const from = new Date(filters.from).getTime();
        result = result.filter((l) => new Date(l.createdAt).getTime() >= from);
      }

      if (filters?.to) {
        // include the full "to" day
        const to = new Date(filters.to);
        to.setHours(23, 59, 59, 999);
        result = result.filter((l) => new Date(l.createdAt).getTime() <= to.getTime());
      }

      resolve(result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, 300),
  );

export const getAuditLogById = (id: number): Promise<AuditLog | null> =>
  new Promise((resolve) =>
    setTimeout(() => resolve(LOGS.find((l) => l.id === id) ?? null), 300),
  );
