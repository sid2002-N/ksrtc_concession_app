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

export default function DepotApprove() {
  const { id } = useParams();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const action = searchParams.get("action");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [rejectionReason, setRejectionReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"approve" | "reject" | "verify-payment" | "issue" | null>(null);

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
      let successTitle = "";
      let successDesc = "";
      
      switch (pendingAction) {
        case "approve":
          successTitle = "Application Approved";
          successDesc = "The application has been approved. Student can now submit payment.";
          break;
        case "reject":
          successTitle = "Application Rejected";
          successDesc = "The application has been rejected.";
          break;
        case "verify-payment":
          successTitle = "Payment Verified";
          successDesc = "The payment has been verified. Concession pass can now be issued.";
          break;
        case "issue":
          successTitle = "Concession Issued";
          successDesc = "The concession pass has been issued and will be dispatched to the student.";
          break;
      }
      
      toast({
        title: successTitle,
        description: successDesc,
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      navigate("/depot/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    setPendingAction("approve");
    setDialogOpen(true);
  };

  const handleReject = () => {
    setPendingAction("reject");
    setDialogOpen(true);
  };

  const handleVerifyPayment = () => {
    setPendingAction("verify-payment");
    setDialogOpen(true);
  };

  const handleIssue = () => {
    setPendingAction("issue");
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (pendingAction === "approve") {
      updateStatusMutation.mutate({ status: ApplicationStatus.DEPOT_APPROVED });
    } else if (pendingAction === "reject") {
      if (!rejectionReason.trim()) {
        toast({
          title: "Rejection Reason Required",
          description: "Please provide a reason for rejecting this application.",
          variant: "destructive",
        });
        return;
      }
      updateStatusMutation.mutate({ status: ApplicationStatus.DEPOT_REJECTED, reason: rejectionReason });
    } else if (pendingAction === "verify-payment") {
      updateStatusMutation.mutate({ status: ApplicationStatus.PAYMENT_VERIFIED });
    } else if (pendingAction === "issue") {
      updateStatusMutation.mutate({ status: ApplicationStatus.ISSUED });
    }
    setDialogOpen(false);
  };

  const isLoading = isLoadingApplication || isLoadingStudent;

  // Initialize based on action parameter
  useState(() => {
    if (action === "reject") {
      setPendingAction("reject");
      setDialogOpen(true);
    } else if (action === "approve") {
      setPendingAction("approve");
      setDialogOpen(true);
    } else if (action === "verify-payment") {
      setPendingAction("verify-payment");
      setDialogOpen(true);
    } else if (action === "issue") {
      setPendingAction("issue");
      setDialogOpen(true);
    }
  });

  // Determine which action buttons to display based on application status
  const getActionButtons = () => {
    if (!application) return null;
    
    switch (application.status) {
      case ApplicationStatus.COLLEGE_VERIFIED:
        return (
          <div className="flex justify-end space-x-4 mt-6">
            <Button onClick={handleReject} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              Reject Application
            </Button>
            <Button onClick={handleApprove}>
              Approve Application
            </Button>
          </div>
        );
      case ApplicationStatus.PAYMENT_PENDING:
        return (
          <div className="flex justify-end space-x-4 mt-6">
            <Button onClick={handleVerifyPayment}>
              Verify Payment
            </Button>
          </div>
        );
      case ApplicationStatus.PAYMENT_VERIFIED:
        return (
          <div className="flex justify-end space-x-4 mt-6">
            <Button onClick={handleIssue}>
              Issue Concession Pass
            </Button>
          </div>
        );
      default:
        return (
          <Card className="p-6 bg-yellow-50 border border-yellow-200">
            <h3 className="text-lg font-medium text-yellow-800">No Actions Available</h3>
            <p className="mt-2 text-sm text-yellow-700">
              This application is currently in {application.status.replace(/_/g, " ").toUpperCase()} status.
              No actions are available for this status.
            </p>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Application Review
              </h1>
              {application && (
                <p className="mt-1 text-gray-500">
                  Application ID: KSRTC-{new Date(application.applicationDate).getFullYear()}-{application.id}
                </p>
              )}
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Button variant="outline" onClick={() => navigate("/depot/dashboard")}>
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
                  <CardTitle>Application Status</CardTitle>
                  <CardDescription>Current status: {application.status.replace(/_/g, " ").toUpperCase()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                      <div 
                        style={{ 
                          width: application.status === ApplicationStatus.COLLEGE_VERIFIED ? "40%" :
                                  application.status === ApplicationStatus.DEPOT_APPROVED ? "60%" :
                                  application.status === ApplicationStatus.PAYMENT_PENDING ? "80%" :
                                  application.status === ApplicationStatus.PAYMENT_VERIFIED ? "90%" :
                                  application.status === ApplicationStatus.ISSUED ? "100%" : "20%"
                        }} 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                      ></div>
                    </div>
                    <div className="flex text-xs justify-between">
                      <span className="text-green-600 font-semibold">Submitted</span>
                      <span className="text-green-600 font-semibold">College Verified</span>
                      <span className={
                        [ApplicationStatus.DEPOT_APPROVED, ApplicationStatus.PAYMENT_PENDING, ApplicationStatus.PAYMENT_VERIFIED, ApplicationStatus.ISSUED].includes(application.status)
                          ? "text-green-600 font-semibold" 
                          : "text-yellow-600 font-semibold"
                      }>KSRTC Approval</span>
                      <span className={
                        [ApplicationStatus.PAYMENT_VERIFIED, ApplicationStatus.ISSUED].includes(application.status)
                          ? "text-green-600 font-semibold" 
                          : application.status === ApplicationStatus.PAYMENT_PENDING
                            ? "text-yellow-600 font-semibold" 
                            : "text-gray-400"
                      }>Payment</span>
                      <span className={
                        application.status === ApplicationStatus.ISSUED
                          ? "text-green-600 font-semibold" 
                          : "text-gray-400"
                      }>Issued</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Student Information</CardTitle>
                  <CardDescription>Verify student details for accuracy</CardDescription>
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
                        <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                        <p className="mt-1 text-sm text-gray-900">{student.gender}</p>
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
                      <h3 className="text-sm font-medium text-gray-500">College Verified At</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {application.collegeVerifiedAt ? new Date(application.collegeVerifiedAt).toLocaleString() : "Not verified yet"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
                      <p className="mt-1 text-sm text-gray-900">{application.status.replace(/_/g, " ").toUpperCase()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Details Section - Only show if payment details exist */}
              {application.paymentDetails && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Review the payment information submitted by the student</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Transaction ID</h3>
                        <p className="mt-1 text-sm text-gray-900">{application.paymentDetails.transactionId}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Transaction Date</h3>
                        <p className="mt-1 text-sm text-gray-900">{application.paymentDetails.transactionDate}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Account Holder</h3>
                        <p className="mt-1 text-sm text-gray-900">{application.paymentDetails.accountHolder}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                        <p className="mt-1 text-sm text-gray-900">₹{application.paymentDetails.amount}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                        <p className="mt-1 text-sm text-gray-900">{application.paymentDetails.paymentMethod}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {getActionButtons()}
            </>
          ) : (
            <Card className="p-6">
              <h3 className="text-lg font-medium">Application Not Found</h3>
              <p className="mt-2 text-sm text-gray-600">
                We couldn't find the application you're looking for. Please check the application ID and try again.
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate("/depot/dashboard")}
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
              {pendingAction === "approve" ? "Approve Application" : 
               pendingAction === "reject" ? "Reject Application" :
               pendingAction === "verify-payment" ? "Verify Payment" :
               pendingAction === "issue" ? "Issue Concession Pass" : "Confirm Action"}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === "approve" 
                ? "Are you sure you want to approve this application? The student will be notified to make the payment."
                : pendingAction === "reject"
                ? "Please provide a reason for rejecting this application."
                : pendingAction === "verify-payment"
                ? "Are you sure you want to verify this payment? This will mark the application as ready for issuance."
                : pendingAction === "issue"
                ? "Are you sure you want to issue the concession pass? This will complete the application process."
                : "Please confirm your action."}
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
              variant={pendingAction === "reject" ? "destructive" : "default"}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                pendingAction === "approve" ? "Approve Application" : 
                pendingAction === "reject" ? "Reject Application" :
                pendingAction === "verify-payment" ? "Verify Payment" :
                pendingAction === "issue" ? "Issue Concession Pass" : "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
