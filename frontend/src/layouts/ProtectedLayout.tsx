import React, { useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { Home, FileText, List, Users, User, LogOut } from "lucide-react";

const { Sider, Content } = Layout;

const fetchWithToken = async (url: string, options: any = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };
  return fetch(url, { ...options, headers });
};

export default function ProtectedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) {
        setIsAuthenticated(false);
        navigate("/login");
        return;
      }
      try {
        const response = await fetch(`http://localhost:8080/api/user-managements/${userId}`);
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          navigate("/login");
        }
      } catch (err) {
        setIsAuthenticated(false);
        navigate("/login");
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) return <div className="text-center p-6">Loading...</div>;
  if (!isAuthenticated) return null;

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <Home />, path: "/" },
    { key: "forms", label: "Forms", icon: <FileText />, path: "/forms" },
    { key: "submissions", label: "Submissions", icon: <List />, path: "/submitted-forms" },
    { key: "groups", label: "Groups", icon: <Users />, path: "/groups" },
    { key: "profile", label: "Profile", icon: <User />, path: "/profile" },
    {
      key: "logout",
      label: "Logout",
      icon: <LogOut />,
      onClick: () => {
        localStorage.removeItem("token");
        navigate("/login");
      },
    },
  ];

  const getSelectedKey = () => {
    if (location.pathname.startsWith("/forms")) return "forms";
    if (location.pathname.startsWith("/submitted-forms")) return "submissions";
    if (location.pathname.startsWith("/groups")) return "groups";
    if (location.pathname.startsWith("/profile")) return "profile";
    if (location.pathname === "/") return "dashboard";
    return "";
  };
  
  const selectedKey = getSelectedKey();
  

  return (
    <Layout className="min-h-screen">
      <Sider width={220} className="bg-white shadow-md">
        <Menu
          mode="inline"
          selectedKeys={[selectedKey || "dashboard"]}
          onClick={({ key }) => {
            const item = menuItems.find(i => i.key === key);
            if (item?.onClick) item.onClick();
            else if (item?.path) navigate(item.path);
          }}
          items={menuItems.map(({ key, icon, label }) => ({
            key,
            icon,
            label,
          }))}
        />
      </Sider>
      <Layout>
        <Content className="p-4 sm:p-6 bg-gray-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
