import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowUpDown, Search } from "lucide-react";
import { ApplicationStatus } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Type definitions for API responses
interface DepotStats {
  depotId: number;
  depotName: string;
  totalApplications: number;
  avgProcessingDays: number;
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

// Format a time duration in days
function formatProcessingTime(days: number): string {
  if (days === 0) return "< 1 day";
  if (days === 1) return "1 day";
  return `${days.toFixed(1)} days`;
}

// Get a performance rating based on processing time
function getPerformanceRating(days: number): { label: string; color: string } {
  if (days < 5) return { label: "Excellent", color: "bg-green-100 text-green-800" };
  if (days < 10) return { label: "Good", color: "bg-blue-100 text-blue-800" };
  if (days < 15) return { label: "Average", color: "bg-yellow-100 text-yellow-800" };
  return { label: "Slow", color: "bg-red-100 text-red-800" };
}

export default function DepotsAnalytics() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof DepotStats>("totalApplications");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch depot analytics
  const { data: depotStats, isLoading } = useQuery<DepotStats[]>({
    queryKey: ["/api/analytics/depots/applications"],
  });

  // Filter and sort depots based on search query and sort settings
  const filteredDepots = depotStats 
    ? depotStats
        .filter(depot => 
          depot.depotName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          if (sortKey === "depotName") {
            return sortDirection === "asc" 
              ? a.depotName.localeCompare(b.depotName)
              : b.depotName.localeCompare(a.depotName);
          } else {
            const valA = a[sortKey] as number;
            const valB = b[sortKey] as number;
            return sortDirection === "asc" ? valA - valB : valB - valA;
          }
        })
    : [];

  // Handle sort click
  const handleSortClick = (key: keyof DepotStats) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  // Calculate overall performance metrics
  const overallMetrics = depotStats ? {
    totalDepots: depotStats.length,
    totalApplications: depotStats.reduce((sum, depot) => sum + depot.totalApplications, 0),
    avgProcessingDays: depotStats.length > 0 
      ? depotStats.reduce((sum, depot) => sum + (depot.avgProcessingDays * depot.statusCounts[ApplicationStatus.ISSUED] || 0), 0) / 
        Math.max(depotStats.reduce((sum, depot) => sum + (depot.statusCounts[ApplicationStatus.ISSUED] || 0), 0), 1)
      : 0,
    issuedApplications: depotStats.reduce((sum, depot) => sum + (depot.statusCounts[ApplicationStatus.ISSUED] || 0), 0),
    fastestDepot: depotStats.reduce((fastest, depot) => 
      depot.avgProcessingDays > 0 && (fastest === null || depot.avgProcessingDays < fastest.avgProcessingDays) 
        ? depot 
        : fastest, 
      null as DepotStats | null
    )
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
        <h1 className="text-3xl font-bold">Depot Performance Analytics</h1>
      </div>

      {/* Overall Performance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Depot Performance Overview</CardTitle>
          <CardDescription>
            Key metrics across all depots
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
          ) : overallMetrics ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Total Depots"
                value={overallMetrics.totalDepots}
                description="Number of depots in the system"
              />
              <StatCard 
                title="Average Processing Time"
                value={formatProcessingTime(overallMetrics.avgProcessingDays)}
                description="Avg. days from application to issuance"
              />
              <StatCard 
                title="Issued Concessions"
                value={overallMetrics.issuedApplications}
                description="Total concessions issued by all depots"
              />
              <StatCard 
                title="Fastest Depot"
                value={overallMetrics.fastestDepot?.depotName || "N/A"}
                description={overallMetrics.fastestDepot ? 
                  `Avg. processing time: ${formatProcessingTime(overallMetrics.fastestDepot.avgProcessingDays)}` :
                  "No data available"
                }
              />
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Depot Table */}
      <Card>
        <CardHeader>
          <CardTitle>Depot Performance Comparison</CardTitle>
          <CardDescription>
            Detailed performance metrics for each depot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute w-4 h-4 text-muted-foreground left-3 top-3" />
              <Input
                placeholder="Search depots..."
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
          ) : filteredDepots.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSortClick("depotName")}
                        className="flex items-center font-semibold"
                      >
                        Depot
                        {sortKey === "depotName" && (
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
                      <Button
                        variant="ghost"
                        onClick={() => handleSortClick("avgProcessingDays")}
                        className="flex items-center font-semibold"
                      >
                        Avg. Processing Time
                        {sortKey === "avgProcessingDays" && (
                          <ArrowUpDown className="w-4 h-4 ml-2" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepots.map((depot) => {
                    const performance = getPerformanceRating(depot.avgProcessingDays);
                    return (
                      <TableRow key={depot.depotId}>
                        <TableCell className="font-medium">
                          {depot.depotName}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{depot.totalApplications}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <div className="text-xs text-muted-foreground">
                              {depot.statusCounts[ApplicationStatus.PENDING] || 0} pending
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {depot.statusCounts[ApplicationStatus.ISSUED] || 0} issued
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {depot.avgProcessingDays > 0 ? (
                            <div>{formatProcessingTime(depot.avgProcessingDays)}</div>
                          ) : (
                            <div className="text-muted-foreground">No data</div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Based on {depot.statusCounts[ApplicationStatus.ISSUED] || 0} issued concessions
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {depot.avgProcessingDays > 0 ? (
                            <Badge className={performance.color}>
                              {performance.label}
                            </Badge>
                          ) : (
                            <div className="text-muted-foreground">N/A</div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No depots found matching your search.
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