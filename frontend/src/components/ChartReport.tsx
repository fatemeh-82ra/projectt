import { useRef } from "react";
import { Card, Select, Space, Empty, message, Dropdown, MenuProps } from "antd";
import { Bar, Pie } from "react-chartjs-2";
import { FileDown, ImageDown, MoreVertical } from "lucide-react";
import jsPDF from "jspdf";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const { Option } = Select;

export type ChartReportProps = {
  numericalFields: { id: string; label: string }[];
  chartType: "bar" | "pie";
  setChartType: (type: "bar" | "pie") => void;
  selectedField: string;
  setSelectedField: (id: string) => void;
  data: { labels: string[]; values: number[] };
};

export default function ChartReport({
  numericalFields,
  chartType,
  setChartType,
  selectedField,
  setSelectedField,
  data,
}: ChartReportProps) {
  const chartRef = useRef<any>(null);

  // This function exports the chart as a PNG image.
  // It first checks if the chart reference is available and if the canvas element of the chart is available.
  // If both conditions are met, it converts the canvas to a PNG image URL, creates a new anchor element,
  // sets the href attribute of the anchor element to the PNG image URL, sets the download attribute to specify the file name,
  // simulates a click on the anchor element to download the image, and finally shows a success message after exporting the chart.
  const handleExportPNG = async () => {
    if (!chartRef.current) return;
    const canvas = chartRef.current.canvas;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url; // this is the anchor
    link.download = "chart.png";
    link.click();
    message.success("Chart exported as PNG");
  };

  // This function exports the chart as a PDF file.
  // It first checks if the chart reference is available and if the canvas element of the chart is available.
  // If both conditions are met, it converts the canvas to a PNG image URL, creates a new PDF document,
  // adds the PNG image to the PDF document at a specified position and size, saves the PDF document with a specified file name,
  // and finally shows a success message after exporting the chart.
  const handleExportPDF = async () => {
    if (!chartRef.current) return;
    const canvas = chartRef.current.canvas;
    if (!canvas) return;
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 180, chartType === "bar" ? 100 : 180); // sizes
    pdf.save("chart.pdf");
    message.success("Chart exported as PDF");
  };

  if (!numericalFields.length) {
    return <Empty description="No numerical fields available for reporting." />;
  }

  // customize the chart data if needed
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: numericalFields.find((f) => f.id === selectedField)?.label || "",
        data: data.values,
        backgroundColor: [
          "#6366f1",
          "#22d3ee",
          "#f59e42",
          "#f43f5e",
          "#10b981",
          "#eab308",
          "#a78bfa",
          "#f87171",
          "#34d399",
          "#fbbf24",
        ],
      },
    ],
  };

  const items: MenuProps["items"] = [
    {
      label: "Export as PNG",
      key: "0",
      icon: <ImageDown size={16} />,
      onClick: handleExportPNG,
    },
    {
      type: "divider",
    },
    {
      label: "Export as PDF",
      key: "1",
      icon: <FileDown size={16} />,
      onClick: handleExportPDF,
    },
  ];

  return (
    <Card
      className="mb-6 shadow"
      title="Chart"
      extra={
        <Dropdown menu={{ items }} trigger={["click"]}>
          <MoreVertical size={16} className="cursor-pointer" />
        </Dropdown>
      }
    >
      <Space
        direction="vertical"
        size="middle"
        style={{ width: "100%" }}
        className="mb-28 md:mb-0"
      >
        <Space wrap>
          <Select
            value={selectedField}
            onChange={setSelectedField}
            placeholder="Select numerical field"
            style={{ minWidth: 180 }}
          >
            {numericalFields.map((field) => (
              <Option key={field.id} value={field.id}>
                {field.label}
              </Option>
            ))}
          </Select>
          <Select
            value={chartType}
            onChange={setChartType}
            style={{ minWidth: 120 }}
          >
            <Option value="bar">Bar Chart</Option>
            <Option value="pie">Pie Chart</Option>
          </Select>
        </Space>
        <div
          className="flex justify-center"
          style={{ maxWidth: 600, maxHeight: 300, margin: "0 auto" }}
        >
          {chartType === "bar" ? (
            <Bar ref={chartRef} data={chartData} />
          ) : (
            <Pie ref={chartRef} data={chartData} />
          )}
        </div>
      </Space>
    </Card>
  );
}
