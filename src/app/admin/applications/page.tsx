"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "@apollo/client"
import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Badge } from "../../../../components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../../components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table"
import { Download, Eye, Filter, Search, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { ScrollArea } from "../../../../components/ui/scroll-area"
import { toast } from "react-hot-toast"
import { GET_JOB_APPLICATIONS } from "@/graphql/query/getApplication"
import { DELETE_JOB_APPLICATION } from "@/graphql/mutations/deleteJobApplication"
import { UPDATE_JOB_APPLICATION_STATUS } from "@/graphql/mutations/updateStatus"

export default function AdminApplicationsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Advanced filters
  const [educationFilter, setEducationFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [experienceFilter, setExperienceFilter] = useState("all")

  const itemsPerPage = 10

  const { data, loading, error } = useQuery(GET_JOB_APPLICATIONS)
  const [deleteApplication] = useMutation(DELETE_JOB_APPLICATION, {
    refetchQueries: [{ query: GET_JOB_APPLICATIONS }],
  })
  const [updateStatus] = useMutation(UPDATE_JOB_APPLICATION_STATUS, {
    refetchQueries: [{ query: GET_JOB_APPLICATIONS }],
  })

  const applications = data?.jobApplications || []
  const uniquePositions = [...new Set(applications.map((app: any) => app.position).filter(Boolean))] as string[]
  const uniqueEducation = [...new Set(applications.map((app: any) => app.education).filter(Boolean))] as string[]
  const uniqueSources = [...new Set(applications.map((app: any) => app.applicationSource).filter(Boolean))] as string[]

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) router.push("/login")
  }, [router])

  // Simple filtering logic
  const filteredApplications = applications.filter((app: any) => {
    const matchSearch =
      app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchStatus = statusFilter === "all" || app.status === statusFilter
    const matchPosition = positionFilter === "all" || app.position === positionFilter
    const matchEducation = educationFilter === "all" || app.education === educationFilter
    const matchSource = sourceFilter === "all" || app.applicationSource === sourceFilter

    // Experience filter (for role-specific data)
    let matchExperience = true
    if (experienceFilter !== "all" && app.roleSpecific) {
      const experience =
        app.roleSpecific.bpoExperience ||
        app.roleSpecific.brokerExperience ||
        app.roleSpecific.creditExperience ||
        app.roleSpecific.fpaExperience
      matchExperience = experience === experienceFilter
    }

    return matchSearch && matchStatus && matchPosition && matchEducation && matchSource && matchExperience
  })

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage)

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPositionFilter("all")
    setEducationFilter("all")
    setSourceFilter("all")
    setExperienceFilter("all")
    setCurrentPage(1)
  }

  const handleDownloadResume = (url: string) => {
    window.open(url, "_blank")
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this application?")) {
      const toastId = toast.loading("Deleting application...")
      try {
        await deleteApplication({ variables: { id } })
        toast.success("Application deleted successfully.", { id: toastId })
      } catch (err) {
        console.error(err)
        toast.error("Failed to delete application.", { id: toastId })
      }
    }
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    const toastId = toast.loading("Updating status...")
    try {
      await updateStatus({ variables: { id, status } })
      toast.success("Status updated.", { id: toastId })
    } catch (err) {
      console.error("Failed to update status", err)
      toast.error("Status update failed.", { id: toastId })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <p className="p-4 text-red-500">Error loading applications: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
          <p className="text-gray-600">Manage and review job applications</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="text-lg px-3 py-1 bg-blue-600 text-white">{filteredApplications.length} Applications</Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Main Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {uniquePositions.map((position: string) => (
                    <SelectItem key={position} value={position}>
                      {position?.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
              <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <Select value={educationFilter} onValueChange={setEducationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Education Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Education</SelectItem>
                    {uniqueEducation.map((edu: string) => (
                      <SelectItem key={edu} value={edu}>
                        {edu?.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Application Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {uniqueSources.map((source: string) => (
                      <SelectItem key={source} value={source}>
                        {source?.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Experience Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Experience</SelectItem>
                    <SelectItem value="Less than a year">Less than a year</SelectItem>
                    <SelectItem value="1-2 years">1-2 years</SelectItem>
                    <SelectItem value="3-5 years">3-5 years</SelectItem>
                    <SelectItem value="6 years or more">6 years or more</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-700">Applications Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
                    <div className="text-sm text-gray-500">{app.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {app.position?.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {app.city}, {app.province}
                  </TableCell>
                  <TableCell>
                    ₱
                    {app.roleSpecific?.expectedSalary
                      ? Number.parseInt(app.roleSpecific.expectedSalary).toLocaleString()
                      : app.expectedSalary
                        ? Number.parseInt(app.expectedSalary).toLocaleString()
                        : "N/A"}
                  </TableCell>
                  <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select value={app.status} onValueChange={(status) => handleStatusUpdate(app.id, status)}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="interviewed">Interviewed</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Application Details - {app.name}</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="max-h-[60vh]">
                            <div className="space-y-4 p-1">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <strong>Email:</strong> {app.email}
                                </div>
                                <div>
                                  <strong>Contact:</strong> {app.contactNumber}
                                </div>
                                <div>
                                  <strong>Age:</strong> {app.age}
                                </div>
                                <div>
                                  <strong>Gender:</strong> {app.gender}
                                </div>
                                <div>
                                  <strong>Education:</strong>{" "}
                                  {app.education?.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                </div>
                                <div>
                                  <strong>Source:</strong>{" "}
                                  {app.applicationSource
                                    ?.replace("-", " ")
                                    .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                </div>
                              </div>
                              <div>
                                <strong>Address:</strong> {app.address}, {app.city}, {app.province}
                              </div>
                              {app.roleSpecific && Object.keys(app.roleSpecific).length > 0 && (
                                <div>
                                  <strong>Role-Specific Information:</strong>
                                  <div className="mt-2 p-3 bg-gray-50 rounded">
                                    {Object.entries(app.roleSpecific).map(([key, value]: [string, any]) =>
                                      value ? (
                                        <div key={key} className="mb-2">
                                          <span className="font-medium">
                                            {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
                                          </span>{" "}
                                          {Array.isArray(value) ? value.join(", ") : value.toString()}
                                        </div>
                                      ) : null,
                                    )}
                                  </div>
                                </div>
                              )}
                              <div>
                                <strong>Application Letter:</strong>
                                <div className="mt-2 p-3 bg-gray-50 rounded">
                                  <p className="whitespace-pre-wrap">{app.applicationLetter}</p>
                                </div>
                              </div>
                              {app.resumeUrl && (
                                <Button
                                  onClick={() => handleDownloadResume(app.resumeUrl)}
                                  className="flex gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                  <Download className="h-4 w-4" />
                                  View Resume
                                </Button>
                              )}
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(app.id)}>
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
      <div className="flex justify-center items-center gap-4">
        <Button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)} variant="outline">
          Previous
        </Button>
        <span className="text-gray-600">
          Page {currentPage} of {totalPages} ({filteredApplications.length} results)
        </span>
        <Button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          variant="outline"
        >
          Next
        </Button>
      </div>

      {/* No Results */}
      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No applications found matching your criteria.</p>
            <Button onClick={clearFilters} variant="outline" className="mt-4 bg-transparent">
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
