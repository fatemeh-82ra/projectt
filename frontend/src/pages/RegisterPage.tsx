import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/api';

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const navigate = useNavigate();

  const onValuesChange = () => {
    // Check if fields are touched and have no errors
    const hasErrors = form.getFieldsError().some(({ errors }) => errors.length > 0);
    const isTouched = form.isFieldsTouched(true); // true checks all fields
    const values = form.getFieldsValue();
    const requiredFieldsFilled = values.name && values.email && values.password && values.confirmPassword;
    setSubmitDisabled(!(isTouched && requiredFieldsFilled && !hasErrors));
  };

  const onFinish = async (values: any) => {
    setSubmitDisabled(true);
    try {
      // Use api.register and map values accordingly
      const data = await api.register(values.name, values.email, values.password);
      if (data.status === 'SUCCESS') {
        message.success(data.message, 2, () => navigate('/login'));
      } else {
        if (data.message && data.message.includes('already registered')) {
          message.error('Email already registered', 3);
          form.setFields([{ name: 'email', errors: ['Email already registered'] }]);
          const emailField = form.getFieldInstance && form.getFieldInstance('email');
          if (emailField) {
            emailField.focus();
            if (emailField.input) emailField.input.style.borderColor = 'red';
          }
        } else {
          message.error(data.message || 'Registration failed. Try again.', 3);
        }
      }
    } catch (error: any) {
      message.error(error.message || 'Registration failed. Try again.', 3);
    } finally {
      setTimeout(() => setSubmitDisabled(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105 duration-300">
        <h2 className="text-4xl font-bold mb-6 text-center text-indigo-700">Register</h2>
        <Form
          form={form}
          onFinish={onFinish}
          onValuesChange={onValuesChange}
          layout="vertical"
          className="space-y-6"
        >
          <Form.Item
            label={<span className="text-lg font-semibold text-indigo-700">Name</span>}
            name="name"
            rules={[
              { required: true, message: 'Name is required' },
              { pattern: /^[a-zA-Z\s]+$/, message: 'Name must be 2-50 letters' },
              { min: 2, message: 'Name must be at least 2 characters' },
              { max: 50, message: 'Name must not exceed 50 characters' },
            ]}
          >
            <Input placeholder="Enter your name" className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2" />
          </Form.Item>
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
          <Form.Item
            label={<span className="text-lg font-semibold text-indigo-700">Password</span>}
            name="password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 8, message: 'Password must be at least 8 characters' },
              { pattern: /[0-9]/, message: 'Password must include a number' },
              { pattern: /[a-z]/, message: 'Password must include a lowercase letter' },
              { pattern: /[A-Z]/, message: 'Password must include an uppercase letter' },
              { pattern: /[!@#$%^&*]/, message: 'Password must include a special character' },
            ]}
          >
            <Input.Password placeholder="Enter your password" className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2" />
          </Form.Item>
          <Form.Item
            label={<span className="text-lg font-semibold text-indigo-700">Confirm Password</span>}
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Passwords do not match');
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm your password" className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              disabled={submitDisabled}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300"
            >
              Sign Up
            </Button>
          </Form.Item>
          <div className="text-center text-gray-600">
            Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Log in</Link>
          </div>
        </Form>
      </div>
    </div>
  );
}