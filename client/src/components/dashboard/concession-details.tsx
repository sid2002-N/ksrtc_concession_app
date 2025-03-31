import { Application } from "@shared/schema";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { College, Depot, Student } from "@shared/schema";

interface ConcessionDetailsProps {
  application: Application;
}

export function ConcessionDetailsCard({ application }: ConcessionDetailsProps) {
  const { data: student } = useQuery<Student>({
    queryKey: [`/api/students/${application.studentId}`],
  });

  const { data: college } = useQuery<College>({
    queryKey: [`/api/colleges/${application.collegeId}`],
  });

  const { data: depot } = useQuery<Depot>({
    queryKey: [`/api/depots/${application.depotId}`],
  });

  const formattedDate = application.applicationDate 
    ? format(new Date(application.applicationDate), 'dd MMM yyyy')
    : 'N/A';

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Concession Details</h3>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between">
            <div className="text-sm text-gray-500">Application ID</div>
            <div className="text-sm font-medium text-gray-900">KSRTC-{new Date(application.applicationDate).getFullYear()}-{application.id}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-sm text-gray-500">Travel Route</div>
            <div className="text-sm font-medium text-gray-900">{application.startPoint} to {application.endPoint}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-sm text-gray-500">Applied Date</div>
            <div className="text-sm font-medium text-gray-900">{formattedDate}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-sm text-gray-500">College</div>
            <div className="text-sm font-medium text-gray-900">{college?.name || 'Loading...'}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-sm text-gray-500">Depot</div>
            <div className="text-sm font-medium text-gray-900">{depot?.name || 'Loading...'}</div>
          </div>
          {application.isRenewal && (
            <div className="flex justify-between">
              <div className="text-sm text-gray-500">Application Type</div>
              <div className="text-sm font-medium text-green-600">Renewal</div>
            </div>
          )}
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
