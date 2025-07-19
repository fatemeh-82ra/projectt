import React, { useEffect, useState } from "react";
import { Table, Tag, message, Button, Modal } from "antd";
import { Trash2 } from "lucide-react";
import { mockApi } from "../api/mockApi";

interface Submission {
    id: string;
    formTitle: string;
    submittedAt: string;
    status: string;
}

export default function MySubmissionsPage() {
    const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
    const currentUserId = Number(localStorage.getItem("userId"));

    useEffect(() => {
        fetchMySubmissions();
    }, [currentUserId]);

    const fetchMySubmissions = () => {
        setLoading(true);
        mockApi
            .getMySubmissions(currentUserId)
            .then(setMySubmissions)
            .catch(() => message.error("Failed to load submissions"))
            .finally(() => setLoading(false));
    };

    const handleDeleteClick = (submissionId: string) => {
        setSelectedSubmissionId(submissionId);
        setModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (!selectedSubmissionId) return;
        mockApi
            .deleteMySubmission(selectedSubmissionId)
            .then(() => {
                setMySubmissions((prev) => prev.filter((sub) => sub.id !== selectedSubmissionId));
                message.success("Submission deleted successfully");
            })
            .catch(() => message.error("Deletion failed"))
            .finally(() => {
                setModalVisible(false);
                setSelectedSubmissionId(null);
            });
    };

    const columns = [
        { title: "Form Title", dataIndex: "formTitle", key: "formTitle" },
        { title: "Submitted At", dataIndex: "submittedAt", key: "submittedAt" },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                const color =
                    status === "Removed by Owner"
                        ? "red"
                        : status === "Accepted"
                            ? "green"
                            : "default";
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: Submission) => (
                <Button
                    danger
                    icon={<Trash2 size={16} />}
                    onClick={() => handleDeleteClick(record.id)}
                >
                    Delete
                </Button>
            ),
        },
    ];

    return (
        <>
            <Table
                dataSource={mySubmissions}
                columns={columns}
                rowKey="id"
                loading={loading}
            />

            <Modal
                open={modalVisible}
                title="Confirm Deletion"
                onOk={handleConfirmDelete}
                onCancel={() => setModalVisible(false)}
                okText="Confirm"
                cancelText="Cancel"
            >
                Are you sure you want to delete this submission?
            </Modal>
        </>
    );
}
