import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, Redirect, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Application, Student } from "@shared/schema";
import { Loader2, Download, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DownloadApplication() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get application details
  const { data: application, isLoading: isLoadingApplication } = useQuery<Application>({
    queryKey: [`/api/applications/${id}`],
  });

  // Get student profile
  const { data: student, isLoading: isLoadingStudent } = useQuery<Student>({
    queryKey: ["/api/student"],
  });

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (user.userType !== "student") {
    return <Redirect to="/" />;
  }

  const isLoading = isLoadingApplication || isLoadingStudent;

  const handleDownload = () => {
    if (!application) return;
    
    try {
      // Open a new window to download the PDF
      window.open(`/api/applications/${application.id}/concession`, '_blank');
      
      toast({
        title: "Downloading Concession Pass",
        description: "Your concession pass is being downloaded.",
        variant: "default",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading your concession pass. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/student/dashboard">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Download Application</h1>
            <p className="mt-1 text-gray-600">
              Download a PDF copy of your concession application
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : application ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
                <CardDescription>
                  Review your application details before downloading
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Application ID</h3>
                      <p className="mt-1 text-base font-medium text-gray-900">
                        KSRTC-{new Date(application.applicationDate).getFullYear()}-{application.id}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Application Date</h3>
                      <p className="mt-1 text-base font-medium text-gray-900">
                        {new Date(application.applicationDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Applicant</h3>
                      <p className="mt-1 text-base font-medium text-gray-900">
                        {student?.firstName} {student?.lastName}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Route</h3>
                      <p className="mt-1 text-base font-medium text-gray-900">
                        {application.startPoint} to {application.endPoint}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <div className="mt-1 flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          application.status === "issued" 
                            ? "bg-green-100 text-green-800" 
                            : application.status.includes("rejected") 
                              ? "bg-red-100 text-red-800" 
                              : "bg-blue-100 text-blue-800"
                        }`}>
                          {application.status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    {application.status === "issued" ? (
                      <Button 
                        onClick={handleDownload}
                        className="w-full sm:w-auto flex items-center justify-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Concession Pass
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Button 
                          disabled
                          className="w-full sm:w-auto flex items-center justify-center gap-2 opacity-60"
                        >
                          <Download className="h-4 w-4" />
                          Download Concession Pass
                        </Button>
                        <p className="text-sm text-amber-600 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concession pass will be available after your application is fully processed and issued.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <p className="text-gray-500">Application not found</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Help & Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you're having trouble downloading your application or need assistance,
                please contact our support team for help.
              </p>
              <Link href="/contact">
                <Button variant="outline">Contact Support</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}