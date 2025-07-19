import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Switch, message, Space, Typography, Modal, Alert } from 'antd';
import { Edit, Save, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface Group {
    id: string;
    name: string;
    members: string[];
    createdBy: string;
    createdAt: string;
}

interface Permission {
    groupId: string;
    groupName: string;
    canView: boolean;
    canSubmit: boolean;
    grantedAt: string;
}

interface FormPermissionsProps {
    formId: string;
    isNewForm?: boolean;
}

const fetchWithToken = async (url: string, options: any = {}) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };
    return fetch(url, { ...options, headers });
};

export default function FormPermissions({ formId, isNewForm = false }: FormPermissionsProps) {
    const navigate = useNavigate();
    const [groups, setGroups] = useState<Group[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [editMode, setEditMode] = useState<string | null>(null);
    const [revokeModal, setRevokeModal] = useState<{ visible: boolean; groupId: string | null }>({
        visible: false,
        groupId: null,
    });

    useEffect(() => {
        fetchGroups();
        if (!isNewForm) {
            fetchPermissions();
        }
    }, [formId, isNewForm]);

    const fetchGroups = async () => {
        try {
            setError(null);
            console.log('Fetching groups from API...');
            const response = await fetchWithToken('http://localhost:3000/api/groups');
            if (!response.ok) throw new Error('Failed to fetch groups');
            const data = await response.json();
            console.log('Received groups data:', data);
            setGroups(data);
        } catch (error) {
            console.error('Error fetching groups:', error);
            setError('Failed to load groups');
            message.error('Failed to load groups');
        }
    };

    const fetchPermissions = async () => {
        try {
            setError(null);
            console.log('Fetching permissions for form:', formId);
            const response = await fetchWithToken(`http://localhost:3000/api/forms/${formId}/permissions`);
            if (!response.ok) throw new Error('Failed to fetch permissions');
            const data = await response.json();
            console.log('Received permissions data:', data);
            setPermissions(data);
        } catch (error) {
            console.error('Error fetching permissions:', error);
            setError('Failed to load permissions');
            message.error('Failed to load permissions');
        }
    };

    const handlePermissionChange = (groupId: string, type: 'view' | 'submit', checked: boolean) => {
        setPermissions(prev => {
            const existing = prev.find(p => p.groupId === groupId);
            if (existing) {
                return prev.map(p => 
                    p.groupId === groupId 
                        ? { ...p, [`can${type.charAt(0).toUpperCase() + type.slice(1)}`]: checked }
                        : p
                );
            } else {
                const group = groups.find(g => g.id === groupId);
                if (!group) return prev;
                return [...prev, {
                    groupId,
                    groupName: group.name,
                    canView: type === 'view' ? checked : false,
                    canSubmit: type === 'submit' ? checked : false,
                    grantedAt: new Date().toISOString(),
                }];
            }
        });
        setHasChanges(true);
    };

    const handleRevokeAccess = (groupId: string) => {
        setRevokeModal({ visible: true, groupId });
    };

    const confirmRevokeAccess = () => {
        if (!revokeModal.groupId) return;
        
        setPermissions(prev => prev.filter(p => p.groupId !== revokeModal.groupId));
        setHasChanges(true);
        setRevokeModal({ visible: false, groupId: null });
    };

    const handleSave = async () => {
        if (!hasChanges) return;

        setLoading(true);
        try {
            const response = await fetchWithToken(`http://localhost:3000/api/forms/${formId}/permissions`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissions }),
            });

            if (!response.ok) throw new Error('Failed to update permissions');
            
            message.success('Permissions updated successfully');
            setHasChanges(false);
            setEditMode(null);
        } catch (error) {
            console.error('Error updating permissions:', error);
            message.error('Failed to update permissions');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Group',
            dataIndex: 'groupName',
            key: 'groupName',
        },
        {
            title: 'View',
            key: 'view',
            render: (_, record: Permission) => (
                <Switch
                    checked={record.canView}
                    onChange={(checked) => handlePermissionChange(record.groupId, 'view', checked)}
                    disabled={editMode !== record.groupId}
                />
            ),
        },
        {
            title: 'Submit',
            key: 'submit',
            render: (_, record: Permission) => (
                <Switch
                    checked={record.canSubmit}
                    onChange={(checked) => handlePermissionChange(record.groupId, 'submit', checked)}
                    disabled={editMode !== record.groupId}
                />
            ),
        },
        {
            title: 'Granted At',
            dataIndex: 'grantedAt',
            key: 'grantedAt',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record: Permission) => (
                <Space>
                    {editMode === record.groupId ? (
                        <Button
                            type="primary"
                            icon={<Save size={16} />}
                            onClick={handleSave}
                            loading={loading}
                        >
                            Save
                        </Button>
                    ) : (
                        <Button
                            icon={<Edit size={16} />}
                            onClick={() => setEditMode(record.groupId)}
                        >
                            Edit
                        </Button>
                    )}
                    <Button
                        danger
                        onClick={() => handleRevokeAccess(record.groupId)}
                        disabled={editMode === record.groupId}
                    >
                        Revoke
                    </Button>
                </Space>
            ),
        },
    ];

    if (error) {
        return (
            <Card className="shadow-lg rounded-lg">
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" type="primary" onClick={() => {
                            fetchGroups();
                            fetchPermissions();
                        }}>
                            Retry
                        </Button>
                    }
                />
            </Card>
        );
    }

    if (groups.length === 0) {
        return (
            <Card className="shadow-lg rounded-lg">
                <Alert
                    message="No Groups Available"
                    description={
                        <Space direction="vertical">
                            <Text>Create a group to share this form.</Text>
                            <Button
                                type="primary"
                                icon={<Plus size={16} />}
                                onClick={() => navigate('/groups/new')}
                            >
                                Create Group
                            </Button>
                        </Space>
                    }
                    type="info"
                    showIcon
                />
            </Card>
        );
    }

    return (
        <Card className="shadow-lg rounded-lg">
            <Space direction="vertical" size="large" className="w-full">
                <div className="flex justify-between items-center">
                    <Title level={4}>Form Permissions</Title>
                    {hasChanges && (
                        <Button
                            type="primary"
                            icon={<Save size={16} />}
                            onClick={handleSave}
                            loading={loading}
                        >
                            Save Changes
                        </Button>
                    )}
                </div>

                <Table
                    dataSource={permissions}
                    columns={columns}
                    rowKey="groupId"
                    pagination={false}
                />

                <Modal
                    title="Revoke Access"
                    open={revokeModal.visible}
                    onOk={confirmRevokeAccess}
                    onCancel={() => setRevokeModal({ visible: false, groupId: null })}
                    okText="Revoke"
                    okButtonProps={{ danger: true }}
                >
                    <p>Are you sure you want to revoke access for this group?</p>
                </Modal>
            </Space>
        </Card>
    );
} 