import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { Card } from "@/components/ui/card";
import { ApplicationStatusCard } from "@/components/dashboard/application-status";
import { ConcessionDetailsCard } from "@/components/dashboard/concession-details";
import { QuickActionsCard } from "@/components/dashboard/quick-actions";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Application, Student } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";

export default function StudentDashboard() {
  const { user } = useAuth();

  // Get student profile
  const { data: student, isLoading: isLoadingStudent, error: studentError } = useQuery<Student>({
    queryKey: ["/api/student"],
  });

  // Get student applications
  const { data: applications, isLoading: isLoadingApplications, error: applicationsError } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  // Get active application
  const latestApplication = applications?.length ? 
    applications.sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime())[0] 
    : undefined;

  if (!user) {
    return <Redirect to="/auth" />;
  }

  const isLoading = isLoadingStudent || isLoadingApplications;
  const hasError = studentError || applicationsError;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Student Dashboard
              </h1>
              {student && (
                <p className="mt-1 text-gray-500">
                  Welcome, {student.firstName} {student.lastName}
                </p>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : hasError ? (
            <Card className="p-6 bg-red-50 border border-red-200">
              <h3 className="text-lg font-medium text-red-800">Error loading dashboard</h3>
              <p className="mt-2 text-sm text-red-700">
                We encountered a problem loading your information. Please try refreshing the page.
              </p>
            </Card>
          ) : applications?.length === 0 ? (
            <Card className="p-6 border">
              <h3 className="text-lg font-medium">Welcome to KSRTC Concession System</h3>
              <p className="mt-2 text-sm text-gray-600">
                You haven't applied for any concessions yet. Click "Apply for New Concession" to get started.
              </p>
              <div className="mt-4">
                <QuickActionsCard userType="student" />
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {latestApplication && (
                <ApplicationStatusCard application={latestApplication} />
              )}
              {latestApplication && (
                <ConcessionDetailsCard application={latestApplication} />
              )}
              <QuickActionsCard 
                application={latestApplication} 
                userType="student" 
              />
            </div>
          )}

          {applications && applications.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Your Applications</h2>
              <div className="bg-white shadow overflow-hidden rounded-md">
                <ul className="divide-y divide-gray-200">
                  {applications.map((app) => (
                    <li key={app.id}>
                      <a href={`/student/track/${app.id}`} className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-primary-600 truncate">
                                KSRTC-{new Date(app.applicationDate).getFullYear()}-{app.id}
                              </p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  app.status === 'issued' ? 'bg-green-100 text-green-800' : 
                                  app.status.includes('rejected') ? 'bg-red-100 text-red-800' : 
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {app.status.replace('_', ' ').toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="text-sm text-gray-500">
                                Applied: {new Date(app.applicationDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {app.startPoint} to {app.endPoint}
                              </p>
                            </div>
                          </div>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
