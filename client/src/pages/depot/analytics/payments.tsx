import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BarChart4, IndianRupee, TrendingUp } from "lucide-react";

// Type definitions for API responses
interface PaymentAnalytics {
  totalPayments: number;
  totalRevenue: number;
  averagePaymentAmount: number;
  paymentMethodStats: Record<string, {
    count: number;
    amount: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    amount: number;
  }>;
}

// Format currency in Indian Rupees
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Format a month string (YYYY-MM) to a more readable format
function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export default function PaymentsAnalytics() {
  // Fetch payment analytics
  const { data: paymentStats, isLoading } = useQuery<PaymentAnalytics>({
    queryKey: ["/api/analytics/payments/summary"],
  });

  // Prepare data for charts and visualizations
  const paymentMethods = paymentStats 
    ? Object.entries(paymentStats.paymentMethodStats)
        .map(([method, stats]) => ({
          method,
          count: stats.count,
          amount: stats.amount,
          percentage: (stats.amount / paymentStats.totalRevenue) * 100
        }))
        .sort((a, b) => b.amount - a.amount)
    : [];

  // Get monthly revenue data for visualization
  const months = paymentStats?.monthlyRevenue.map(m => formatMonth(m.month)) || [];
  const revenueData = paymentStats?.monthlyRevenue.map(m => m.amount) || [];
  const maxRevenue = Math.max(...revenueData, 1);

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href="/admin/analytics">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Payment Analytics</h1>
      </div>

      {/* Payment Summary Card */}
      <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 mb-2" />
            ) : paymentStats ? (
              <div className="flex items-center">
                <IndianRupee className="w-8 h-8 mr-2 text-primary" />
                <div className="text-3xl font-bold">
                  {formatCurrency(paymentStats.totalRevenue)}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 mb-2" />
            ) : paymentStats ? (
              <div className="flex items-center">
                <BarChart4 className="w-8 h-8 mr-2 text-primary" />
                <div className="text-3xl font-bold">
                  {paymentStats.totalPayments}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground">Average Payment</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 mb-2" />
            ) : paymentStats ? (
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 mr-2 text-primary" />
                <div className="text-3xl font-bold">
                  {formatCurrency(paymentStats.averagePaymentAmount)}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
          <CardDescription>
            Revenue trends over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[200px]" />
          ) : paymentStats && paymentStats.monthlyRevenue.length > 0 ? (
            <div className="flex flex-col h-[250px]">
              <div className="flex-1 flex items-end gap-1">
                {paymentStats.monthlyRevenue.map((monthData, index) => (
                  <div 
                    key={monthData.month}
                    className="flex-1 flex flex-col items-center group relative"
                  >
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-background border rounded p-2 shadow-md z-10">
                      <div className="font-bold">{formatMonth(monthData.month)}</div>
                      <div>{formatCurrency(monthData.amount)}</div>
                    </div>
                    
                    <div 
                      className="w-4/5 bg-primary rounded-t"
                      style={{ 
                        height: `${(monthData.amount / maxRevenue) * 200}px`,
                        minHeight: monthData.amount > 0 ? '10px' : '0'
                      }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground overflow-hidden">
                {paymentStats.monthlyRevenue.map((monthData) => (
                  <div key={monthData.month} className="truncate">
                    {formatMonth(monthData.month).split(" ")[0]}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              No monthly revenue data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Card */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method Distribution</CardTitle>
          <CardDescription>
            Revenue breakdown by payment method
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : paymentMethods.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {paymentMethods.map((methodData) => (
                  <div key={methodData.method} className="p-4 border rounded-lg">
                    <h3 className="font-medium capitalize">
                      {methodData.method.toLowerCase()}
                    </h3>
                    <div className="text-2xl font-bold mt-1">
                      {formatCurrency(methodData.amount)}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                      <span>{methodData.count} payments</span>
                      <span>{methodData.percentage.toFixed(1)}% of total</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No payment method data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}