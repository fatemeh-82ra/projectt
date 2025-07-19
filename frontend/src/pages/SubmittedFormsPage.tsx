import React, { useEffect, useState } from 'react';
import { Card, Table, Typography, message, Spin, Button, Space, Modal } from 'antd';
import { fetchWithToken } from '../api/fetchWithToken';
import moment from 'moment';
import { Trash2 } from 'lucide-react';

const { Title, Text } = Typography;

interface Submission {
  id: string;
  formId: string;
  userEmail: string;
  data: Record<string, any>; // Using any for flexibility, ideally more specific type
  submittedAt: string;
}

interface Form {
  id: string;
  title: string;
}

export default function SubmittedFormsPage() {
  console.log('Rendering SubmittedFormsPage');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    console.log('useEffect in SubmittedFormsPage is running');
    fetchUserSubmissions();
    // Fetch forms to display form titles (optional, could fetch forms with submissions)
    fetchForms();
  }, []);

  const fetchUserSubmissions = async () => {
    console.log('Fetching user submissions...');
    setLoading(true);
    try {
      const response = await fetchWithToken('http://localhost:3000/api/user/submissions');
      if (!response.ok) throw new Error('Failed to fetch submissions');
      const data = await response.json();
      console.log('Received user submissions data:', data);
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      message.error('Failed to load your submissions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchForms = async () => {
     console.log('Fetching all forms for titles...');
     try {
      // Assuming you have an endpoint to fetch forms by IDs or all forms
      // For now, fetching all forms to get titles for submission display
      const response = await fetchWithToken('http://localhost:3000/api/forms'); // This might need adjustment based on your forms endpoint
      if (!response.ok) throw new Error('Failed to fetch forms');
      const data = await response.json();
      console.log('Received forms data for titles:', data);
      setForms(data);
    } catch (error) {
      console.error('Error fetching forms for submissions page:', error);
       // Message might be too aggressive, forms titles might not be critical
    }
  };

  const getFormTitle = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    return form ? form.title : 'Unknown Form';
  };

  const handleDeleteClick = (submissionId: string) => {
    setDeletingId(submissionId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    setLoading(true);
    try {
      const response = await fetchWithToken(`http://localhost:3000/api/submissions/${deletingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete submission');

      message.success('Submission deleted successfully!');
      setSubmissions(prev => prev.filter(sub => sub.id !== deletingId));
    } catch (error) {
      console.error('Error deleting submission:', error);
      message.error('Failed to delete submission.');
    } finally {
      setLoading(false);
      setDeletingId(null);
      setDeleteModalVisible(false);
    }
  };

  const columns = [
    {
      title: 'Form Title',
      key: 'formTitle',
       render: (text: any, record: Submission) => getFormTitle(record.formId),
    },
    {
      title: 'Submitted At',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: string) => moment(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Submission Data',
      dataIndex: 'data',
      key: 'data',
      render: (data: Record<string, any>) => (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ),
    },
     {
      title: 'Actions',
      key: 'actions',
      render: (text: any, record: Submission) => (
        <Button
          danger
          icon={<Trash2 size={16} />}
          onClick={() => handleDeleteClick(record.id)}
          disabled={loading}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg rounded-lg">
        <Space direction="vertical" size="large" className="w-full">
          <Title level={3} className="text-center">My Submitted Forms</Title>
          {loading ? (
            <Spin tip="Loading submissions...">
                 <div style={{ height: 200 }} />
            </Spin>
          ) : submissions.length > 0 ? (
            <Table
              dataSource={submissions}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          ) : (
            <Text>You haven't submitted any forms yet.</Text>
          )}
        </Space>
      </Card>

      <Modal
        title="Confirm Deletion"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this submission? This action cannot be undone.</p>
      </Modal>
    </div>
  );
} 