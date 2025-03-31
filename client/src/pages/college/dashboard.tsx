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

export default function CollegeDashboard() {
  const { user } = useAuth();

  // Get applications for the college
  const { data: applications, isLoading, error } = useQuery<Application[]>({
    queryKey: ["/api/applications", { status: ApplicationStatus.PENDING }],
  });

  // Get all applications for the college (for statistics)
  const { data: allApplications } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (user.userType !== "college") {
    return <Redirect to="/" />;
  }

  // Calculate stats
  const pendingCount = applications?.length || 0;
  const verifiedCount = allApplications?.filter(app => app.status === ApplicationStatus.COLLEGE_VERIFIED).length || 0;
  const rejectedCount = allApplications?.filter(app => app.status === ApplicationStatus.COLLEGE_REJECTED).length || 0;
  const totalCount = allApplications?.length || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                College Admin Dashboard
              </h1>
              {user && (
                <p className="mt-1 text-gray-500">
                  Welcome, College Admin
                </p>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="p-6 bg-white shadow">
              <h3 className="text-lg font-medium text-gray-900">Pending Applications</h3>
              <p className="mt-2 text-3xl font-bold text-primary-600">{pendingCount}</p>
              <p className="mt-1 text-sm text-gray-500">Applications awaiting verification</p>
            </Card>
            
            <Card className="p-6 bg-white shadow">
              <h3 className="text-lg font-medium text-gray-900">Verified Applications</h3>
              <p className="mt-2 text-3xl font-bold text-green-600">{verifiedCount}</p>
              <p className="mt-1 text-sm text-gray-500">Applications verified by college</p>
            </Card>
            
            <Card className="p-6 bg-white shadow">
              <h3 className="text-lg font-medium text-gray-900">Rejected Applications</h3>
              <p className="mt-2 text-3xl font-bold text-red-600">{rejectedCount}</p>
              <p className="mt-1 text-sm text-gray-500">Applications rejected by college</p>
            </Card>
            
            <Card className="p-6 bg-white shadow">
              <h3 className="text-lg font-medium text-gray-900">Total Applications</h3>
              <p className="mt-2 text-3xl font-bold text-gray-800">{totalCount}</p>
              <p className="mt-1 text-sm text-gray-500">Total applications received</p>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Applications Table */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : error ? (
                <Card className="p-6 bg-red-50 border border-red-200">
                  <h3 className="text-lg font-medium text-red-800">Error loading applications</h3>
                  <p className="mt-2 text-sm text-red-700">
                    We encountered a problem loading the applications. Please try refreshing the page.
                  </p>
                </Card>
              ) : (
                <ApplicationTable 
                  userType="college" 
                  applications={applications || []} 
                />
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <QuickActionsCard userType="college" />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
