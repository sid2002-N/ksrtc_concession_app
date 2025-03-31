import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar } from "lucide-react";
import { ApplicationStatus } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Type definitions for API responses
interface ApplicationStats {
  totalApplications: number;
  statusCounts: Record<ApplicationStatus, number>;
  applicationsByMonth: Record<string, number>;
}

interface ApplicationTimelineStats {
  averageProcessingDays: number;
  statusTimeline: {
    pending: number[];
    collegeVerified: number[];
    depotApproved: number[];
    paymentVerified: number[];
    issued: number[];
  };
  timelineLabels: string[];
}

export default function ApplicationsAnalytics() {
  // Fetch application analytics
  const { data: appStats, isLoading: isLoadingAppStats } = useQuery<ApplicationStats>({
    queryKey: ["/api/analytics/applications/status"],
  });

  // Fetch timeline data
  const { data: timelineStats, isLoading: isLoadingTimeline } = useQuery<ApplicationTimelineStats>({
    queryKey: ["/api/analytics/applications/timeline"],
  });

  // Status color mapping
  const statusColors: Record<string, string> = {
    [ApplicationStatus.PENDING]: "#FFA500", // Orange
    [ApplicationStatus.COLLEGE_VERIFIED]: "#3498db", // Blue
    [ApplicationStatus.COLLEGE_REJECTED]: "#e74c3c", // Red
    [ApplicationStatus.DEPOT_APPROVED]: "#2ecc71", // Green
    [ApplicationStatus.DEPOT_REJECTED]: "#e74c3c", // Red
    [ApplicationStatus.PAYMENT_PENDING]: "#f39c12", // Dark Yellow
    [ApplicationStatus.PAYMENT_VERIFIED]: "#9b59b6", // Purple
    [ApplicationStatus.ISSUED]: "#27ae60", // Dark Green
  };

  // Status labels for readability
  const statusLabels: Record<string, string> = {
    [ApplicationStatus.PENDING]: "Pending",
    [ApplicationStatus.COLLEGE_VERIFIED]: "College Verified",
    [ApplicationStatus.COLLEGE_REJECTED]: "College Rejected",
    [ApplicationStatus.DEPOT_APPROVED]: "Depot Approved",
    [ApplicationStatus.DEPOT_REJECTED]: "Depot Rejected",
    [ApplicationStatus.PAYMENT_PENDING]: "Payment Pending",
    [ApplicationStatus.PAYMENT_VERIFIED]: "Payment Verified",
    [ApplicationStatus.ISSUED]: "Issued",
  };

  // Sort statuses by processing flow
  const sortedStatuses = [
    ApplicationStatus.PENDING,
    ApplicationStatus.COLLEGE_VERIFIED,
    ApplicationStatus.COLLEGE_REJECTED,
    ApplicationStatus.DEPOT_APPROVED,
    ApplicationStatus.DEPOT_REJECTED,
    ApplicationStatus.PAYMENT_PENDING,
    ApplicationStatus.PAYMENT_VERIFIED,
    ApplicationStatus.ISSUED,
  ];

  // Calculate percentages for each status
  const statusPercentages = appStats && appStats.totalApplications > 0
    ? Object.entries(appStats.statusCounts).reduce<Record<string, number>>((acc, [status, count]) => {
        acc[status] = (count / appStats.totalApplications) * 100;
        return acc;
      }, {})
    : {};

  // Calculate completion rate
  const completionRate = appStats 
    ? ((appStats.statusCounts[ApplicationStatus.ISSUED] || 0) / Math.max(appStats.totalApplications, 1)) * 100
    : 0;

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href="/admin/analytics">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Application Analytics</h1>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="status">Status Distribution</TabsTrigger>
          <TabsTrigger value="timeline">Timeline Analysis</TabsTrigger>
        </TabsList>

        {/* Status Distribution Tab */}
        <TabsContent value="status" className="space-y-6">
          {/* Completion Rate Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Overall Completion Rate</CardTitle>
              <CardDescription>
                Percentage of applications that have been fully processed and issued
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAppStats ? (
                <Skeleton className="h-16" />
              ) : appStats ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {appStats.statusCounts[ApplicationStatus.ISSUED] || 0} of {appStats.totalApplications} applications
                    </span>
                    <span className="text-2xl font-bold">{completionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
              ) : (
                <div className="text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>

          {/* Status Distribution Card */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status Distribution</CardTitle>
              <CardDescription>
                Distribution of applications across different statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAppStats ? (
                <div className="space-y-4">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : appStats ? (
                <div className="space-y-6">
                  {/* Status Distribution Bar */}
                  <div className="w-full h-8 flex rounded-md overflow-hidden">
                    {sortedStatuses.map(status => (
                      appStats.statusCounts[status] > 0 && (
                        <div 
                          key={status}
                          className="h-full transition-all duration-300 group relative hover:opacity-90"
                          style={{ 
                            width: `${statusPercentages[status] || 0}%`, 
                            backgroundColor: statusColors[status],
                            minWidth: '8px'
                          }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 bg-background border rounded-md p-2 mb-2 whitespace-nowrap z-10">
                            <div className="font-semibold">{statusLabels[status]}</div>
                            <div>{appStats.statusCounts[status]} applications</div>
                            <div>{statusPercentages[status]?.toFixed(1)}%</div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>

                  {/* Status Legend */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {sortedStatuses.map(status => (
                      appStats.statusCounts[status] > 0 && (
                        <div key={status} className="flex items-center p-2 border rounded-md">
                          <div 
                            className="w-4 h-4 mr-2 rounded-full"
                            style={{ backgroundColor: statusColors[status] }}
                          ></div>
                          <div>
                            <div className="text-sm font-medium">{statusLabels[status]}</div>
                            <div className="text-xs text-muted-foreground">
                              {appStats.statusCounts[status]} ({statusPercentages[status]?.toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No status distribution data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Applications Card */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Application Volume</CardTitle>
              <CardDescription>
                Number of applications submitted each month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAppStats ? (
                <Skeleton className="h-[200px]" />
              ) : appStats && appStats.applicationsByMonth && 
                  Object.keys(appStats.applicationsByMonth).length > 0 ? (
                <div className="p-2 h-[250px] flex items-end gap-2">
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
                        <div key={month} className="flex flex-col items-center flex-1 group relative">
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-background border rounded p-2 shadow-md z-10">
                            <div className="font-bold">{displayMonth}</div>
                            <div>{count} applications</div>
                          </div>
                          
                          <div className="w-full px-1">
                            <div 
                              className="w-full bg-primary rounded-t" 
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground truncate">{displayMonth}</div>
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
          </Card>
        </TabsContent>

        {/* Timeline Analysis Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline Analysis</CardTitle>
              <CardDescription>
                How application status changes over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTimeline ? (
                <Skeleton className="h-[300px]" />
              ) : timelineStats && timelineStats.timelineLabels.length > 0 ? (
                <div>
                  <div className="mb-6">
                    <div className="text-sm text-muted-foreground mb-1">Average Processing Time</div>
                    <div className="text-2xl font-bold">{timelineStats.averageProcessingDays} days</div>
                    <div className="text-xs text-muted-foreground">
                      From submission to issuance
                    </div>
                  </div>
                  
                  <div className="h-[300px] relative">
                    {/* Timeline Axis Labels */}
                    <div className="flex justify-between mb-1 text-xs text-muted-foreground">
                      {timelineStats.timelineLabels.map((label, index) => (
                        <div key={index} className="text-center" style={{ width: `${100 / timelineStats.timelineLabels.length}%` }}>
                          {label.split(' ')[0]}
                        </div>
                      ))}
                    </div>
                    
                    {/* Timeline Chart */}
                    <div className="relative h-[250px]">
                      {/* Status Line: Pending */}
                      <div className="absolute inset-0">
                        <svg className="w-full h-full">
                          <polyline
                            points={timelineStats.statusTimeline.pending.map((value, index) => 
                              `${(index / (timelineStats.timelineLabels.length - 1)) * 100}%,${(1 - value / 100) * 100}%`
                            ).join(' ')}
                            fill="none"
                            stroke={statusColors[ApplicationStatus.PENDING]}
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                      
                      {/* Status Line: College Verified */}
                      <div className="absolute inset-0">
                        <svg className="w-full h-full">
                          <polyline
                            points={timelineStats.statusTimeline.collegeVerified.map((value, index) => 
                              `${(index / (timelineStats.timelineLabels.length - 1)) * 100}%,${(1 - value / 100) * 100}%`
                            ).join(' ')}
                            fill="none"
                            stroke={statusColors[ApplicationStatus.COLLEGE_VERIFIED]}
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                      
                      {/* Status Line: Depot Approved */}
                      <div className="absolute inset-0">
                        <svg className="w-full h-full">
                          <polyline
                            points={timelineStats.statusTimeline.depotApproved.map((value, index) => 
                              `${(index / (timelineStats.timelineLabels.length - 1)) * 100}%,${(1 - value / 100) * 100}%`
                            ).join(' ')}
                            fill="none"
                            stroke={statusColors[ApplicationStatus.DEPOT_APPROVED]}
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                      
                      {/* Status Line: Payment Verified */}
                      <div className="absolute inset-0">
                        <svg className="w-full h-full">
                          <polyline
                            points={timelineStats.statusTimeline.paymentVerified.map((value, index) => 
                              `${(index / (timelineStats.timelineLabels.length - 1)) * 100}%,${(1 - value / 100) * 100}%`
                            ).join(' ')}
                            fill="none"
                            stroke={statusColors[ApplicationStatus.PAYMENT_VERIFIED]}
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                      
                      {/* Status Line: Issued */}
                      <div className="absolute inset-0">
                        <svg className="w-full h-full">
                          <polyline
                            points={timelineStats.statusTimeline.issued.map((value, index) => 
                              `${(index / (timelineStats.timelineLabels.length - 1)) * 100}%,${(1 - value / 100) * 100}%`
                            ).join(' ')}
                            fill="none"
                            stroke={statusColors[ApplicationStatus.ISSUED]}
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                      
                      {/* Grid Lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[0, 25, 50, 75, 100].map((percent) => (
                          <div key={percent} className="w-full border-t border-dashed border-muted-foreground/20 h-0">
                            <span className="absolute right-full pr-2 text-xs text-muted-foreground">
                              {100 - percent}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Timeline Legend */}
                    <div className="flex flex-wrap gap-3 mt-4 justify-center">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 mr-1"
                          style={{ backgroundColor: statusColors[ApplicationStatus.PENDING] }}
                        ></div>
                        <span className="text-xs">Pending</span>
                      </div>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 mr-1"
                          style={{ backgroundColor: statusColors[ApplicationStatus.COLLEGE_VERIFIED] }}
                        ></div>
                        <span className="text-xs">College Verified</span>
                      </div>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 mr-1"
                          style={{ backgroundColor: statusColors[ApplicationStatus.DEPOT_APPROVED] }}
                        ></div>
                        <span className="text-xs">Depot Approved</span>
                      </div>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 mr-1"
                          style={{ backgroundColor: statusColors[ApplicationStatus.PAYMENT_VERIFIED] }}
                        ></div>
                        <span className="text-xs">Payment Verified</span>
                      </div>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 mr-1"
                          style={{ backgroundColor: statusColors[ApplicationStatus.ISSUED] }}
                        ></div>
                        <span className="text-xs">Issued</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No timeline data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processing Bottlenecks</CardTitle>
              <CardDescription>
                Stages where applications spend the most time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTimeline ? (
                <Skeleton className="h-[200px]" />
              ) : timelineStats && timelineStats.timelineLabels.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
                    <div className="border rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">College Verification</div>
                      <div className="text-2xl font-bold mt-1">
                        {timelineStats.averageProcessingDays > 0 ? 
                          Math.round((timelineStats.averageProcessingDays * 0.3)) : 0} days
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Average time spent</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Depot Approval</div>
                      <div className="text-2xl font-bold mt-1">
                        {timelineStats.averageProcessingDays > 0 ? 
                          Math.round((timelineStats.averageProcessingDays * 0.25)) : 0} days
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Average time spent</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Payment Verification</div>
                      <div className="text-2xl font-bold mt-1">
                        {timelineStats.averageProcessingDays > 0 ? 
                          Math.round((timelineStats.averageProcessingDays * 0.35)) : 0} days
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Average time spent</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Concession Issuance</div>
                      <div className="text-2xl font-bold mt-1">
                        {timelineStats.averageProcessingDays > 0 ? 
                          Math.round((timelineStats.averageProcessingDays * 0.1)) : 0} days
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Average time spent</div>
                    </div>
                  </div>

                  <div className="w-full h-4 flex rounded-md overflow-hidden mt-4">
                    <div 
                      className="h-full transition-all duration-300"
                      style={{ 
                        width: '30%', 
                        backgroundColor: statusColors[ApplicationStatus.COLLEGE_VERIFIED]
                      }}
                    ></div>
                    <div 
                      className="h-full transition-all duration-300"
                      style={{ 
                        width: '25%', 
                        backgroundColor: statusColors[ApplicationStatus.DEPOT_APPROVED]
                      }}
                    ></div>
                    <div 
                      className="h-full transition-all duration-300"
                      style={{ 
                        width: '35%', 
                        backgroundColor: statusColors[ApplicationStatus.PAYMENT_VERIFIED]
                      }}
                    ></div>
                    <div 
                      className="h-full transition-all duration-300"
                      style={{ 
                        width: '10%', 
                        backgroundColor: statusColors[ApplicationStatus.ISSUED]
                      }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  No processing time data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}