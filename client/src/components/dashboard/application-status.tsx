import { Application, ApplicationStatus } from "@shared/schema";

interface ApplicationStatusProps {
  application: Application;
}

export function ApplicationStatusCard({ application }: ApplicationStatusProps) {
  const getStatusInfo = () => {
    switch (application.status) {
      case ApplicationStatus.PENDING:
        return {
          label: "Pending",
          color: "bg-yellow-100 text-yellow-800",
          progress: 20,
          message: "Your application is awaiting college verification."
        };
      case ApplicationStatus.COLLEGE_VERIFIED:
        return {
          label: "College Verified",
          color: "bg-blue-100 text-blue-800",
          progress: 40,
          message: "Your application has been verified by your college and is awaiting KSRTC approval."
        };
      case ApplicationStatus.COLLEGE_REJECTED:
        return {
          label: "College Rejected",
          color: "bg-red-100 text-red-800",
          progress: 0,
          message: `Your application was rejected by your college. Reason: ${application.rejectionReason || "Not specified"}`
        };
      case ApplicationStatus.DEPOT_APPROVED:
        return {
          label: "KSRTC Approved",
          color: "bg-green-100 text-green-800",
          progress: 60,
          message: "Your application has been approved by KSRTC. Please submit payment details."
        };
      case ApplicationStatus.DEPOT_REJECTED:
        return {
          label: "KSRTC Rejected",
          color: "bg-red-100 text-red-800",
          progress: 0,
          message: `Your application was rejected by KSRTC. Reason: ${application.rejectionReason || "Not specified"}`
        };
      case ApplicationStatus.PAYMENT_PENDING:
        return {
          label: "Payment Verification Pending",
          color: "bg-amber-100 text-amber-800",
          progress: 80,
          message: "Your payment details have been submitted and are awaiting verification."
        };
      case ApplicationStatus.PAYMENT_VERIFIED:
        return {
          label: "Payment Verified",
          color: "bg-emerald-100 text-emerald-800",
          progress: 90,
          message: "Your payment has been verified. Your concession pass will be issued soon."
        };
      case ApplicationStatus.ISSUED:
        return {
          label: "Issued",
          color: "bg-green-100 text-green-800",
          progress: 100,
          message: "Your concession pass has been issued and will be delivered within 3-4 days."
        };
      default:
        return {
          label: "Unknown",
          color: "bg-gray-100 text-gray-800",
          progress: 0,
          message: "Unable to determine application status."
        };
    }
  };

  const { label, color, progress, message } = getStatusInfo();

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
            <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Application Status
            </dt>
            <dd className="flex items-center">
              <div className="text-lg font-medium text-gray-900">
                {label}
              </div>
              <div className="ml-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${color}`}>
                  {label}
                </span>
              </div>
            </dd>
          </div>
        </div>
        <div className="mt-5">
          <div className="relative">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"></div>
            </div>
            <div className="flex text-xs justify-between">
              <span className={application.status !== ApplicationStatus.COLLEGE_REJECTED && application.status !== ApplicationStatus.DEPOT_REJECTED ? "text-green-600 font-semibold" : "text-gray-400"}>Submitted</span>
              <span className={
                [ApplicationStatus.COLLEGE_VERIFIED, ApplicationStatus.DEPOT_APPROVED, ApplicationStatus.PAYMENT_PENDING, ApplicationStatus.PAYMENT_VERIFIED, ApplicationStatus.ISSUED].includes(application.status) 
                  ? "text-green-600 font-semibold" 
                  : application.status === ApplicationStatus.PENDING 
                    ? "text-yellow-600 font-semibold" 
                    : "text-gray-400"
              }>College Verification</span>
              <span className={
                [ApplicationStatus.DEPOT_APPROVED, ApplicationStatus.PAYMENT_PENDING, ApplicationStatus.PAYMENT_VERIFIED, ApplicationStatus.ISSUED].includes(application.status) 
                  ? "text-green-600 font-semibold" 
                  : application.status === ApplicationStatus.COLLEGE_VERIFIED 
                    ? "text-yellow-600 font-semibold" 
                    : "text-gray-400"
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
        </div>
        <div className="mt-4 text-sm text-gray-600">
          {message}
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <a href={`/student/track/${application.id}`} className="font-medium text-primary-600 hover:text-primary-500">View full details</a>
        </div>
      </div>
    </div>
  );
}
