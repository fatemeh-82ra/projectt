import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/api';

export default function LoginPage() {
  const [form] = Form.useForm();
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const navigate = useNavigate();

  const onValuesChange = () => {
    const hasErrors = form.getFieldsError().some(({ errors }) => errors.length > 0);
    const isTouched = form.isFieldsTouched(true);
    const values = form.getFieldsValue();
    const requiredFieldsFilled = values.email && values.password;
    setSubmitDisabled(!(isTouched && requiredFieldsFilled && !hasErrors));
  };

  const onFinish = async (values: { email: string; password: string }) => {
    setSubmitDisabled(true);
    try {
      // Use api.login and map email to username
      const data = await api.login(values.email, values.password);
      if (data.status === 'SUCCESS') {
        localStorage.setItem('token', 'dummy-token'); // Replace with real token if backend provides
        localStorage.setItem('userName', data.username);
        if (data.id) localStorage.setItem('userId', data.id.toString());
        message.success(data.message);
        navigate('/');
      } else {
        message.error(data.message || 'Login failed. Try again.', 3);
      }
    } catch (error: any) {
      message.error(error.message || 'Login failed. Try again.', 3);
    } finally {
      setTimeout(() => setSubmitDisabled(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105 duration-300">
        <h2 className="text-4xl font-bold mb-6 text-center text-indigo-700">Login</h2>
        <Form
          form={form}
          onFinish={onFinish}
          onValuesChange={onValuesChange}
          layout="vertical"
          className="space-y-6"
        >
          <Form.Item
            label={<span className="text-lg font-semibold text-indigo-700">Email</span>}
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Invalid email format' },
            ]}
          >
            <Input placeholder="Enter your email" className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2" />
          </Form.Item>

          <Form.Item
            label={<span className="text-lg font-semibold text-indigo-700">Password</span>}
            name="password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 6, message: 'Password too short' },
            ]}
          >
            <Input.Password placeholder="Enter your password" className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              disabled={submitDisabled}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300"
            >
              Log In
            </Button>
          </Form.Item>

          <div className="text-center text-gray-600 space-y-2">
            <div>
              <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-800 font-medium">Forgot Password?</Link>
            </div>
            <div>
              Don't have an account? <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-medium">Sign Up</Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
