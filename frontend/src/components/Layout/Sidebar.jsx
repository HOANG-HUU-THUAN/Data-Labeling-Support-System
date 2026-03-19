import { LayoutDashboard, Database, ClipboardList, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = ({ role }) => {
  // Menu hiển thị tùy theo Role
  const menuItems = {
    Admin: [
      { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
      { name: 'Người dùng', icon: <Users size={20} />, path: '/users' },
      { name: 'Cấu hình', icon: <Settings size={20} />, path: '/settings' },
    ],
    Manager: [
      { name: 'Dự án', icon: <Database size={20} />, path: '/projects' },
      { name: 'Tiến độ', icon: <LayoutDashboard size={20} />, path: '/' },
    ],
    Annotator: [
      { name: 'Nhiệm vụ', icon: <ClipboardList size={20} />, path: '/tasks' },
      { name: 'Hướng dẫn', icon: <Settings size={20} />, path: '/guide' },
    ],
  };

  const currentMenu = menuItems[role] || [];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white p-4 flex flex-col">
      <div className="text-xl font-bold mb-8 text-blue-400 px-2">LABEL SYSTEM</div>
      <nav className="flex-1 space-y-2">
        {currentMenu.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition text-gray-300 hover:text-white"
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t border-slate-700 pt-4">
        <div className="text-xs text-gray-500 px-2 uppercase font-semibold">Quyền: {role}</div>
      </div>
    </div>
  );
};

export default Sidebar;