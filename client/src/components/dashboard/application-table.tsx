import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ApplicationStatus, Application } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ApplicationTableProps {
  userType: "college" | "depot";
  applications: Application[];
  readOnly?: boolean;
}

export function ApplicationTable({ userType, applications, readOnly = false }: ApplicationTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case ApplicationStatus.COLLEGE_VERIFIED:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">College Verified</Badge>;
      case ApplicationStatus.COLLEGE_REJECTED:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">College Rejected</Badge>;
      case ApplicationStatus.DEPOT_APPROVED:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Depot Approved</Badge>;
      case ApplicationStatus.DEPOT_REJECTED:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Depot Rejected</Badge>;
      case ApplicationStatus.PAYMENT_PENDING:
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Payment Pending</Badge>;
      case ApplicationStatus.PAYMENT_VERIFIED:
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Payment Verified</Badge>;
      case ApplicationStatus.ISSUED:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Issued</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Filter applications based on search term and filter value
  const filteredApplications = applications.filter(app => {
    // Filter by status if filter value is not 'all'
    if (filterValue !== "all" && app.status !== filterValue) {
      return false;
    }

    // For now, simple contains search on application ID
    if (searchTerm && !app.id.toString().includes(searchTerm)) {
      return false;
    }

    return true;
  });

  //Added loading state handling.
  const loadingApplications = filteredApplications.map(app => {
    const { data: student, isLoading } = useQuery({
      queryKey: [`/api/students/${app.studentId}`],
    });

    return { ...app, student, isLoading };
  });

  const isLoading = loadingApplications.some(app => app.isLoading);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {userType === "college" ? "College Verification" : "Depot Approval"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {userType === "college" 
              ? "Applications awaiting college verification" 
              : "Applications awaiting depot approval"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Select value={filterValue} onValueChange={setFilterValue}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                {userType === "college" ? (
                  <>
                    <SelectItem value={ApplicationStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={ApplicationStatus.COLLEGE_VERIFIED}>Verified</SelectItem>
                    <SelectItem value={ApplicationStatus.COLLEGE_REJECTED}>Rejected</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value={ApplicationStatus.COLLEGE_VERIFIED}>Pending Approval</SelectItem>
                    <SelectItem value={ApplicationStatus.DEPOT_APPROVED}>Approved</SelectItem>
                    <SelectItem value={ApplicationStatus.DEPOT_REJECTED}>Rejected</SelectItem>
                    <SelectItem value={ApplicationStatus.PAYMENT_PENDING}>Payment Pending</SelectItem>
                    <SelectItem value={ApplicationStatus.PAYMENT_VERIFIED}>Payment Verified</SelectItem>
                    <SelectItem value={ApplicationStatus.ISSUED}>Issued</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application ID</TableHead>
              <TableHead>Student Details</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No applications found
                </TableCell>
              </TableRow>
            ) : (
              loadingApplications.map((application) => {
                return (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      KSRTC-{new Date(application.applicationDate).getFullYear()}-{application.id}
                    </TableCell>
                    <TableCell>
                      {application.student ? (
                        <div>
                          <div className="font-medium">{application.student.firstName} {application.student.lastName}</div>
                          <div className="text-sm text-gray-500">ID: {application.student.collegeIdNumber}</div>
                        </div>
                      ) : (
                        "Loading..."
                      )}
                    </TableCell>
                    <TableCell>
                      {application.startPoint} to {application.endPoint}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(application.status)}
                    </TableCell>
                    <TableCell>
                      {new Date(application.applicationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {!readOnly && userType === "college" && (
                        <div className="flex justify-end gap-2">
                          {application.status === ApplicationStatus.PENDING && (
                            <>
                              <Link href={`/college/verify/${application.id}`}>
                                <Button size="sm" variant="outline" className="text-green-600 hover:text-green-900 border-green-200 hover:bg-green-50">
                                  Verify
                                </Button>
                              </Link>
                              <Link href={`/college/verify/${application.id}?action=reject`}>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-900 border-red-200 hover:bg-red-50">
                                  Reject
                                </Button>
                              </Link>
                            </>
                          )}
                          {[ApplicationStatus.COLLEGE_VERIFIED, ApplicationStatus.DEPOT_APPROVED, ApplicationStatus.PAYMENT_VERIFIED, ApplicationStatus.ISSUED].includes(application.status) && (
                            <Link href={`/college/verify/${application.id}?action=view`}>
                              <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-900 border-blue-200 hover:bg-blue-50">
                                View Details
                              </Button>
                            </Link>
                          )}
                        </div>
                      )}

                      {!readOnly && userType === "depot" && application.status === ApplicationStatus.COLLEGE_VERIFIED && (
                        <div className="flex justify-end gap-2">
                          <Link href={`/depot/approve/${application.id}`}>
                            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-900 border-green-200 hover:bg-green-50">
                              Approve
                            </Button>
                          </Link>
                          <Link href={`/depot/approve/${application.id}?action=reject`}>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-900 border-red-200 hover:bg-red-50">
                              Reject
                            </Button>
                          </Link>
                        </div>
                      )}

                      {!readOnly && userType === "depot" && application.status === ApplicationStatus.PAYMENT_PENDING && (
                        <div className="flex justify-end gap-2">
                          <Link href={`/depot/approve/${application.id}?action=verify-payment`}>
                            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-900 border-green-200 hover:bg-green-50">
                              Verify Payment
                            </Button>
                          </Link>
                        </div>
                      )}

                      {!readOnly && userType === "depot" && application.status === ApplicationStatus.PAYMENT_VERIFIED && (
                        <div className="flex justify-end gap-2">
                          <Link href={`/depot/approve/${application.id}?action=issue`}>
                            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-900 border-green-200 hover:bg-green-50">
                              Issue Pass
                            </Button>
                          </Link>
                        </div>
                      )}

                      {!readOnly && userType === "depot" && (
                        <div className="flex justify-end gap-2">
                          {application.status === ApplicationStatus.ISSUED && (
                            <Link href={`/depot/approve/${application.id}?action=download`}>
                              <Button size="sm" variant="outline" className="text-green-600 hover:text-green-900 border-green-200 hover:bg-green-50">
                                View Pass
                              </Button>
                            </Link>
                          )}
                          <Link href={`/depot/approve/${application.id}?action=view`}>
                            <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-900 border-blue-200 hover:bg-blue-50">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      )}
                      <div>
                        <Link href={userType === "college" ? `/college/verify/${application.id}?action=view` : `/depot/approve/${application.id}?action=view`}>
                          <Button size="sm" variant="ghost" className="text-primary-600 hover:text-primary-900">
                            View
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4 bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(filteredApplications.length, 10)}</span> of{" "}
              <span className="font-medium">{filteredApplications.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <Button variant="outline" size="sm" className="rounded-l-md" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="rounded-none bg-primary-50 border-primary-500 text-primary-600">1</Button>
              <Button variant="outline" size="sm" className="rounded-r-md" disabled>Next</Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}