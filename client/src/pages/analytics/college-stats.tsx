import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CollegeStats() {
  const { data: collegeStats, isLoading, error } = useQuery({
    queryKey: ["/api/analytics/colleges/applications"],
  });

  if (isLoading) {
    return <Skeleton className="h-[200px]" />;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading college statistics
      </div>
    );
  }

  // Added null check for collegeStats and its length
  if (!collegeStats || collegeStats?.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">
        No college statistics available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {collegeStats.map((college) => (
        <Card key={college.collegeId}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{college.collegeName}</h3>
              <span className="text-sm text-muted-foreground">
                {college.totalApplications} applications
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}