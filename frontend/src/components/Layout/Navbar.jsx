const Navbar = ({ role }) => {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
      <div className="text-sm text-gray-500 font-medium">
        Hệ thống hỗ trợ gán nhãn dữ liệu
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-bold text-gray-700">User Name</p>
          <p className="text-xs text-blue-600 font-medium">{role}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          {role[0]}
        </div>
      </div>
    </header>
  );
};

export default Navbar;