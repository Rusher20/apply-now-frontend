"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import LogoutButton from "../../../components/LogoutButton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Download, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { toast } from "react-hot-toast";

import { GET_JOB_APPLICATIONS } from "@/graphql/query/getApplication";
import { DELETE_JOB_APPLICATION } from "@/graphql/mutations/deleteJobApplication";
import { UPDATE_JOB_APPLICATION_STATUS } from "@/graphql/mutations/updateStatus";

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, loading, error } = useQuery(GET_JOB_APPLICATIONS);
  const [deleteApplication] = useMutation(DELETE_JOB_APPLICATION, {
    refetchQueries: [{ query: GET_JOB_APPLICATIONS }],
  });
  const [updateStatus] = useMutation(UPDATE_JOB_APPLICATION_STATUS, {
    refetchQueries: [{ query: GET_JOB_APPLICATIONS }],
  });

  const applications = data?.jobApplications || [];
  const uniquePositions = [...new Set(applications.map((app: any) => app.position))];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  const filteredApplications = applications.filter((app: any) => {
    const matchSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || app.status === statusFilter;
    const matchPosition = positionFilter === "all" || app.position === positionFilter;
    return matchSearch && matchStatus && matchPosition;
  });

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

  const handleDownloadResume = (url: string) => {
    window.open(url, "_blank");
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this application?")) {
      const toastId = toast.loading("Deleting application...");
      try {
        await deleteApplication({ variables: { id } });
        toast.success("Application deleted successfully.", { id: toastId });
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete application.", { id: toastId });
      }
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    const toastId = toast.loading("Updating status...");
    try {
      await updateStatus({ variables: { id, status } });
      toast.success("Status updated.", { id: toastId });
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Status update failed.", { id: toastId });
    }
  };

  if (loading)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (error) return <p className="p-4 text-red-500">Error loading applications.</p>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <img src="/PPSI.png" alt="PPSI Logo" className="h-20 object-contain" />
          <p className="text-muted-foreground">
            HR Manage and review job applications
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="text-lg px-3 py-1 bg-[#273472] text-white">
            {filteredApplications.length} Applications
          </Badge>
          <LogoutButton />
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by name, email, or position..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 flex-1"
            />
            <Select value={statusFilter} onValueChange={(v) => {
              setStatusFilter(v);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={positionFilter} onValueChange={(v) => {
              setPositionFilter(v);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {(uniquePositions as string[]).map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#007DA3]">Applications Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="text-[#273472]">
                <TableHead>Applicant</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Expected Salary</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedApplications.map((app: any) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="font-medium">{app.name}</div>
                    <div className="text-sm text-muted-foreground">{app.email}</div>
                  </TableCell>
                  <TableCell>{app.position}</TableCell>
                  <TableCell>{app.city}, {app.province}</TableCell>
                  <TableCell>₱{parseInt(app.expectedSalary).toLocaleString()}</TableCell>
                  <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select value={app.status} onValueChange={(status) => handleStatusUpdate(app.id, status)}>
                      <SelectTrigger className="w-36 border-[#007DA3] focus:ring-[#007DA3]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="interviewed">Interviewed</SelectItem>
                        <SelectItem value="rejected" className="text-red-500">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedApplication(app)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Application Details - {app.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p><strong>Email:</strong> {app.email}</p>
                            <p><strong>Contact:</strong> {app.contactNumber}</p>
                            <p><strong>Address:</strong> {app.address}, {app.city}, {app.province}, {app.region}</p>
                            <p><strong>Gender:</strong> {app.gender}</p>
                            <p><strong>Application Letter:</strong><br />{app.applicationLetter}</p>
                            {app.resumeUrl && (
                              <Button
                                onClick={() => handleDownloadResume(app.resumeUrl)}
                                className="flex gap-2 bg-[#273472] text-white hover:bg-[#1d265b]"
                              >
                                <Download className="h-4 w-4" />
                                View Resume
                              </Button>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" onClick={() => handleDelete(app.id)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <Button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>Previous</Button>
        <span className="text-muted-foreground">Page {currentPage} of {totalPages}</span>
        <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)}>Next</Button>
      </div>

      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No applications found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
