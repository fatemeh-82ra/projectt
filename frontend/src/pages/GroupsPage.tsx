import * as React from 'react';
import { useState, useEffect } from 'react';
import { Table, Modal, Button, Card, message } from 'antd';
import { Edit, Trash2, Plus } from 'lucide-react';
import { mockApi } from '../api/mockApi';
import CreateGroup from '../components/CreateGroup';
import type { ColumnsType } from 'antd/es/table';

interface Group {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    createdAt: string;
}

const GroupsPage: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const loadGroups = async () => {
        try {
            const groupsData = await mockApi.getGroups();
            setGroups(groupsData);
        } catch (error) {
            message.error('Failed to load groups');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGroups();
    }, []);

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        setModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;

        try {
            await mockApi.deleteGroup(deletingId);
            setGroups(groups.filter((group: Group) => group.id !== deletingId));
            message.success('Group deleted successfully');
        } catch (error) {
            message.error('Failed to delete group');
        } finally {
            setModalVisible(false);
            setDeletingId(null);
        }
    };

    const handleEdit = (id: string) => {
        message.info(`Edit group ${id}`);
    };

    const handleCreateSuccess = (groupName: string, memberCount: number) => {
        message.success(`Group '${groupName}' created with ${memberCount} members`);
        setShowCreateForm(false);
        loadGroups();
    };

    const columns: ColumnsType<Group> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Members',
            dataIndex: 'memberCount',
            key: 'memberCount',
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: Group) => (
                <div className="flex gap-2">
                    <Button
                        type="text"
                        icon={<Edit size={16} />}
                        onClick={() => handleEdit(record.id)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<Trash2 size={16} />}
                        onClick={() => handleDelete(record.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <Card 
            title="Groups"
            extra={
                <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={() => setShowCreateForm(true)}
                >
                    Create Group
                </Button>
            }
        >
            <Table<Group>
                columns={columns}
                dataSource={groups}
                loading={loading}
                rowKey="id"
            />

            <Modal
                title="Delete Group"
                open={modalVisible}
                onOk={confirmDelete}
                onCancel={() => {
                    setModalVisible(false);
                    setDeletingId(null);
                }}
                okText="Delete"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete this group?</p>
                <p>This will remove all permissions associated with this group.</p>
            </Modal>

            <Modal
                title="Create New Group"
                open={showCreateForm}
                onCancel={() => setShowCreateForm(false)}
                footer={null}
                width={800}
            >
                <CreateGroup
                    currentUserId="current-user-id" // This should come from your auth context
                    onSuccess={handleCreateSuccess}
                />
            </Modal>
        </Card>
    );
};

export default GroupsPage;
