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

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", 
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042"
];

const CollegeStats = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/analytics/colleges/applications"],
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
        Error loading college statistics
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        No college statistics available
      </div>
    );
  }

  // Filter colleges based on search term
  const filteredColleges = searchTerm 
    ? data.filter((college: any) => 
        college.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : data;

  // Sort colleges by total applications
  const sortedColleges = [...filteredColleges].sort((a: any, b: any) => 
    b.totalApplications - a.totalApplications
  );

  // Limit to top 10 for the chart
  const topColleges = sortedColleges.slice(0, 10);

  // Data for the bar chart
  const collegeBarData = topColleges.map((college: any) => ({
    name: college.name.length > 20 ? college.name.substring(0, 20) + '...' : college.name,
    total: college.totalApplications,
    verified: college.statusCounts.college_verified || 0,
    rejected: college.statusCounts.college_rejected || 0,
    collegeId: college.id
  }));

  // Data for the pie chart
  const districtsData: Record<string, number> = {};
  
  sortedColleges.forEach((college: any) => {
    const district = college.district || "Unknown";
    if (districtsData[district]) {
      districtsData[district] += college.totalApplications;
    } else {
      districtsData[district] = college.totalApplications;
    }
  });
  
  const districtPieData = Object.entries(districtsData).map(([district, count]) => ({
    name: district,
    value: count
  }));

  return (
    <Tabs defaultValue="comparison" className="w-full">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="comparison">College Comparison</TabsTrigger>
          <TabsTrigger value="districts">District Distribution</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>
        
        <div className="relative">
          <Input
            type="text"
            placeholder="Search colleges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      <TabsContent value="comparison" className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={collegeBarData}
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
            <Bar dataKey="verified" name="Verified" fill="#82ca9d" />
            <Bar dataKey="rejected" name="Rejected" fill="#ff8042" />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="districts" className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={districtPieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {districtPieData.map((entry, index) => (
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
                <TableHead>College Name</TableHead>
                <TableHead>District</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Verified</TableHead>
                <TableHead className="text-right">Rejected</TableHead>
                <TableHead className="text-right">Verification Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedColleges.map((college: any) => {
                const verified = college.statusCounts.college_verified || 0;
                const rejected = college.statusCounts.college_rejected || 0;
                const total = college.totalApplications || 0;
                const verificationRate = total > 0 
                  ? (verified / total * 100).toFixed(1)
                  : "0.0";
                
                return (
                  <TableRow key={college.id}>
                    <TableCell className="font-medium">{college.name}</TableCell>
                    <TableCell>{college.district || "Unknown"}</TableCell>
                    <TableCell className="text-right">{total}</TableCell>
                    <TableCell className="text-right">{verified}</TableCell>
                    <TableCell className="text-right">{rejected}</TableCell>
                    <TableCell className="text-right">{verificationRate}%</TableCell>
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

export default CollegeStats;