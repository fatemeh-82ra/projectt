import React from "react";
import { Layout } from "antd";

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Layout className="h-dvh flex flex-col">
      <Content className=" bg-blue-100 flex-1">
        <div className="max-w-7xl h-dvh mx-auto md:py-6 sm:px-6 lg:px-8">
          <div className="md:px-4 lg:py-6 sm:px-0 h-full">{children}</div>
        </div>
      </Content>
    </Layout>
  );
}
