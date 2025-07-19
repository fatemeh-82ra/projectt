import React, { useEffect, useState } from "react";
import { Card, List, Button, Spin, message, Input, Modal, Avatar, Space, Typography, Form } from "antd";
import { FileTextOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchWithToken } from "../api/fetchWithToken";

const { Title, Text } = Typography;

interface UserProfile {
    name: string;
    email: string;
}

interface AccessibleForm {
    id: string;
    title: string;
    status: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [forms, setForms] = useState<AccessibleForm[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingForms, setLoadingForms] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form] = Form.useForm();
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [confirmEmail, setConfirmEmail] = useState("");
    const navigate = useNavigate();

    const currentUserId = Number(localStorage.getItem("userId"));

    useEffect(() => {
        fetchUserProfile();
        fetchAccessibleForms();
    }, []);

    const fetchUserProfile = async () => {
        setLoadingProfile(true);
        try {
            const response = await fetchWithToken('http://localhost:3000/api/profile');
            if (!response.ok) throw new Error('Failed to fetch profile');
            const data = await response.json();
            setUser(data);
            form.setFieldsValue(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            message.error('Failed to load profile');
        } finally {
            setLoadingProfile(false);
        }
    };

    const fetchAccessibleForms = async () => {
        setLoadingForms(true);
        try {
            const response = await fetchWithToken('http://localhost:3000/api/user/forms');
            if (!response.ok) throw new Error('Failed to fetch accessible forms');
            const data = await response.json();
            setForms(data);
        } catch (error) {
            console.error('Error fetching accessible forms:', error);
            message.error('Failed to load accessible forms');
        } finally {
            setLoadingForms(false);
        }
    };

    const handleUpdateProfile = async (values: UserProfile) => {
        setLoadingProfile(true);
        try {
            const response = await fetchWithToken('http://localhost:3000/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!response.ok) throw new Error('Failed to update profile');
            
            const data = await response.json();
            setUser(data);
            setEditing(false);
            message.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            message.error('Failed to update profile');
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleDeleteAccount = () => {
        if (confirmEmail !== user?.email) {
            message.error("Email does not match");
            return;
        }
        fetchWithToken('http://localhost:3000/api/user', {
            method: 'DELETE',
        })
            .then(() => {
                message.success("Account deleted successfully");
                localStorage.removeItem("userId");
                navigate("/login");
            })
            .catch(() => message.error("Account deletion failed"));
    };

    if (loadingProfile || loadingForms) {
        return <Spin size="large" className="w-full flex justify-center" />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Space direction="vertical" size="large" className="w-full">
                <Card className="shadow-lg rounded-lg">
                    <Space direction="vertical" size="large" className="w-full">
                        <Title level={3} className="text-center">User Profile</Title>
                        
                        {loadingProfile ? (
                            <Spin tip="Loading profile...">
                                <div style={{ height: 200 }} />
                            </Spin>
                        ) : user ? (
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleUpdateProfile}
                                initialValues={user}
                            >
                                <Form.Item
                                    label="Name"
                                    name="name"
                                    rules={[{ required: true, message: 'Please enter your name!' }]}
                                >
                                    <Input prefix={<UserOutlined />} disabled={!editing} />
                                </Form.Item>

                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}
                                >
                                    <Input prefix={<MailOutlined />} disabled />
                                </Form.Item>

                                {editing ? (
                                    <Form.Item>
                                        <Space>
                                            <Button type="primary" htmlType="submit" loading={loadingProfile}>
                                                Save
                                            </Button>
                                            <Button onClick={() => setEditing(false)}>
                                                Cancel
                                            </Button>
                                        </Space>
                                    </Form.Item>
                                ) : (
                                    <Button type="primary" onClick={() => setEditing(true)}>
                                        Edit Profile
                                    </Button>
                                )}
                            </Form>
                        ) : (
                            <Text type="danger">Failed to load user profile.</Text>
                        )}
                    </Space>
                </Card>

                <Card title="My Available Forms" className="shadow-lg rounded-lg">
                    {loadingForms ? (
                        <Spin tip="Loading forms...">
                            <div style={{ height: 100 }} />
                        </Spin>
                    ) : forms.length > 0 ? (
                        <List
                            itemLayout="horizontal"
                            dataSource={forms}
                            renderItem={formItem => (
                                <List.Item
                                    actions={[
                                        <Button
                                            type="link"
                                            onClick={() => window.location.href = `http://localhost:5173/forms/${formItem.id}`}
                                            icon={<FileTextOutlined />}
                                        >
                                            Fill Form
                                        </Button>,
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={formItem.title}
                                        description={`Status: ${formItem.status}`}
                                    />
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Text>No available forms found.</Text>
                    )}
                </Card>

                <Modal
                    open={deleteModalVisible}
                    title="Confirm Account Deletion"
                    onOk={handleDeleteAccount}
                    onCancel={() => setDeleteModalVisible(false)}
                    okText="Confirm"
                    cancelText="Cancel"
                >
                    <p>Please type your email ({user?.email}) to confirm deletion:</p>
                    <Input
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                    />
                </Modal>
            </Space>
        </div>
    );
}

