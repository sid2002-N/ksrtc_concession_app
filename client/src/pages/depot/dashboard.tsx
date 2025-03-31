import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { Card } from "@/components/ui/card";
import { QuickActionsCard } from "@/components/dashboard/quick-actions";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Application, ApplicationStatus } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";
import { ApplicationTable } from "@/components/dashboard/application-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function DepotDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");

  // Get applications for approval (college verified)
  const { data: pendingApplications, isLoading: isLoadingPending, error: pendingError } = useQuery<Application[]>({
    queryKey: ["/api/applications", { status: ApplicationStatus.COLLEGE_VERIFIED }],
  });

  // Get applications for payment verification
  const { data: paymentApplications, isLoading: isLoadingPayment, error: paymentError } = useQuery<Application[]>({
    queryKey: ["/api/applications", { status: ApplicationStatus.PAYMENT_PENDING }],
  });

  // Get applications for issuance
  const { data: issuanceApplications, isLoading: isLoadingIssuance, error: issuanceError } = useQuery<Application[]>({
    queryKey: ["/api/applications", { status: ApplicationStatus.PAYMENT_VERIFIED }],
  });

  // Get all applications for the depot (for statistics)
  const { data: allApplications } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (user.userType !== "depot") {
    return <Redirect to="/" />;
  }

  // Calculate stats
  const pendingCount = pendingApplications?.length || 0;
  const paymentPendingCount = paymentApplications?.length || 0;
  const readyToIssueCount = issuanceApplications?.length || 0;
  const issuedCount = allApplications?.filter(app => app.status === ApplicationStatus.ISSUED).length || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                KSRTC Depot Dashboard
              </h1>
              {user && (
                <p className="mt-1 text-gray-500">
                  Welcome, Depot Officer
                </p>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="p-6 bg-white shadow">
              <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
              <p className="mt-2 text-3xl font-bold text-primary-600">{pendingCount}</p>
              <p className="mt-1 text-sm text-gray-500">Applications awaiting approval</p>
            </Card>
            
            <Card className="p-6 bg-white shadow">
              <h3 className="text-lg font-medium text-gray-900">Payment Verification</h3>
              <p className="mt-2 text-3xl font-bold text-amber-600">{paymentPendingCount}</p>
              <p className="mt-1 text-sm text-gray-500">Payments pending verification</p>
            </Card>
            
            <Card className="p-6 bg-white shadow">
              <h3 className="text-lg font-medium text-gray-900">Ready to Issue</h3>
              <p className="mt-2 text-3xl font-bold text-emerald-600">{readyToIssueCount}</p>
              <p className="mt-1 text-sm text-gray-500">Applications ready for issuance</p>
            </Card>
            
            <Card className="p-6 bg-white shadow">
              <h3 className="text-lg font-medium text-gray-900">Issued</h3>
              <p className="mt-2 text-3xl font-bold text-green-600">{issuedCount}</p>
              <p className="mt-1 text-sm text-gray-500">Concessions issued</p>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Applications Table with Tabs */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
                  <TabsTrigger value="payment">Payment Verification</TabsTrigger>
                  <TabsTrigger value="issuance">Ready to Issue</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending">
                  {isLoadingPending ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                    </div>
                  ) : pendingError ? (
                    <Card className="p-6 bg-red-50 border border-red-200">
                      <h3 className="text-lg font-medium text-red-800">Error loading applications</h3>
                      <p className="mt-2 text-sm text-red-700">
                        We encountered a problem loading the applications. Please try refreshing the page.
                      </p>
                    </Card>
                  ) : (
                    <ApplicationTable 
                      userType="depot" 
                      applications={pendingApplications || []} 
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="payment">
                  {isLoadingPayment ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                    </div>
                  ) : paymentError ? (
                    <Card className="p-6 bg-red-50 border border-red-200">
                      <h3 className="text-lg font-medium text-red-800">Error loading applications</h3>
                      <p className="mt-2 text-sm text-red-700">
                        We encountered a problem loading the applications. Please try refreshing the page.
                      </p>
                    </Card>
                  ) : (
                    <ApplicationTable 
                      userType="depot" 
                      applications={paymentApplications || []} 
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="issuance">
                  {isLoadingIssuance ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                    </div>
                  ) : issuanceError ? (
                    <Card className="p-6 bg-red-50 border border-red-200">
                      <h3 className="text-lg font-medium text-red-800">Error loading applications</h3>
                      <p className="mt-2 text-sm text-red-700">
                        We encountered a problem loading the applications. Please try refreshing the page.
                      </p>
                    </Card>
                  ) : (
                    <ApplicationTable 
                      userType="depot" 
                      applications={issuanceApplications || []} 
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <QuickActionsCard userType="depot" />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
