import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = (values) => {
    message.info('Password reset functionality is not implemented yet. Contact support.');
    console.log('Forgot password request for:', values.email);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105 duration-300">
        <h2 className="text-4xl font-bold mb-6 text-center text-indigo-700">Forgot Password</h2>
        <Form form={form} onFinish={onFinish} layout="vertical" className="space-y-6">
          <Form.Item
            label={<span className="text-lg font-semibold text-indigo-700">Email</span>}
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { pattern: /^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Invalid email format' },
            ]}
          >
            <Input placeholder="Enter your email" className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300"
            >
              Send Reset Link
            </Button>
          </Form.Item>
          <div className="text-center text-gray-600">
            Back to <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Login</Link>
          </div>
        </Form>
      </div>
    </div>
  );
}