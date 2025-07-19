import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Table, message, Space, Typography, Spin, Alert } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { useParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

interface NumericalField {
  id: string;
  label: string;
  type: string;
}

interface ReportResult {
  result: number;
  totalSubmissions: number;
  aggregation: string;
  fieldLabel: string;
}

interface Submission {
  id: string;
  data: Record<string, number>;
  submittedAt: string;
}

const fetchWithToken = async (url: string, options: any = {}) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const headers = { ...options.headers, Authorization: `Bearer ${token}` };
  return fetch(url, { ...options, headers });
};

export default function AggregateReport() {
  const { formId } = useParams<{ formId: string }>();
  const [fields, setFields] = useState<NumericalField[]>([]);
  const [selectedField, setSelectedField] = useState<string>('');
  const [aggregation, setAggregation] = useState<string>('average');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportResult | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (formId) {
      fetchNumericalFields();
      fetchSubmissions();
    }
  }, [formId]);

  const fetchNumericalFields = async () => {
    try {
      setError(null);
      const response = await fetchWithToken(`http://localhost:3000/api/forms/${formId}/numerical-fields`);
      if (!response.ok) throw new Error('Failed to fetch numerical fields');
      const data = await response.json();
      setFields(data);
      if (data.length > 0) {
        setSelectedField(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching numerical fields:', error);
      setError('Failed to load numerical fields');
      message.error('Failed to load numerical fields');
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetchWithToken(`http://localhost:3000/api/forms/${formId}/submissions`);
      if (!response.ok) throw new Error('Failed to fetch submissions');
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const generateReport = async () => {
    if (!selectedField) return;

    setLoading(true);
    try {
      const response = await fetchWithToken(`http://localhost:3000/api/forms/${formId}/reports/aggregate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldId: selectedField, aggregation }),
      });

      if (!response.ok) throw new Error('Failed to generate report');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData || !submissions.length) return;

    const field = fields.find(f => f.id === selectedField);
    if (!field) return;

    // Prepare CSV data
    const headers = ['Date', field.label, 'Aggregation Type', 'Aggregated Value'];
    const rows = submissions.map(sub => [
      new Date(sub.submittedAt).toLocaleDateString(),
      sub.data[selectedField],
      aggregation,
      reportData.result
    ]);

    // Add the aggregated result as the last row
    rows.push(['', '', 'Total Submissions', reportData.totalSubmissions]);

    // Convert to CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${field.label}_${aggregation}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const prepareChartData = () => {
    if (!submissions.length || !selectedField) return [];

    return submissions.map(sub => ({
      date: new Date(sub.submittedAt).toLocaleDateString(),
      value: sub.data[selectedField],
      [fields.find(f => f.id === selectedField)?.label || '']: sub.data[selectedField]
    }));
  };

  if (error) {
    return (
      <Card className="shadow-lg rounded-lg">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={fetchNumericalFields}>
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  if (fields.length === 0) {
    return (
      <Card className="shadow-lg rounded-lg">
        <Alert
          message="No Numerical Fields"
          description="This form has no numerical fields available for aggregation."
          type="info"
          showIcon
        />
      </Card>
    );
  }

  const chartData = prepareChartData();

  return (
    <Card className="shadow-lg rounded-lg">
      <Space direction="vertical" size="large" className="w-full">
        <div className="flex justify-between items-center">
          <Title level={4}>Aggregate Report</Title>
          {reportData && (
            <Button
              type="primary"
              icon={<Download size={16} />}
              onClick={exportToCSV}
            >
              Export as CSV
            </Button>
          )}
        </div>

        <Space>
          <Select
            value={selectedField}
            onChange={setSelectedField}
            style={{ width: 200 }}
          >
            {fields.map(field => (
              <Option key={field.id} value={field.id}>
                {field.label}
              </Option>
            ))}
          </Select>

          <Select
            value={aggregation}
            onChange={setAggregation}
            style={{ width: 120 }}
          >
            <Option value="count">Count</Option>
            <Option value="sum">Sum</Option>
            <Option value="average">Average</Option>
          </Select>

          <Button
            type="primary"
            onClick={generateReport}
            loading={loading}
          >
            Generate Report
          </Button>
        </Space>

        {loading ? (
          <div className="flex justify-center">
            <Spin size="large" />
          </div>
        ) : reportData ? (
          <>
            <Card>
              <Table
                dataSource={[{
                  key: '1',
                  field: reportData.fieldLabel,
                  aggregation: reportData.aggregation.charAt(0).toUpperCase() + reportData.aggregation.slice(1),
                  result: reportData.result.toFixed(2),
                  submissions: reportData.totalSubmissions
                }]}
                columns={[
                  { title: 'Field', dataIndex: 'field', key: 'field' },
                  { title: 'Aggregation', dataIndex: 'aggregation', key: 'aggregation' },
                  { title: 'Result', dataIndex: 'result', key: 'result' },
                  { title: 'Total Submissions', dataIndex: 'submissions', key: 'submissions' }
                ]}
                pagination={false}
              />
            </Card>

            <Card title="Trend Analysis">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey={fields.find(f => f.id === selectedField)?.label || ''}
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </>
        ) : null}
      </Space>
    </Card>
  );
} 