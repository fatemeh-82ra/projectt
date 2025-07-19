import React from 'react';
import { Button, Typography, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <Result
          status="403"
          title="Access Denied"
          subTitle="You don't have permission to access this resource."
          icon={<LockOutlined className="text-red-500" />}
          extra={
            <Button
              type="primary"
              onClick={() => navigate('/')}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Go to Dashboard
            </Button>
          }
        />
      </div>
    </div>
  );
} 