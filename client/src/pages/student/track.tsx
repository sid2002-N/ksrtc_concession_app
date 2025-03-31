import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Application, Student, College, Depot, ApplicationStatus } from "@shared/schema";
import { Loader2, Clock, CheckCircle, FileText, AlertTriangle, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { ApplicationStatusCard } from "@/components/dashboard/application-status";

export default function StudentTrack() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Get application details
  const { data: application, isLoading: isLoadingApplication, error: applicationError } = useQuery<Application>({
    queryKey: [`/api/applications/${id}`],
  });

  // Get student details
  const { data: student, isLoading: isLoadingStudent } = useQuery<Student>({
    queryKey: [`/api/students/${application?.studentId}`],
    enabled: !!application?.studentId,
  });

  // Get college details
  const { data: college, isLoading: isLoadingCollege } = useQuery<College>({
    queryKey: [`/api/colleges/${application?.collegeId}`],
    enabled: !!application?.collegeId,
  });

  // Get depot details
  const { data: depot, isLoading: isLoadingDepot } = useQuery<Depot>({
    queryKey: [`/api/depots/${application?.depotId}`],
    enabled: !!application?.depotId,
  });

  // Format dates
  const formatDate = (date: string | Date | null) => {
    if (!date) return "Not available";
    return format(new Date(date), "dd MMM yyyy, HH:mm");
  };

  const isLoading = isLoadingApplication || isLoadingStudent || isLoadingCollege || isLoadingDepot;

  // Define what action is available based on application status
  const getActionButton = () => {
    if (!application) return null;
    
    switch (application.status) {
      case ApplicationStatus.DEPOT_APPROVED:
        return (
          <Button 
            onClick={() => navigate(`/student/payment/${application.id}`)}
            className="mt-4"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Submit Payment Details
          </Button>
        );
      case ApplicationStatus.COLLEGE_REJECTED:
      case ApplicationStatus.DEPOT_REJECTED:
        return (
          <Button 
            onClick={() => navigate("/student/apply")}
            variant="outline"
            className="mt-4"
          >
            Apply Again
          </Button>
        );
      default:
        return null;
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
                Application Tracking
              </h1>
              {application && (
                <p className="mt-1 text-gray-500">
                  Application ID: KSRTC-{new Date(application.applicationDate).getFullYear()}-{application.id}
                </p>
              )}
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Button variant="outline" onClick={() => navigate("/student/dashboard")}>
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
                We encountered a problem loading your application. Please try refreshing the page.
              </p>
            </Card>
          ) : application ? (
            <>
              {/* Status Card */}
              <div className="mb-8">
                <ApplicationStatusCard application={application} />
              </div>

              {/* Application Details */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Details</CardTitle>
                    <CardDescription>Information about your concession application</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Travel Route</dt>
                        <dd className="mt-1 text-sm text-gray-900">{application.startPoint} to {application.endPoint}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Application Type</dt>
                        <dd className="mt-1 text-sm text-gray-900">{application.isRenewal ? "Renewal" : "New Application"}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">College</dt>
                        <dd className="mt-1 text-sm text-gray-900">{college?.name || "Loading..."}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Depot</dt>
                        <dd className="mt-1 text-sm text-gray-900">{depot?.name || "Loading..."}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Application Date</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(application.applicationDate)}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Current Status</dt>
                        <dd className="mt-1 text-sm">
                          <Badge
                            className={`${
                              application.status === ApplicationStatus.ISSUED
                                ? "bg-green-100 text-green-800"
                                : application.status.includes("rejected")
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {application.status.replace(/_/g, " ").toUpperCase()}
                          </Badge>
                        </dd>
                      </div>
                    </dl>

                    {/* Payment Details if available */}
                    {application.paymentDetails && (
                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
                        <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                            <dd className="mt-1 text-sm text-gray-900">{application.paymentDetails.transactionId}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Transaction Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">{application.paymentDetails.transactionDate}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Account Holder</dt>
                            <dd className="mt-1 text-sm text-gray-900">{application.paymentDetails.accountHolder}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Amount</dt>
                            <dd className="mt-1 text-sm text-gray-900">₹{application.paymentDetails.amount}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                            <dd className="mt-1 text-sm text-gray-900">{application.paymentDetails.paymentMethod}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                            <dd className="mt-1 text-sm">
                              <Badge
                                className={
                                  application.status === ApplicationStatus.PAYMENT_VERIFIED || application.status === ApplicationStatus.ISSUED
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {application.status === ApplicationStatus.PAYMENT_VERIFIED || application.status === ApplicationStatus.ISSUED
                                  ? "VERIFIED"
                                  : "PENDING VERIFICATION"}
                              </Badge>
                            </dd>
                          </div>
                        </dl>
                      </div>
                    )}

                    {/* Rejection Reason if available */}
                    {application.rejectionReason && (
                      <div className="mt-6 bg-red-50 p-4 rounded-md border border-red-200">
                        <div className="flex">
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                          <h3 className="ml-2 text-sm font-medium text-red-800">Rejection Reason</h3>
                        </div>
                        <div className="mt-2 text-sm text-red-700">
                          {application.rejectionReason}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {getActionButton()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Application Timeline</CardTitle>
                    <CardDescription>Status updates of your application</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="relative border-l border-gray-200 dark:border-gray-700">
                      <li className="mb-6 ml-6">
                        <span className="absolute flex items-center justify-center w-8 h-8 bg-green-100 rounded-full -left-4 ring-4 ring-white">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </span>
                        <h3 className="flex items-center mb-1 text-sm font-semibold text-gray-900">Application Submitted</h3>
                        <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                          {formatDate(application.applicationDate)}
                        </time>
                        <p className="text-xs text-gray-500">
                          Your application was successfully submitted and is awaiting college verification.
                        </p>
                      </li>

                      {(application.status !== ApplicationStatus.PENDING) && (
                        <li className="mb-6 ml-6">
                          <span className={`absolute flex items-center justify-center w-8 h-8 ${
                            application.status === ApplicationStatus.COLLEGE_REJECTED
                              ? "bg-red-100"
                              : "bg-green-100"
                          } rounded-full -left-4 ring-4 ring-white`}>
                            {application.status === ApplicationStatus.COLLEGE_REJECTED ? (
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </span>
                          <h3 className="flex items-center mb-1 text-sm font-semibold text-gray-900">
                            College Verification {application.status === ApplicationStatus.COLLEGE_REJECTED ? "Rejected" : "Completed"}
                          </h3>
                          <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                            {formatDate(application.collegeVerifiedAt)}
                          </time>
                          <p className="text-xs text-gray-500">
                            {application.status === ApplicationStatus.COLLEGE_REJECTED
                              ? "Your application was rejected by your college."
                              : "Your application was verified by your college and forwarded to KSRTC depot."}
                          </p>
                        </li>
                      )}

                      {(application.status === ApplicationStatus.DEPOT_APPROVED || 
                        application.status === ApplicationStatus.DEPOT_REJECTED ||
                        application.status === ApplicationStatus.PAYMENT_PENDING ||
                        application.status === ApplicationStatus.PAYMENT_VERIFIED ||
                        application.status === ApplicationStatus.ISSUED) && (
                        <li className="mb-6 ml-6">
                          <span className={`absolute flex items-center justify-center w-8 h-8 ${
                            application.status === ApplicationStatus.DEPOT_REJECTED
                              ? "bg-red-100"
                              : "bg-green-100"
                          } rounded-full -left-4 ring-4 ring-white`}>
                            {application.status === ApplicationStatus.DEPOT_REJECTED ? (
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </span>
                          <h3 className="flex items-center mb-1 text-sm font-semibold text-gray-900">
                            KSRTC Depot {application.status === ApplicationStatus.DEPOT_REJECTED ? "Rejected" : "Approved"}
                          </h3>
                          <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                            {formatDate(application.depotApprovedAt)}
                          </time>
                          <p className="text-xs text-gray-500">
                            {application.status === ApplicationStatus.DEPOT_REJECTED
                              ? "Your application was rejected by the KSRTC depot."
                              : "Your application was approved by the KSRTC depot. Please submit payment details."}
                          </p>
                        </li>
                      )}

                      {(application.status === ApplicationStatus.PAYMENT_PENDING || 
                        application.status === ApplicationStatus.PAYMENT_VERIFIED ||
                        application.status === ApplicationStatus.ISSUED) && (
                        <li className="mb-6 ml-6">
                          <span className="absolute flex items-center justify-center w-8 h-8 bg-green-100 rounded-full -left-4 ring-4 ring-white">
                            <CreditCard className="w-4 h-4 text-green-600" />
                          </span>
                          <h3 className="flex items-center mb-1 text-sm font-semibold text-gray-900">Payment Submitted</h3>
                          <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                            {application.paymentDetails?.transactionDate || "Not available"}
                          </time>
                          <p className="text-xs text-gray-500">
                            Payment details were submitted and are awaiting verification.
                          </p>
                        </li>
                      )}

                      {(application.status === ApplicationStatus.PAYMENT_VERIFIED || 
                        application.status === ApplicationStatus.ISSUED) && (
                        <li className="mb-6 ml-6">
                          <span className="absolute flex items-center justify-center w-8 h-8 bg-green-100 rounded-full -left-4 ring-4 ring-white">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </span>
                          <h3 className="flex items-center mb-1 text-sm font-semibold text-gray-900">Payment Verified</h3>
                          <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                            {formatDate(application.paymentVerifiedAt)}
                          </time>
                          <p className="text-xs text-gray-500">
                            Your payment has been verified. The concession pass will be issued soon.
                          </p>
                        </li>
                      )}

                      {application.status === ApplicationStatus.ISSUED && (
                        <li className="ml-6">
                          <span className="absolute flex items-center justify-center w-8 h-8 bg-green-100 rounded-full -left-4 ring-4 ring-white">
                            <FileText className="w-4 h-4 text-green-600" />
                          </span>
                          <h3 className="flex items-center mb-1 text-sm font-semibold text-gray-900">Concession Issued</h3>
                          <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                            {formatDate(application.issuedAt)}
                          </time>
                          <p className="text-xs text-gray-500">
                            Your concession pass has been issued and will be delivered within 3-4 days.
                          </p>
                        </li>
                      )}

                      {(application.status !== ApplicationStatus.ISSUED && 
                        application.status !== ApplicationStatus.PAYMENT_VERIFIED && 
                        application.status !== ApplicationStatus.COLLEGE_REJECTED && 
                        application.status !== ApplicationStatus.DEPOT_REJECTED) && (
                        <li className="ml-6">
                          <span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -left-4 ring-4 ring-white">
                            <Clock className="w-4 h-4 text-gray-500" />
                          </span>
                          <h3 className="flex items-center mb-1 text-sm font-semibold text-gray-400">
                            {application.status === ApplicationStatus.PENDING 
                              ? "Awaiting College Verification" 
                              : application.status === ApplicationStatus.COLLEGE_VERIFIED 
                                ? "Awaiting KSRTC Approval" 
                                : application.status === ApplicationStatus.DEPOT_APPROVED 
                                  ? "Awaiting Payment" 
                                  : application.status === ApplicationStatus.PAYMENT_PENDING 
                                    ? "Awaiting Payment Verification" 
                                    : "Processing"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            This step is currently in progress.
                          </p>
                        </li>
                      )}
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="p-6">
              <h3 className="text-lg font-medium">Application Not Found</h3>
              <p className="mt-2 text-sm text-gray-600">
                We couldn't find the application you're looking for. Please check the application ID and try again.
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate("/student/dashboard")}
              >
                Back to Dashboard
              </Button>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
