import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import ProtectedLayout from "../layouts/ProtectedLayout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import Dashboard from "../pages/Dashboard";
import FormsPage from "../pages/FormsPage";
import FormPage from "../pages/FormPage";
import FormEditPage from "../pages/FormEditPage";
import ReportPage from "../pages/ReportPage";
import GroupsPage from "../pages/GroupsPage";
import ProfilePage from "../pages/ProfilePage";
import SubmissionsPage from "../pages/SubmissionsPage";
import MySubmissionsPage from "../pages/MySubmissionsPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import FormBuilderPage from "../pages/FormBuilderPage";
import AccessDeniedPage from "../pages/AccessDeniedPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        element={
          <PublicLayout>
            <Outlet />
          </PublicLayout>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
      </Route>

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedLayout>
            <Outlet />
          </ProtectedLayout>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="forms" element={<FormsPage />} />
        <Route path="forms/:id" element={<FormPage />} />
        <Route path="forms/:formId/edit" element={<FormEditPage />} />
        <Route path="forms/new/:id?" element={<FormBuilderPage />} />
        <Route path="reports/:formId" element={<ReportPage />} />
        <Route path="submitted-forms" element={<MySubmissionsPage />} />
        <Route path="groups" element={<GroupsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="submissions/:formId" element={<SubmissionsPage />} />
        <Route path="access-denied" element={<AccessDeniedPage />} />
      </Route>
    </Routes>
  );
}
