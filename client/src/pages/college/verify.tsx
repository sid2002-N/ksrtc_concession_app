import { useState } from "react";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useParams, useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Application, Student, ApplicationStatus } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CollegeVerify() {
  const { id } = useParams();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const action = searchParams.get("action");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [rejectionReason, setRejectionReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"verify" | "reject" | null>(null);

  // Get application details
  const { data: application, isLoading: isLoadingApplication, error: applicationError } = useQuery<Application>({
    queryKey: [`/api/applications/${id}`],
  });

  // Get student details
  const { data: student, isLoading: isLoadingStudent } = useQuery<Student>({
    queryKey: [`/api/students/${application?.studentId}`],
    enabled: !!application?.studentId,
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, reason }: { status: ApplicationStatus; reason?: string }) => {
      const res = await apiRequest("PATCH", `/api/applications/${id}/status`, { status, reason });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: pendingAction === "verify" ? "Application Verified" : "Application Rejected",
        description: pendingAction === "verify" 
          ? "The application has been verified and sent to KSRTC depot for approval." 
          : "The application has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      navigate("/college/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVerify = () => {
    setPendingAction("verify");
    setDialogOpen(true);
  };

  const handleReject = () => {
    setPendingAction("reject");
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (pendingAction === "verify") {
      updateStatusMutation.mutate({ status: ApplicationStatus.COLLEGE_VERIFIED });
    } else if (pendingAction === "reject") {
      if (!rejectionReason.trim()) {
        toast({
          title: "Rejection Reason Required",
          description: "Please provide a reason for rejecting this application.",
          variant: "destructive",
        });
        return;
      }
      updateStatusMutation.mutate({ status: ApplicationStatus.COLLEGE_REJECTED, reason: rejectionReason });
    }
    setDialogOpen(false);
  };

  const isLoading = isLoadingApplication || isLoadingStudent;

  // Initialize based on action parameter
  useState(() => {
    if (action === "reject") {
      setPendingAction("reject");
      setDialogOpen(true);
    } else if (action === "verify") {
      setPendingAction("verify");
      setDialogOpen(true);
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Verify Application
              </h1>
              {application && (
                <p className="mt-1 text-gray-500">
                  Application ID: KSRTC-{new Date(application.applicationDate).getFullYear()}-{application.id}
                </p>
              )}
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Button variant="outline" onClick={() => navigate("/college/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : applicationError ? (
            <Card className="p-6 bg-red-50 border border-red-200">
              <h3 className="text-lg font-medium text-red-800">Error loading application</h3>
              <p className="mt-2 text-sm text-red-700">
                We encountered a problem loading the application. Please try refreshing the page.
              </p>
            </Card>
          ) : application ? (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Student Information</CardTitle>
                  <CardDescription>Verify that the student is currently enrolled at your college</CardDescription>
                </CardHeader>
                <CardContent>
                  {student ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Student Name</h3>
                        <p className="mt-1 text-sm text-gray-900">{student.firstName} {student.lastName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">College ID</h3>
                        <p className="mt-1 text-sm text-gray-900">{student.collegeIdNumber}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Course</h3>
                        <p className="mt-1 text-sm text-gray-900">{student.course}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Department</h3>
                        <p className="mt-1 text-sm text-gray-900">{student.department}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Semester</h3>
                        <p className="mt-1 text-sm text-gray-900">{student.semester}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                        <p className="mt-1 text-sm text-gray-900">{student.dateOfBirth}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                        <p className="mt-1 text-sm text-gray-900">{student.gender}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1 text-sm text-gray-900">{student.userId}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <h3 className="text-sm font-medium text-gray-500">Address</h3>
                        <p className="mt-1 text-sm text-gray-900">{student.address}</p>
                      </div>
                    </div>
                  ) : (
                    <p>No student information available</p>
                  )}
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Concession Details</CardTitle>
                  <CardDescription>Review the travel details for this concession application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Start Point</h3>
                      <p className="mt-1 text-sm text-gray-900">{application.startPoint}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">End Point</h3>
                      <p className="mt-1 text-sm text-gray-900">{application.endPoint}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Application Type</h3>
                      <p className="mt-1 text-sm text-gray-900">{application.isRenewal ? "Renewal" : "New Application"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Application Date</h3>
                      <p className="mt-1 text-sm text-gray-900">{new Date(application.applicationDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
                      <p className="mt-1 text-sm text-gray-900">{application.status.replace(/_/g, " ").toUpperCase()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {application.status === ApplicationStatus.PENDING ? (
                <div className="flex justify-end space-x-4 mt-6">
                  <Button onClick={handleReject} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                    Reject Application
                  </Button>
                  <Button onClick={handleVerify}>
                    Verify and Approve
                  </Button>
                </div>
              ) : application.status === ApplicationStatus.COLLEGE_VERIFIED ? (
                <Card className="p-6 bg-green-50 border border-green-200">
                  <h3 className="text-lg font-medium text-green-800">Application Verified</h3>
                  <p className="mt-2 text-sm text-green-700">
                    This application has been verified and is now awaiting KSRTC depot approval.
                  </p>
                </Card>
              ) : application.status === ApplicationStatus.PAYMENT_VERIFIED ? (
                <Card className="p-6 bg-blue-50 border border-blue-200">
                  <h3 className="text-lg font-medium text-blue-800">Payment Verified</h3>
                  <p className="mt-2 text-sm text-blue-700">
                    Payment has been verified for this application. Concession pass will be issued soon.
                  </p>
                </Card>
              ) : application.status === ApplicationStatus.ISSUED ? (
                <Card className="p-6 bg-green-50 border border-green-200">
                  <h3 className="text-lg font-medium text-green-800">Concession Pass Issued</h3>
                  <p className="mt-2 text-sm text-green-700">
                    The concession pass has been issued for this application.
                  </p>
                  <div className="mt-4">
                    <Link href={`/student/download/${application.id}`}>
                      <Button variant="outline" className="text-green-600 hover:bg-green-50">
                        View Pass
                      </Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <Card className="p-6 bg-yellow-50 border border-yellow-200">
                  <h3 className="text-lg font-medium text-yellow-800">Application Already Processed</h3>
                  <p className="mt-2 text-sm text-yellow-700">
                    This application has already been {application.status === ApplicationStatus.COLLEGE_VERIFIED ? "verified" : "rejected"} by your college.
                    Current status: {application.status.replace(/_/g, " ").toUpperCase()}
                  </p>
                  {application.status === ApplicationStatus.COLLEGE_REJECTED && application.rejectionReason && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-yellow-800">Rejection Reason:</h4>
                      <p className="text-sm text-yellow-700">{application.rejectionReason}</p>
                    </div>
                  )}
                </Card>
              )}
            </>
          ) : (
            <Card className="p-6">
              <h3 className="text-lg font-medium">Application Not Found</h3>
              <p className="mt-2 text-sm text-gray-600">
                We couldn't find the application you're looking for. Please check the application ID and try again.
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate("/college/dashboard")}
              >
                Back to Dashboard
              </Button>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === "verify" ? "Verify Application" : "Reject Application"}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === "verify" 
                ? "Are you sure you want to verify this application? This will forward it to the KSRTC depot for approval."
                : "Please provide a reason for rejecting this application."}
            </DialogDescription>
          </DialogHeader>
          
          {pendingAction === "reject" && (
            <div className="py-4">
              <Textarea
                placeholder="Enter reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              disabled={updateStatusMutation.isPending || (pendingAction === "reject" && !rejectionReason.trim())}
              variant={pendingAction === "verify" ? "default" : "destructive"}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {pendingAction === "verify" ? "Verifying..." : "Rejecting..."}
                </>
              ) : (
                pendingAction === "verify" ? "Verify Application" : "Reject Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
