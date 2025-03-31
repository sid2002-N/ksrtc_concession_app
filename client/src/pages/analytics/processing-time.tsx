import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { ApplicationStatus } from "@shared/schema";

const statusLabels: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: "Pending",
  [ApplicationStatus.COLLEGE_VERIFIED]: "College Verified",
  [ApplicationStatus.COLLEGE_REJECTED]: "College Rejected",
  [ApplicationStatus.DEPOT_APPROVED]: "Depot Approved",
  [ApplicationStatus.DEPOT_REJECTED]: "Depot Rejected",
  [ApplicationStatus.PAYMENT_PENDING]: "Payment Pending",
  [ApplicationStatus.PAYMENT_VERIFIED]: "Payment Verified",
  [ApplicationStatus.ISSUED]: "Issued"
};

const ProcessingTimeChart = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/analytics/processing-time"],
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
        Error loading processing time data
      </div>
    );
  }

  // Processing time by stage
  const stageData = [
    { name: "Student → College", time: data.averageProcessingTime?.studentToCollege || 0 },
    { name: "College → Depot", time: data.averageProcessingTime?.collegeToDepot || 0 },
    { name: "Depot → Payment", time: data.averageProcessingTime?.depotToPayment || 0 },
    { name: "Payment → Issue", time: data.averageProcessingTime?.paymentToIssue || 0 },
    { name: "Total Process", time: data.averageProcessingTime?.totalProcessing || 0 }
  ];

  // Monthly averages trend
  const monthlyData = data.monthlyAverages || [];

  const formatTime = (hours: number) => {
    if (hours < 24) {
      return `${Math.round(hours * 10) / 10} hours`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round((hours % 24) * 10) / 10;
      return `${days} day${days !== 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours} hr` : ''}`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Processing Time Analysis</CardTitle>
        <CardDescription>
          Average time taken at each stage of the application process
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stages">
          <TabsList className="mb-4">
            <TabsTrigger value="stages">Process Stages</TabsTrigger>
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stages" className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stageData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value) => [formatTime(Number(value)), 'Processing Time']}
                />
                <Legend />
                <Bar 
                  dataKey="time" 
                  name="Processing Time" 
                  fill="#8884d8" 
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="trends" className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => {
                    const [year, month] = value.split("-");
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    return `${monthNames[parseInt(month) - 1]} ${year}`;
                  }}
                />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value) => [formatTime(Number(value)), 'Average Processing Time']}
                  labelFormatter={(value) => {
                    const [year, month] = (value as string).split("-");
                    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    return `${monthNames[parseInt(month) - 1]} ${year}`;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="averageTime"
                  name="Processing Time"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProcessingTimeChart;