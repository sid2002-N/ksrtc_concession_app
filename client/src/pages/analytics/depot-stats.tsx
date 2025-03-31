import React, { useState } from "react";
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
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ApplicationStatus } from "@shared/schema";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", 
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042"
];

const statusLabels: Record<string, string> = {
  [ApplicationStatus.DEPOT_APPROVED]: "Approved",
  [ApplicationStatus.DEPOT_REJECTED]: "Rejected",
  [ApplicationStatus.PAYMENT_PENDING]: "Payment Pending",
  [ApplicationStatus.PAYMENT_VERIFIED]: "Payment Verified",
  [ApplicationStatus.ISSUED]: "Issued",
};

const DepotStats = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/analytics/depots/applications"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Error loading depot statistics
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        No depot statistics available
      </div>
    );
  }

  // Filter depots based on search term
  const filteredDepots = searchTerm 
    ? data.filter((depot: any) => 
        depot.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : data;

  // Sort depots by total applications
  const sortedDepots = [...filteredDepots].sort((a: any, b: any) => 
    b.totalApplications - a.totalApplications
  );

  // Limit to top 10 for the chart
  const topDepots = sortedDepots.slice(0, 10);

  // Data for the depot bar chart
  const depotBarData = topDepots.map((depot: any) => ({
    name: depot.name.length > 20 ? depot.name.substring(0, 20) + '...' : depot.name,
    total: depot.totalApplications,
    approved: depot.statusCounts.depot_approved || 0,
    rejected: depot.statusCounts.depot_rejected || 0,
    issued: depot.statusCounts.issued || 0,
    depotId: depot.id
  }));

  // Data for approval rate pie chart
  const totalApproved = sortedDepots.reduce((acc: number, depot: any) => 
    acc + (depot.statusCounts.depot_approved || 0), 0);
  
  const totalRejected = sortedDepots.reduce((acc: number, depot: any) => 
    acc + (depot.statusCounts.depot_rejected || 0), 0);
  
  const totalPending = sortedDepots.reduce((acc: number, depot: any) => 
    acc + ((depot.totalApplications || 0) - 
    (depot.statusCounts.depot_approved || 0) - 
    (depot.statusCounts.depot_rejected || 0)), 0);

  const approvalPieData = [
    { name: "Approved", value: totalApproved },
    { name: "Rejected", value: totalRejected },
    { name: "Pending", value: totalPending }
  ].filter(item => item.value > 0);

  // Data for locations pie chart
  const locationsData: Record<string, number> = {};
  
  sortedDepots.forEach((depot: any) => {
    const location = depot.location || "Unknown";
    if (locationsData[location]) {
      locationsData[location] += depot.totalApplications;
    } else {
      locationsData[location] = depot.totalApplications;
    }
  });
  
  const locationsPieData = Object.entries(locationsData).map(([location, count]) => ({
    name: location,
    value: count
  }));

  return (
    <Tabs defaultValue="comparison" className="w-full">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="comparison">Depot Comparison</TabsTrigger>
          <TabsTrigger value="approval">Approval Rates</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>
        
        <div className="relative">
          <Input
            type="text"
            placeholder="Search depots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      <TabsContent value="comparison" className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={depotBarData}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={80} 
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" name="Total Applications" fill="#8884d8" />
            <Bar dataKey="approved" name="Approved" fill="#82ca9d" />
            <Bar dataKey="rejected" name="Rejected" fill="#ff8042" />
            <Bar dataKey="issued" name="Passes Issued" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="approval" className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={approvalPieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {approvalPieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={
                  entry.name === "Approved" ? "#82ca9d" :
                  entry.name === "Rejected" ? "#ff8042" : "#8884d8"
                } />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} applications`]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="locations" className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={locationsPieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {locationsPieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} applications`]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="table">
        <div className="h-80 overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Depot Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Approved</TableHead>
                <TableHead className="text-right">Rejected</TableHead>
                <TableHead className="text-right">Approval Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDepots.map((depot: any) => {
                const approved = depot.statusCounts.depot_approved || 0;
                const rejected = depot.statusCounts.depot_rejected || 0;
                const total = depot.totalApplications || 0;
                const approvalRate = total > 0 
                  ? (approved / total * 100).toFixed(1)
                  : "0.0";
                
                return (
                  <TableRow key={depot.id}>
                    <TableCell className="font-medium">{depot.name}</TableCell>
                    <TableCell>{depot.location || "Unknown"}</TableCell>
                    <TableCell className="text-right">{total}</TableCell>
                    <TableCell className="text-right">{approved}</TableCell>
                    <TableCell className="text-right">{rejected}</TableCell>
                    <TableCell className="text-right">{approvalRate}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default DepotStats;