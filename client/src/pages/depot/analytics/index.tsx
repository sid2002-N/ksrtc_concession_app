import React from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationStatus } from "@shared/schema";
import { 
  BarChart3, 
  Building2, 
  Calendar, 
  ChevronRight, 
  ClipboardList, 
  Clock, 
  CreditCard,
  FileBarChart,
  TrendingUp, 
  User
} from "lucide-react";

// Type definitions for API responses
interface ApplicationStats {
  totalApplications: number;
  statusCounts: Record<ApplicationStatus, number>;
  applicationsByMonth: Record<string, number>;
}

export default function AnalyticsDashboard() {
  // Fetch application analytics
  const { data: appStats, isLoading: isLoadingAppStats } = useQuery<ApplicationStats>({
    queryKey: ["/api/analytics/applications/status"],
  });

  // Calculate some derived metrics
  const metrics = appStats ? {
    pendingVerification: appStats.statusCounts[ApplicationStatus.PENDING] || 0,
    pendingPayment: appStats.statusCounts[ApplicationStatus.PAYMENT_PENDING] || 0,
    issued: appStats.statusCounts[ApplicationStatus.ISSUED] || 0,
    rejected: (appStats.statusCounts[ApplicationStatus.COLLEGE_REJECTED] || 0) + 
              (appStats.statusCounts[ApplicationStatus.DEPOT_REJECTED] || 0),
    processingRate: appStats.totalApplications > 0 ? 
      ((appStats.statusCounts[ApplicationStatus.ISSUED] || 0) / appStats.totalApplications) * 100 : 0,
    rejectionRate: appStats.totalApplications > 0 ? 
      (((appStats.statusCounts[ApplicationStatus.COLLEGE_REJECTED] || 0) + 
        (appStats.statusCounts[ApplicationStatus.DEPOT_REJECTED] || 0)) / 
        appStats.totalApplications) * 100 : 0
  } : null;

  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold">Analytics Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        {isLoadingAppStats ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : appStats ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Applications
                </CardTitle>
                <ClipboardList className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appStats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">
                  All time application count
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Concessions Issued
                </CardTitle>
                <FileBarChart className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.issued || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics && appStats.totalApplications > 0 
                    ? `${(metrics.processingRate).toFixed(1)}% processing rate`
                    : "No applications processed yet"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Verification
                </CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.pendingVerification || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Applications awaiting review
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Awaiting Payment
                </CardTitle>
                <CreditCard className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.pendingPayment || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Approved but unpaid applications
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="col-span-4 p-6 text-center text-muted-foreground">
            No application data available
          </div>
        )}
      </div>

      {/* Analytics Modules */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnalyticsCard
          title="Application Status"
          description="Track application status distribution"
          icon={<ClipboardList className="w-5 h-5" />}
          linkTo="/admin/analytics/applications"
        />
        <AnalyticsCard
          title="College Performance"
          description="Analyze verification rates by college"
          icon={<Building2 className="w-5 h-5" />}
          linkTo="/admin/analytics/colleges"
        />
        <AnalyticsCard
          title="Depot Performance"
          description="Compare processing efficiency across depots"
          icon={<FileBarChart className="w-5 h-5" />}
          linkTo="/admin/analytics/depots"
        />
        <AnalyticsCard
          title="Payment Analytics"
          description="Track revenue and payment methods"
          icon={<CreditCard className="w-5 h-5" />}
          linkTo="/admin/analytics/payments"
        />
        <AnalyticsCard
          title="Processing Time"
          description="Analyze application processing timeline"
          icon={<Clock className="w-5 h-5" />}
          linkTo="/admin/analytics/processing"
        />
        <AnalyticsCard
          title="Student Demographics"
          description="View student distribution by college and course"
          icon={<User className="w-5 h-5" />}
          linkTo="/admin/analytics/students"
        />
      </div>

      {/* Application Trends */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Application Trends</CardTitle>
          <CardDescription>
            Monthly application volume over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAppStats ? (
            <Skeleton className="h-[200px]" />
          ) : appStats && appStats.applicationsByMonth && 
               Object.keys(appStats.applicationsByMonth).length > 0 ? (
            <div className="p-2 h-[200px] flex items-end gap-2">
              {Object.entries(appStats.applicationsByMonth)
                .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
                .map(([month, count]) => {
                  const dateParts = month.split('-');
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const monthName = monthNames[parseInt(dateParts[1]) - 1];
                  const displayMonth = `${monthName} ${dateParts[0]}`;
                  
                  const maxCount = Math.max(...Object.values(appStats.applicationsByMonth));
                  const height = (count / maxCount) * 100;
                  
                  return (
                    <div key={month} className="flex flex-col items-center flex-1">
                      <div className="w-full px-1">
                        <div 
                          className="w-full bg-primary/90 rounded-t" 
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">{displayMonth}</div>
                      <div className="text-xs font-medium">{count}</div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No monthly data available
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="ghost" asChild>
            <Link href="/admin/analytics/applications">
              View detailed trends
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Component for analytics card
function AnalyticsCard({ 
  title, 
  description, 
  icon, 
  linkTo 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  linkTo: string 
}) {
  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <Link href={linkTo}>
        <CardHeader className="flex flex-row items-start space-x-4 cursor-pointer">
          <div className="p-2 bg-primary/10 rounded-md">
            {icon}
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        <CardFooter>
          <Button variant="ghost" className="w-full justify-between" asChild>
            <div>
              <span>View analytics</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}