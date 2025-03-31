import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PieChart, BarChart4, LineChart, Clock, Building2, Bus } from "lucide-react";

import Header from "@/components/header";
import Footer from "@/components/footer";

import StatusChart from "./status-chart";
import TimelineChart from "./timeline-chart";
import PaymentChart from "./payment-chart";
import ProcessingTime from "./processing-time";
import CollegeStats from "./college-stats";
import DepotStats from "./depot-stats";

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState<string>("all");

  const { data: overviewData, isLoading: isOverviewLoading, error: overviewError } = useQuery({
    queryKey: ["/api/analytics/applications/status"],
    onError: (error) => console.error("Analytics loading error:", error)
  });

  const { data: timelineData, isLoading: isTimelineLoading } = useQuery({
    queryKey: ["/api/analytics/applications/timeline"],
  });

  const { data: collegesData, isLoading: isCollegesLoading } = useQuery({
    queryKey: ["/api/analytics/colleges/applications"],
  });

  const { data: depotsData, isLoading: isDepotsLoading } = useQuery({
    queryKey: ["/api/analytics/depots/applications"],
  });

  const { data: paymentsData, isLoading: isPaymentsLoading } = useQuery({
    queryKey: ["/api/analytics/payments/summary"],
  });

  const { data: processingTimeData, isLoading: isProcessingTimeLoading } = useQuery({
    queryKey: ["/api/analytics/processing-time"],
  });

  const isLoading = 
    isOverviewLoading || 
    isTimelineLoading || 
    isCollegesLoading || 
    isDepotsLoading || 
    isPaymentsLoading || 
    isProcessingTimeLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto py-10">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate summary statistics
  const totalApplications = overviewData?.total || 0;
  
  // Status counts for summary metrics
  const pendingCount = 
    (overviewData?.statusCounts?.pending || 0) + 
    (overviewData?.statusCounts?.college_verified || 0);
  
  const approvedCount = 
    (overviewData?.statusCounts?.depot_approved || 0) + 
    (overviewData?.statusCounts?.payment_pending || 0) + 
    (overviewData?.statusCounts?.payment_verified || 0);
  
  const issuedCount = overviewData?.statusCounts?.issued || 0;
  
  const rejectedCount = 
    (overviewData?.statusCounts?.college_rejected || 0) + 
    (overviewData?.statusCounts?.depot_rejected || 0);

  // Calculate percentages for summary metrics
  const pendingPercentage = totalApplications > 0 ? Math.round((pendingCount / totalApplications) * 100) : 0;
  const approvedPercentage = totalApplications > 0 ? Math.round((approvedCount / totalApplications) * 100) : 0;
  const issuedPercentage = totalApplications > 0 ? Math.round((issuedCount / totalApplications) * 100) : 0;
  const rejectedPercentage = totalApplications > 0 ? Math.round((rejectedCount / totalApplications) * 100) : 0;

  // Get processing time data
  const avgTotalTime = processingTimeData?.averageProcessingTime?.total || 0;
  const totalRevenue = paymentsData?.totalRevenue || 0;
  const totalPayments = paymentsData?.totalPayments || 0;
  const avgPaymentAmount = paymentsData?.averagePaymentAmount || 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive overview of application processing, approval rates, and financial metrics.
          </p>
        </div>

        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalApplications}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From all sources and statuses
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Processing Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgTotalTime.toFixed(1)} days</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From submission to issuance
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalPayments} payments processed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
                <BarChart4 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{avgPaymentAmount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per concession pass
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status Overview</CardTitle>
              <CardDescription>
                Current status distribution of all submitted applications
              </CardDescription>
              <div className="flex items-center space-x-2 mt-2">
                <Select
                  value={timeRange}
                  onValueChange={(value) => setTimeRange(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                    <SelectItem value="quarter">Past Quarter</SelectItem>
                    <SelectItem value="year">Past Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <StatusChart data={overviewData} />
            </CardContent>
          </Card>

          {/* Timeline Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
              <CardDescription>
                Trend of applications over time by status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <TimelineChart data={timelineData} />
            </CardContent>
          </Card>

          {/* College and Depot Statistics */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    College Statistics
                  </CardTitle>
                  <CardDescription>
                    Application metrics by educational institution
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CollegeStats />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="h-5 w-5" />
                    Depot Statistics
                  </CardTitle>
                  <CardDescription>
                    Application metrics by KSRTC depot
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <DepotStats />
              </CardContent>
            </Card>
          </div>
          
          {/* Detailed Analysis */}
          <Tabs defaultValue="payments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payments">Payment Analytics</TabsTrigger>
              <TabsTrigger value="processing">Processing Time Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="payments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Analytics</CardTitle>
                  <CardDescription>
                    Detailed analysis of payment methods and revenue
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <PaymentChart data={paymentsData} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="processing" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Processing Time Analysis</CardTitle>
                  <CardDescription>
                    Time spent in each stage of the application process
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ProcessingTime data={processingTimeData} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AnalyticsDashboard;