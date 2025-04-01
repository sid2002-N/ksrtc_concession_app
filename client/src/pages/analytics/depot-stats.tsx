import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DepotStats() {
  const { data: depotStats, isLoading, error } = useQuery({
    queryKey: ["/api/analytics/depots/applications"],
  });

  if (isLoading) {
    return <Skeleton className="h-[200px]" />;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading depot statistics
      </div>
    );
  }

  // Add nullish coalescing operator to handle potential undefined values
  const depotStatsLength = depotStats?.length ?? 0;

  if (depotStatsLength === 0) {
    return (
      <div className="p-4 text-muted-foreground">
        No depot statistics available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {depotStats.map((depot) => (
        <Card key={depot.depotId}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{depot.depotName}</h3>
              <span className="text-sm text-muted-foreground">
                {depot.totalApplications} applications
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}