import { Button } from "@/components/ui/button";
import { Application, ApplicationStatus } from "@shared/schema";
import { Link } from "wouter";

interface QuickActionsProps {
  application?: Application;
  userType: string;
}

export function QuickActionsCard({ application, userType }: QuickActionsProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg animate-fadeIn"> {/* Added animation class */}
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 animate-fadeIn">Quick Actions</h3> {/* Added animation class */}
        <div className="mt-5 grid grid-cols-1 gap-3 animate-slideIn"> {/* Added animation class */}
          {userType === "student" && (
            <>
              <Link href="/student/apply">
                <Button className="w-full bg-primary-100 hover:bg-primary-200 text-primary-700 animate-buttonHover"> {/* Added animation class */}
                  Apply for New Concession
                </Button>
              </Link>

              {application && application.status === ApplicationStatus.DEPOT_APPROVED && (
                <Link href={`/student/payment/${application.id}`}>
                  <Button className="w-full bg-primary-100 hover:bg-primary-200 text-primary-700 animate-buttonHover"> {/* Added animation class */}
                    Submit Payment Details
                  </Button>
                </Link>
              )}

              {application && (
                <Link href={`/student/track/${application.id}`}>
                  <Button variant="outline" className="w-full animate-buttonHover"> {/* Added animation class */}
                    Track Application
                  </Button>
                </Link>
              )}

              {application && (
                <Link href={`/student/download/${application.id}`}>
                  <Button variant="outline" className="w-full animate-buttonHover"> {/* Added animation class */}
                    Download Application
                  </Button>
                </Link>
              )}

              <Link href="/contact">
                <Button variant="outline" className="w-full animate-buttonHover"> {/* Added animation class */}
                  Contact Support
                </Button>
              </Link>
            </>
          )}

          {userType === "college" && (
            <>
              <Link href="/college/dashboard">
                <Button className="w-full bg-primary-100 hover:bg-primary-200 text-primary-700 animate-buttonHover"> {/* Added animation class */}
                  Pending Verifications
                </Button>
              </Link>

              <Link href="/college/dashboard?status=college_verified">
                <Button variant="outline" className="w-full animate-buttonHover"> {/* Added animation class */}
                  Verified Applications
                </Button>
              </Link>

              <Link href="/college/dashboard?status=college_rejected">
                <Button variant="outline" className="w-full animate-buttonHover"> {/* Added animation class */}
                  Rejected Applications
                </Button>
              </Link>

              <Link href="/contact">
                <Button variant="outline" className="w-full animate-buttonHover"> {/* Added animation class */}
                  Contact Support
                </Button>
              </Link>
            </>
          )}

          {userType === "depot" && (
            <>
              <Link href="/depot/dashboard">
                <Button className="w-full bg-primary-100 hover:bg-primary-200 text-primary-700 animate-buttonHover"> {/* Added animation class */}
                  Pending Approvals
                </Button>
              </Link>

              <Link href="/depot/dashboard?tab=payment">
                <Button variant="outline" className="w-full animate-buttonHover"> {/* Added animation class */}
                  Payment Verifications
                </Button>
              </Link>

              <Link href="/depot/dashboard?tab=issuance">
                <Button variant="outline" className="w-full animate-buttonHover"> {/* Added animation class */}
                  Issue Concessions
                </Button>
              </Link>

              <Link href="/depot/dashboard?tab=issued">
                <Button variant="outline" className="w-full animate-buttonHover"> {/* Added animation class */}
                  Approved Applications
                </Button>
              </Link>

              <Link href="/contact">
                <Button variant="outline" className="w-full animate-buttonHover"> {/* Added animation class */}
                  Contact Support
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}