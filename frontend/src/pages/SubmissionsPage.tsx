import React, {useEffect, useState} from "react";
import {Table, Button, Modal, message, Tag} from "antd";
import {Trash2} from "lucide-react";
import {useParams} from "react-router-dom";
import {mockApi} from "../api/mockApi";

interface Submission {
    id: string;
    submitterName: string;
    submittedAt: string;
    status?: string; // For showing "Removed by Owner"
}

export default function SubmissionsPage() {
    const {formId} = useParams();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

    useEffect(() => {
        fetchSubmissions();
    }, [formId]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const data = await mockApi.getFormSubmissions(formId!);
            setSubmissions(data);
        } catch (error) {
            message.error("Failed to load submissions");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (submissionId: string) => {
        setSelectedSubmissionId(submissionId);
        setModalVisible(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedSubmissionId) return;
        try {
            await mockApi.deleteSubmission(formId!, selectedSubmissionId);
            setSubmissions((prev) =>
                prev.map((submission) =>
                    submission.id === selectedSubmissionId
                        ? {...submission, status: "Removed by Owner"}
                        : submission
                )
            );
            message.success("Submission removed successfully");
        } catch (error) {
            message.error("Failed to delete submission");
        } finally {
            setModalVisible(false);
            setSelectedSubmissionId(null);
        }
    };

    const columns = [
        {
            title: "Submitter",
            dataIndex: "submitterName",
            key: "submitterName",
        },
        {
            title: "Submitted At",
            dataIndex: "submittedAt",
            key: "submittedAt",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) =>
                status ? <Tag color="red">{status}</Tag> : <Tag color="green">Active</Tag>,
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: Submission) => (
                <Button
                    danger
                    icon={<Trash2 size={16}/>}
                    disabled={record.status === "Removed by Owner"}
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
                dataSource={submissions}
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
