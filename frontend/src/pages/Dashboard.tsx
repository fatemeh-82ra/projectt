import React, { useState, useEffect } from "react";
import { Layout, Menu, Spin, message } from "antd";
import { FileText, Users, List, User } from "lucide-react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

const { Sider, Content } = Layout;

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Determine selected menu based on current path
    const getSelectedMenu = () => {
        if (location.pathname.startsWith("/forms")) return "forms";
        if (location.pathname.startsWith("/submitted-forms")) return "submissions";
        if (location.pathname.startsWith("/groups")) return "groups";
        if (location.pathname.startsWith("/profile")) return "profile";
        return "";
    };

    const [selectedMenu, setSelectedMenu] = useState(getSelectedMenu());

    // Menu items
    const menuItems = [
        {
            key: "forms",
            icon: <FileText size={18} />,
            label: "Forms",
            onClick: () => {
                setSelectedMenu("forms");
                navigate("/forms");
            },
        },
        {
            key: "submissions",
            icon: <List size={18} />,
            label: "Submissions",
            onClick: () => {
                setSelectedMenu("submissions");
                navigate("/submitted-forms");
            },
        },
        {
            key: "groups",
            icon: <Users size={18} />,
            label: "Groups",
            onClick: () => {
                setSelectedMenu("groups");
                navigate("/groups");
            },
        },
        {
            key: "profile",
            icon: <User size={18} />,
            label: "Profile",
            onClick: () => {
                setSelectedMenu("profile");
                navigate("/profile");
            },
        },
    ];

    useEffect(() => {
        setSelectedMenu(getSelectedMenu());
    }, [location.pathname]);

    // Fetch user profile on mount
    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            navigate("/login");
            return;
        }
        setLoading(true);
        fetch(`http://localhost:8080/api/user-managements/${userId}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch profile");
                return res.json();
            })
            .then(data => setProfile(data))
            .catch(() => {
                message.error("Failed to load profile");
                setProfile(null);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <Layout className="h-full">
            <Sider width={220} className="bg-white shadow-md hidden md:block">
                <div
                    className="text-xl font-bold text-center py-6 cursor-pointer"
                    onClick={() => navigate("/")}
                >
                    Dashboard
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[selectedMenu]}
                    items={menuItems}
                    style={{ borderRight: 0 }}
                />
            </Sider>
            <Layout className="">
                <Content className="p-4 md:p-8">
                    {location.pathname === "/" ? (
                        loading ? (
                            <Spin size="large" />
                        ) : profile ? (
                            <div className="text-2xl font-semibold">
                                Welcome, {profile.name || profile.username || "User"}!<br />
                                <span className="text-base font-normal text-gray-600">Email: {profile.email}</span>
                            </div>
                        ) : (
                            <div className="text-2xl font-semibold">Welcome, User!</div>
                        )
                    ) : (
                        <Outlet />
                    )}
                </Content>
            </Layout>
            {/* Bottom Navigation for Mobile View */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-md flex justify-around p-2 border-t">
                {menuItems.map((item) => (
                    <div
                        key={item.key}
                        className={`flex flex-col items-center cursor-pointer ${
                            selectedMenu === item.key ? "text-blue-500" : "text-gray-500"
                        }`}
                        onClick={item.onClick}
                    >
                        {item.icon}
                        <span className="text-xs">{item.label}</span>
                    </div>
                ))}
            </div>
        </Layout>
    );
}
