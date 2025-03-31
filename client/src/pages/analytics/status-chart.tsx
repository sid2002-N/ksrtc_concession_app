import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { ApplicationStatus } from "@shared/schema";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", 
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042"
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const friendlyStatusNames: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: "Pending",
  [ApplicationStatus.COLLEGE_VERIFIED]: "College Verified",
  [ApplicationStatus.COLLEGE_REJECTED]: "College Rejected",
  [ApplicationStatus.DEPOT_APPROVED]: "Depot Approved",
  [ApplicationStatus.DEPOT_REJECTED]: "Depot Rejected",
  [ApplicationStatus.PAYMENT_PENDING]: "Payment Pending",
  [ApplicationStatus.PAYMENT_VERIFIED]: "Payment Verified",
  [ApplicationStatus.ISSUED]: "Issued"
};

const StatusChart = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/analytics/applications/status"],
  });

  if (isLoading) {
    return (
      <div className="h-60 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-60 flex justify-center items-center text-red-500">
        Error loading status data
      </div>
    );
  }

  // Transform data for charts
  const chartData = Object.entries(data.statusCounts).map(([status, count]) => ({
    name: friendlyStatusNames[status as ApplicationStatus] || status,
    value: count as number,
    status
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Application Status Distribution</CardTitle>
        <CardDescription>
          Overview of applications by current status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pie">
          <TabsList className="mb-4">
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          </TabsList>
          <TabsContent value="pie" className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} applications`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="bar" className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value} applications`, 'Count']} />
                <Bar dataKey="value" name="Applications" fill="#8884d8">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StatusChart;