import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowUpDown, PieChart, Search } from "lucide-react";
import { ApplicationStatus } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

// Type definitions for API responses
interface CollegeStats {
  collegeId: number;
  collegeName: string;
  totalApplications: number;
  statusCounts: Record<string, number>;
}

// Generate a color based on status
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "#FFA500", // Orange
    college_verified: "#3498db", // Blue
    college_rejected: "#e74c3c", // Red
    depot_approved: "#2ecc71", // Green
    depot_rejected: "#e74c3c", // Red
    payment_pending: "#f39c12", // Dark Yellow
    payment_verified: "#9b59b6", // Purple
    issued: "#27ae60", // Dark Green
  };
  return colors[status] || "#95a5a6"; // Default to gray
}

export default function CollegesAnalytics() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof CollegeStats>("totalApplications");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch college analytics
  const { data: collegeStats, isLoading } = useQuery<CollegeStats[]>({
    queryKey: ["/api/analytics/colleges/applications"],
  });

  // Filter and sort colleges based on search query and sort settings
  const filteredColleges = collegeStats 
    ? collegeStats
        .filter(college => 
          college.collegeName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          if (sortKey === "collegeName") {
            return sortDirection === "asc" 
              ? a.collegeName.localeCompare(b.collegeName)
              : b.collegeName.localeCompare(a.collegeName);
          } else {
            const valA = a[sortKey] as number;
            const valB = b[sortKey] as number;
            return sortDirection === "asc" ? valA - valB : valB - valA;
          }
        })
    : [];

  // Handle sort click
  const handleSortClick = (key: keyof CollegeStats) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  // Calculate overall stats
  const overallStats = collegeStats ? {
    totalColleges: collegeStats.length,
    totalApplications: collegeStats.reduce((sum, college) => sum + college.totalApplications, 0),
    averageApplications: collegeStats.length > 0 
      ? collegeStats.reduce((sum, college) => sum + college.totalApplications, 0) / collegeStats.length
      : 0,
    collegesWithNoApplications: collegeStats.filter(college => college.totalApplications === 0).length,
    maxApplications: Math.max(...collegeStats.map(college => college.totalApplications)),
  } : null;

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href="/admin/analytics">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">College Analytics</h1>
      </div>

      {/* Overall Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>College Application Overview</CardTitle>
          <CardDescription>
            Key statistics about applications across colleges
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : overallStats ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Total Colleges"
                value={overallStats.totalColleges}
                description="Number of colleges in the system"
              />
              <StatCard 
                title="Total Applications"
                value={overallStats.totalApplications}
                description="Applications across all colleges"
              />
              <StatCard 
                title="Average Applications"
                value={overallStats.averageApplications.toFixed(1)}
                description="Average applications per college"
              />
              <StatCard 
                title="Inactive Colleges"
                value={overallStats.collegesWithNoApplications}
                description="Colleges with no applications"
              />
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* College Table */}
      <Card>
        <CardHeader>
          <CardTitle>College Application Statistics</CardTitle>
          <CardDescription>
            Detailed application stats for each college
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute w-4 h-4 text-muted-foreground left-3 top-3" />
              <Input
                placeholder="Search colleges..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
            </div>
          ) : filteredColleges.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">
                      <Button
                        variant="ghost"
                        onClick={() => handleSortClick("collegeName")}
                        className="flex items-center font-semibold"
                      >
                        College
                        {sortKey === "collegeName" && (
                          <ArrowUpDown className="w-4 h-4 ml-2" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSortClick("totalApplications")}
                        className="flex items-center font-semibold"
                      >
                        Applications
                        {sortKey === "totalApplications" && (
                          <ArrowUpDown className="w-4 h-4 ml-2" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Status Distribution
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredColleges.map((college) => (
                    <TableRow key={college.collegeId}>
                      <TableCell className="font-medium">
                        {college.collegeName}
                      </TableCell>
                      <TableCell>
                        {college.totalApplications}
                        {overallStats && (
                          <div className="text-xs text-muted-foreground">
                            {((college.totalApplications / overallStats.totalApplications) * 100).toFixed(1)}% of total
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center h-2 gap-0.5">
                          {[
                            ApplicationStatus.PENDING,
                            ApplicationStatus.COLLEGE_VERIFIED,
                            ApplicationStatus.DEPOT_APPROVED,
                            ApplicationStatus.PAYMENT_VERIFIED,
                            ApplicationStatus.ISSUED,
                            ApplicationStatus.COLLEGE_REJECTED,
                            ApplicationStatus.DEPOT_REJECTED,
                          ].map((status) => (
                            <div
                              key={status}
                              className="h-full"
                              style={{
                                backgroundColor: getStatusColor(status),
                                width: `${
                                  (college.statusCounts[status] || 0) /
                                  Math.max(college.totalApplications, 1) *
                                  100
                                }%`,
                                minWidth: college.statusCounts[status] ? '4px' : '0'
                              }}
                              title={`${status.replace('_', ' ')}: ${
                                college.statusCounts[status] || 0
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex mt-2 space-x-2 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <div
                              className="w-2 h-2 mr-1 rounded-full"
                              style={{ backgroundColor: getStatusColor(ApplicationStatus.ISSUED) }}
                            />
                            <span>
                              {college.statusCounts[ApplicationStatus.ISSUED] || 0} issued
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div
                              className="w-2 h-2 mr-1 rounded-full"
                              style={{ backgroundColor: getStatusColor(ApplicationStatus.COLLEGE_REJECTED) }}
                            />
                            <span>
                              {
                                (college.statusCounts[ApplicationStatus.COLLEGE_REJECTED] || 0) +
                                (college.statusCounts[ApplicationStatus.DEPOT_REJECTED] || 0)
                              } rejected
                            </span>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No colleges found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Component for stats cards
function StatCard({ title, value, description }: { 
  title: string; 
  value: string | number; 
  description: string;
}) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
  );
}