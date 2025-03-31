import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", 
  "#8884d8", "#82ca9d", "#ffc658", "#FF5733"
];

const TimelineChart = () => {
  const [viewType, setViewType] = useState<"monthly" | "daily" | "weekly">("monthly");

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/analytics/applications/timeline"],
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
        Error loading timeline data
      </div>
    );
  }

  // Process and format data based on the selected view type
  const formatData = () => {
    if (viewType === "monthly") {
      return data.monthly || [];
    } else if (viewType === "weekly") {
      return data.weekly || [];
    } else {
      return data.daily || [];
    }
  };

  const chartData = formatData();

  const formatXAxis = (value: string) => {
    if (viewType === "monthly") {
      const [year, month] = value.split("-");
      return `${MONTHS[parseInt(month) - 1]} ${year}`;
    } else if (viewType === "weekly") {
      return `Week ${value.split("-")[1]}`;
    }
    return value;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Application Timeline</CardTitle>
          <CardDescription>
            Application submissions over time
          </CardDescription>
        </div>
        <Select
          value={viewType}
          onValueChange={(value) => setViewType(value as "monthly" | "daily" | "weekly")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="line">
          <TabsList className="mb-4">
            <TabsTrigger value="line">Line Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          </TabsList>
          <TabsContent value="line" className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 25,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxis}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={formatXAxis}
                  formatter={(value: number, name: string) => [value, name === "count" ? "Applications" : name]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Applications"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
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
                  bottom: 25,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxis}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={formatXAxis}
                  formatter={(value: number, name: string) => [value, name === "count" ? "Applications" : name]}
                />
                <Legend />
                <Bar dataKey="count" name="Applications" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TimelineChart;