import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Form, Input, Select, DatePicker, Button, Card, Space, Typography, message } from 'antd';
import { FileText, Users, List, User, LogOut, Home } from 'lucide-react';
import moment from 'moment';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const fetchWithToken = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found in localStorage');
  }
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };
  return fetch(url, { ...options, headers });
};

export default function FormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [form] = Form.useForm();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const fetchForm = async () => {
    try {
      const response = await fetchWithToken(`http://localhost:8080/api/forms/${id}/structure`);
      if (response.status === 403) {
        navigate('/access-denied');
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch form');
      const data = await response.json();
      setFormData(data);
      // Initialize form fields with default values if available
      const initialValues = {};
      data.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          initialValues[field.id] = field.type === 'date' && field.defaultValue ? moment(field.defaultValue) : field.defaultValue;
        }
      });
      form.setFieldsValue(initialValues);
    } catch (error) {
      console.error('Error fetching form:', error.message);
      message.error('Failed to load form');
      navigate('/forms', { replace: true });
    }
  };

  useEffect(() => {
    fetchForm();
  }, [id]);

  const handleSubmit = async (values) => {
      setLoading(true);
    try {
      const submissionData = {};
        formData.fields.forEach(field => {
            // Format date fields correctly if needed
            submissionData[field.id] = field.type === 'date' && values[field.id] ? values[field.id].toISOString() : values[field.id];
        });

      const response = await fetchWithToken(`http://localhost:3000/api/forms/${id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) throw new Error('Failed to submit form');

      message.success('Form submitted successfully!');
      // Optionally navigate the user to a confirmation page or back to forms list
      // navigate('/forms');
      navigate('/submitted-forms');
    } catch (error) {
      console.error('Error submitting form:', error.message);
      message.error('Failed to submit form.');
    } finally {
        setLoading(false);
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <Home size={18} className="text-indigo-600" />,
      label: 'Dashboard',
      onClick: () => navigate('/'),
    },
    {
      key: 'forms',
      icon: <FileText size={18} className="text-indigo-600" />,
      label: 'Forms',
      onClick: () => navigate('/forms'),
    },
    {
      key: 'submissions',
      icon: <List size={18} className="text-indigo-600" />,
      label: 'Submissions',
      onClick: () => navigate('/submitted-forms'),
    },
    {
      key: 'groups',
      icon: <Users size={18} className="text-indigo-600" />,
      label: 'Groups',
      onClick: () => navigate('/groups'),
    },
    {
      key: 'profile',
      icon: <User size={18} className="text-indigo-600" />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      icon: <LogOut size={18} className="text-indigo-600" />,
      label: 'Logout',
      onClick: () => {
        localStorage.removeItem('token');
        navigate('/login');
      },
    },
  ];

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
      case 'textarea':
        return <Input />;
      case 'number':
        return <Input type="number" />;
      case 'date':
        return <DatePicker style={{ width: '100%' }} />;
      case 'dropdown':
      case 'radio':
        return (
          <Select>
            {field.options?.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
          </Select>
        );
      case 'checkbox':
        return (
          <Select mode="multiple">
            {field.options?.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
          </Select>
        );
      default:
        return <Input />;
    }
  };

  return (

        <Content className="p-4 sm:p-8 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-white">{formData?.title || 'Form'}</h1>
            {formData ? (
              <Card className="shadow-2xl rounded-2xl p-6 bg-white transform hover:shadow-3xl transition duration-300">
                <Form form={form} layout="vertical" onFinish={handleSubmit}>

                  {formData.fields?.map((field, index) => (
                    <Form.Item
                      key={field.id}
                      label={`${field.label} ${field.required ? '*' : ''}`}
                      name={field.id}
                      rules={[{ required: field.required, message: `${field.label} is required!` }]}
                    >
                      {renderField(field)}
                    </Form.Item>
                  ))}
                  <Form.Item>
                      <Button type="primary" htmlType="submit" loading={loading}>
                          Submit Form
                      </Button>
                  </Form.Item>
                </Form>

              </Card>
            ) : (
              <Text>Loading form...</Text>
            )}
          </div>
        </Content>

  );
}
