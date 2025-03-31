import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock } from "lucide-react";
import { 
  Bar, 
  BarChart as RechartsBarChart, 
  CartesianGrid, 
  Cell, 
  Legend, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";

// Type definitions for API responses
interface ProcessingTimeStats {
  submissionToCollegeVerification: {
    averageDays: number;
    totalApplications: number;
  };
  collegeVerificationToDepotApproval: {
    averageDays: number;
    totalApplications: number;
  };
  depotApprovalToPaymentVerification: {
    averageDays: number;
    totalApplications: number;
  };
  paymentVerificationToIssuance: {
    averageDays: number;
    totalApplications: number;
  };
  overallProcessingTime: {
    averageDays: number;
    totalApplications: number;
  };
}

// Format a time duration in days
function formatProcessingTime(days: number): string {
  if (days === 0) return "< 1 day";
  if (days === 1) return "1 day";
  return `${days.toFixed(1)} days`;
}

export default function ProcessingTimeAnalytics() {
  // Fetch processing time analytics
  const { data: processingStats, isLoading } = useQuery<ProcessingTimeStats>({
    queryKey: ["/api/analytics/processing-time"],
  });

  // Prepare data for charts
  const stageNames = {
    submissionToCollegeVerification: "Student → College",
    collegeVerificationToDepotApproval: "College → Depot",
    depotApprovalToPaymentVerification: "Depot → Payment",
    paymentVerificationToIssuance: "Payment → Issuance"
  };

  const stageColors = [
    "#3498db", // Blue
    "#2ecc71", // Green
    "#9b59b6", // Purple
    "#f39c12", // Orange
  ];

  // Prepare data for the bar chart
  const barChartData = processingStats ? [
    {
      name: stageNames.submissionToCollegeVerification,
      days: processingStats.submissionToCollegeVerification.averageDays,
      count: processingStats.submissionToCollegeVerification.totalApplications
    },
    {
      name: stageNames.collegeVerificationToDepotApproval,
      days: processingStats.collegeVerificationToDepotApproval.averageDays,
      count: processingStats.collegeVerificationToDepotApproval.totalApplications
    },
    {
      name: stageNames.depotApprovalToPaymentVerification,
      days: processingStats.depotApprovalToPaymentVerification.averageDays,
      count: processingStats.depotApprovalToPaymentVerification.totalApplications
    },
    {
      name: stageNames.paymentVerificationToIssuance,
      days: processingStats.paymentVerificationToIssuance.averageDays,
      count: processingStats.paymentVerificationToIssuance.totalApplications
    }
  ] : [];

  // Find the stage with the longest average processing time
  const longestStage = processingStats ? 
    Object.entries(processingStats)
      .filter(([key]) => key !== "overallProcessingTime")
      .reduce((longest, [key, value]) => 
        value.averageDays > longest.time ? { stage: key, time: value.averageDays } : longest, 
        { stage: "", time: 0 }
      )
    : { stage: "", time: 0 };
  
  const longestStageName = longestStage.stage in stageNames 
    ? stageNames[longestStage.stage as keyof typeof stageNames] 
    : "Unknown";

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href="/admin/analytics">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Processing Time Analytics</h1>
      </div>

      {/* Overall Processing Time Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overall Application Processing</CardTitle>
          <CardDescription>
            Average time from application submission to concession issuance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Skeleton className="h-20 w-40" />
            </div>
          ) : processingStats ? (
            <div className="flex flex-col items-center py-8">
              <Clock className="w-16 h-16 mb-4 text-primary" />
              <div className="text-5xl font-bold">
                {formatProcessingTime(processingStats.overallProcessingTime.averageDays)}
              </div>
              <div className="mt-2 text-muted-foreground">
                Based on {processingStats.overallProcessingTime.totalApplications} completed applications
              </div>
              {longestStage.time > 0 && (
                <div className="mt-6 text-center max-w-md">
                  <div className="text-sm font-semibold">Bottleneck detected</div>
                  <div className="text-sm text-muted-foreground">
                    The <span className="font-medium">{longestStageName}</span> stage takes the longest, 
                    averaging {formatProcessingTime(longestStage.time)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center py-8 text-muted-foreground">
              No processing time data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stage-by-Stage Processing Times */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Time by Stage</CardTitle>
          <CardDescription>
            Average time spent at each stage of the application process
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px]" />
          ) : processingStats ? (
            <div className="space-y-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={barChartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Average Days', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === 'days') return [formatProcessingTime(value), 'Average Time'];
                        return [value, 'Applications'];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="days" name="Average Processing Days" radius={[4, 4, 0, 0]}>
                      {barChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={stageColors[index % stageColors.length]} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Object.entries(processingStats)
                  .filter(([key]) => key !== "overallProcessingTime")
                  .map(([key, value], index) => (
                    <div key={key} className="p-4 border rounded-lg">
                      <div 
                        className="w-3 h-3 rounded-full mb-2" 
                        style={{ backgroundColor: stageColors[index % stageColors.length] }}
                      ></div>
                      <h3 className="font-medium">
                        {stageNames[key as keyof typeof stageNames]}
                      </h3>
                      <div className="text-2xl font-bold mt-1">
                        {formatProcessingTime(value.averageDays)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {value.totalApplications} applications
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-8 text-muted-foreground">
              No processing time data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}