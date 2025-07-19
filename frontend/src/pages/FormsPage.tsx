import React, { useEffect, useState } from "react";
import { Table, message, Modal, Tag, Space, Button, Card, Input } from "antd";
import { Eye, Edit, Trash2, Plus, PieChart } from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const fetchWithToken = async (url: string, options: any = {}) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };
    return fetch(url, { ...options, headers });
};

interface Form {
    id: string;
    title: string;
    status: string;
    lastModified: string;
}

export default function FormsPage() {
    const navigate = useNavigate();
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(false);
    const [deletingForm, setDeletingForm] = useState<Form | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const fetchForms = async () => {
        setLoading(true);
        try {
            const res = await fetchWithToken("http://localhost:8080/api/forms/available");
            if (!res.ok) throw new Error("Unauthorized or fetch failed");
            const data = await res.json();
            // Map backend response to Form[]
            const forms = (data.forms || []).map((f: any) => ({
                id: f.id.toString(),
                title: f.title,
                status: f.isGroupForm ? "Group" : "Personal",
                lastModified: f.createdAt,
            }));
            setForms(forms);
        } catch (err) {
            message.error("Failed to fetch forms");
            navigate("/login", { replace: true });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForms();
    }, []);

    const handleView = (id: string) => navigate(`/forms/${id}`);
    const handleEdit = (id: string) => navigate(`/forms/new/${id}`);
    const handleReport = (id: string) => navigate(`/reports/${id}`);
    const handleNewForm = () => navigate("/forms/new");

    const showDeleteModal = (form: Form) => {
        setDeletingForm(form);
        setModalVisible(true);
        setConfirmTitle('');
        setDeleteError('');
    };

    const handleDelete = async () => {
        if (!deletingForm) return;
        if (confirmTitle !== deletingForm.title) {
            setDeleteError('Title does not match');
            return;
        }

        try {
            const res = await fetchWithToken(`http://localhost:3000/api/forms/${deletingForm.id}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Delete failed");
            setForms(forms.filter(f => f.id !== deletingForm.id));
            message.success("Form deleted");
            setModalVisible(false);
        } catch {
            message.error("Delete failed");
        }
    };

    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (text: string, record: Form) => (
                <a onClick={() => handleView(record.id)} className="text-indigo-600 hover:text-indigo-800">
                    {text || `Form ${record.id}`}
                </a>
            )
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => <Tag color={status === "Active" ? "green" : "default"}>{status}</Tag>
        },
        {
            title: "Last Modified",
            dataIndex: "lastModified",
            key: "lastModified",
            render: (date: string) => moment(date).format("YYYY-MM-DD")
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: Form) => (
                <Space>
                    <Button type="text" icon={<Eye size={16} />} onClick={() => handleView(record.id)} />
                    <Button type="text" icon={<Edit size={16} />} onClick={() => handleEdit(record.id)} />
                    <Button type="text" icon={<PieChart size={16} />} onClick={() => handleReport(record.id)} />
                    <Button type="text" danger icon={<Trash2 size={16} />} onClick={() => showDeleteModal(record)} />
                </Space>
            )
        }
    ];

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
            <Card
                title="Forms"
                extra={
                    <Button type="primary" icon={<Plus size={16} />} onClick={handleNewForm}>
                        Create New Form
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={forms}
                    rowKey="id"
                    pagination={false}
                    loading={loading}
                    scroll={{ x: "max-content" }}
                />
            </Card>

            <Modal
                open={modalVisible}
                title="Delete Form"
                onOk={handleDelete}
                onCancel={() => {
                    setModalVisible(false);
                    setDeletingForm(null);
                    setConfirmTitle("");
                    setDeleteError("");
                }}
                okText="Confirm"
                cancelText="Cancel"
            >
                <p>Type the form title to confirm deletion:</p>
                <Input
                    value={confirmTitle}
                    onChange={(e) => {
                        setConfirmTitle(e.target.value);
                        setDeleteError("");
                    }}
                    placeholder="Enter form title"
                    status={deleteError ? "error" : ""}
                />
                {deleteError && <div className="text-red-500 mt-1 text-sm">{deleteError}</div>}
            </Modal>
        </div>
    );
}
