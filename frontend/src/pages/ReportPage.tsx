import React, { useState } from "react";
import {
  Card,
  Select,
  Typography,
  Space,
  Form,
  Button,
  message,
  Input,
  Tabs,
} from "antd";
import ChartReport from "../components/ChartReport";
import { useParams } from "react-router-dom";
import AggregateReport from '../components/AggregateReport';

const { Title } = Typography;
const { Option } = Select;

// mock numerical fields
const mockNumericalFields = [
  { id: "users", label: "Users" },
  { id: "submissions", label: "Submissions" },
  { id: "views", label: "Views" },
];

// mock chart data
const mockChartData: Record<string, { labels: string[]; values: number[] }> = {
  users: {
    labels: ["18-25", "26-35", "36-50", "51+"],
    values: [2, 5, 12, 9],
  },
  submissions: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    values: [39, 45, 63, 24, 56],
  },
  views: {
    labels: ["<100", "100-500", "500-1000", ">1000"],
    values: [10, 7, 5, 3],
  },
};

export default function ReportPage() {
  const { formId } = useParams();
  const [selectedField, setSelectedField] = useState("users");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [showChart, setShowChart] = useState(false);

  const handleFieldChange = (value: string) => {
    setSelectedField(value);
    setShowChart(false);
  };

  const handleChartTypeChange = (value: "bar" | "pie") => {
    setChartType(value);
    setShowChart(false);
  };

  const handleGenerate = () => {
    setShowChart(true);
    message.success("Chart generated!");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8">
      <Card className="shadow-lg rounded-lg">
        <Tabs
          items={[
            {
              key: 'aggregate',
              label: 'Aggregate Report',
              children: <AggregateReport />,
            },
            // Add more report types here in the future
          ]}
        />
      </Card>
    </div>
  );
}
