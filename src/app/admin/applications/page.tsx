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
import { Download, Eye, Filter, Search, X, FileDown, Trash2, CheckSquare, FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { ScrollArea } from "../../../../components/ui/scroll-area"
import { Checkbox } from "../../../../components/ui/checkbox"
import { toast } from "react-hot-toast"
import { GET_JOB_APPLICATIONS } from "@/graphql/query/getApplication"
import { DELETE_JOB_APPLICATION } from "@/graphql/mutations/deleteJobApplication"
import { UPDATE_JOB_APPLICATION_STATUS } from "@/graphql/mutations/updateStatus"
import { GET_POSITION } from "@/graphql/query/get-position"
import Navbar from "../../../../components/navbar"

// Add your backend URL - you can also make this an environment variable
const BACKEND_URL = "https://apply-now-backend-production.up.railway.app"

export default function AdminApplicationsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Bulk selection state
  const [selectedApplications, setSelectedApplications] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

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
  const { data: positionData } = useQuery(GET_POSITION)

  const applications = data?.jobApplications || []
  const uniquePositions = [...new Set(applications.map((app: any) => app.position).filter(Boolean))] as string[]
  const uniqueEducation = [...new Set(applications.map((app: any) => app.education).filter(Boolean))] as string[]
  const uniqueSources = [...new Set(applications.map((app: any) => app.applicationSource).filter(Boolean))] as string[]

  // Helper function to convert relative URLs to absolute URLs
  const getAbsoluteUrl = (url: string) => {
    if (!url) return ""

    // If it's already an absolute URL, return as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }

    // If it's a relative URL, prepend the backend URL
    if (url.startsWith("/")) {
      return `${BACKEND_URL}${url}`
    }

    // If it doesn't start with /, add both / and backend URL
    return `${BACKEND_URL}/${url}`
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) router.push("/login")
  }, [router])

  const filteredApplications = applications.filter((app: any) => {
    const matchSearch =
      app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchStatus = statusFilter === "all" || app.status === statusFilter
    const matchPosition = positionFilter === "all" || app.position === positionFilter
    const matchEducation = educationFilter === "all" || app.education === educationFilter
    const matchSource = sourceFilter === "all" || app.applicationSource === sourceFilter

    let matchExperience = true
    if (experienceFilter !== "all" && app.roleSpecific && positionData?.positions) {
      const position = positionData.positions.find((pos: any) => pos.value === app.position)
      const experienceQuestion = position?.questions.find((q: any) => q.label.toLowerCase().includes("experience"))
      const answerObj = experienceQuestion && app.roleSpecific[experienceQuestion.id]
      const answerValue = answerObj?.answer?.value || answerObj?.answer
      matchExperience = answerValue === experienceFilter
    }

    return matchSearch && matchStatus && matchPosition && matchEducation && matchSource && matchExperience
  })

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage)

  // Helper function to generate CSV data for applications
  const generateCSVData = (applicationsToExport: any[]) => {
    // Collect all unique role-specific questions across all applications
    const allRoleSpecificQuestions = new Set<string>()
    applicationsToExport.forEach((app: any) => {
      if (app.roleSpecific) {
        Object.values(app.roleSpecific).forEach((item: any) => {
          if (item?.question) {
            allRoleSpecificQuestions.add(item.question)
          }
        })
      }
    })

    const roleSpecificQuestionsArray = Array.from(allRoleSpecificQuestions).sort()

    const headers = [
      "Name",
      "Email",
      "Contact Number",
      "Age",
      "Gender",
      "Position",
      "Location",
      "Address",
      "Education",
      "Application Source",
      "Expected Salary",
      "Status",
      "Submitted Date",
      ...roleSpecificQuestionsArray,
    ]

    const csvData = applicationsToExport.map((app: any) => {
      const expectedSalary = (() => {
        if (!app.roleSpecific) return "N/A"
        const entry = Object.values(app.roleSpecific).find((item: any) =>
          (item as any)?.question?.toLowerCase().includes("expected compensation"),
        ) as { answer?: any }
        if (!entry) return "N/A"
        let raw = entry.answer
        if (typeof raw === "object" && raw !== null && "value" in raw) {
          raw = raw.value
        }
        const num = Number(raw)
        return !isNaN(num)
          ? num.toLocaleString("en-PH", {
              minimumFractionDigits: 0,
            })
          : "N/A"
      })()

      // Create a map of role-specific answers
      const roleSpecificAnswers: { [key: string]: string } = {}
      if (app.roleSpecific) {
        Object.values(app.roleSpecific).forEach((item: any) => {
          if (item?.question) {
            const question = item.question
            const answer = item.answer
            let displayValue = ""
            if (Array.isArray(answer)) {
              displayValue = answer
                .map((opt: any) => (opt.input ? `${opt.value} (${opt.input})` : opt.value))
                .join(", ")
            } else if (typeof answer === "object" && answer !== null && "value" in answer) {
              displayValue = answer.input ? `${answer.value} (${answer.input})` : answer.value
            } else {
              displayValue = String(answer ?? "")
            }
            roleSpecificAnswers[question] = displayValue
          }
        })
      }

      const baseData = [
        app.name || "",
        app.email || "",
        app.contactNumber || "",
        app.age || "",
        app.gender || "",
        app.position?.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "",
        `${app.city || ""}, ${app.province || ""}`,
        app.address || "",
        app.education?.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "",
        app.applicationSource?.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "",
        expectedSalary,
        app.status || "",
        new Date(app.createdAt).toLocaleDateString(),
      ]

      // Add role-specific answers in the same order as headers
      const roleSpecificData = roleSpecificQuestionsArray.map((question) => roleSpecificAnswers[question] || "")

      return [...baseData, ...roleSpecificData]
    })

    return { headers, csvData, roleSpecificQuestionsArray }
  }

  // Individual CSV Export Function
  const exportIndividualToCSV = (application: any) => {
    const { headers, csvData, roleSpecificQuestionsArray } = generateCSVData([application])
    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field: string | number) => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `${application.name.replace(/[^a-zA-Z0-9]/g, "_")}_application_${new Date().toISOString().split("T")[0]}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(
      `Application exported to CSV successfully! (${roleSpecificQuestionsArray.length} role-specific questions included)`,
    )
  }

  // Bulk CSV Export Function
  const exportToCSV = () => {
    const { headers, csvData, roleSpecificQuestionsArray } = generateCSVData(filteredApplications)
    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field: string | number) => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `job_applications_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(
      `Applications exported to CSV successfully! (${roleSpecificQuestionsArray.length} role-specific questions included)`,
    )
  }

  // Bulk Selection Functions
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      const allIds = new Set<number>(paginatedApplications.map((app: any) => app.id as number))
      setSelectedApplications(allIds)
    } else {
      setSelectedApplications(new Set<number>())
    }
  }

  const handleSelectApplication = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedApplications)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
      setSelectAll(false)
    }
    setSelectedApplications(newSelected)
  }

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedApplications.size === 0) {
      toast.error("Please select applications to delete")
      return
    }

    if (confirm(`Are you sure you want to delete ${selectedApplications.size} application(s)?`)) {
      const toastId = toast.loading("Deleting applications...")
      try {
        const deletePromises = Array.from(selectedApplications).map((id) => deleteApplication({ variables: { id } }))
        await Promise.all(deletePromises)
        setSelectedApplications(new Set())
        setSelectAll(false)
        toast.success(`${selectedApplications.size} application(s) deleted successfully.`, { id: toastId })
      } catch (err) {
        console.error(err)
        toast.error("Failed to delete some applications.", { id: toastId })
      }
    }
  }

  const handleBulkDownloadResumes = async () => {
    if (selectedApplications.size === 0) {
      toast.error("Please select applications to download resumes")
      return
    }

    const selectedApps = applications.filter((app: any) => selectedApplications.has(app.id) && app.resumeUrl)

    if (selectedApps.length === 0) {
      toast.error("No resumes available for selected applications")
      return
    }

    const toastId = toast.loading(`Downloading ${selectedApps.length} resume(s)...`)
    let successCount = 0
    let failCount = 0

    try {
      for (let i = 0; i < selectedApps.length; i++) {
        const app = selectedApps[i]
        const absoluteUrl = getAbsoluteUrl(app.resumeUrl)

        try {
          const response = await fetch(absoluteUrl, {
            method: "GET",
            headers: {
              Accept:
                "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,*/*",
            },
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const blob = await response.blob()
          const downloadUrl = window.URL.createObjectURL(blob)

          // Extract filename from URL or create a default one
          const urlParts = app.resumeUrl.split("/")
          const originalFilename = urlParts[urlParts.length - 1]
          const fileExtension = originalFilename.includes(".") ? originalFilename.split(".").pop() : "pdf"
          const filename = `${app.name.replace(/[^a-zA-Z0-9]/g, "_")}_resume.${fileExtension}`

          const link = document.createElement("a")
          link.href = downloadUrl
          link.download = filename
          link.style.display = "none"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(downloadUrl)

          successCount++

          // Add delay between downloads to prevent overwhelming the browser
          if (i < selectedApps.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500))
          }
        } catch (error) {
          console.error(`Failed to download resume for ${app.name}:`, error)
          failCount++
          // Fallback: open in new tab
          window.open(absoluteUrl, "_blank")
        }
      }

      if (failCount === 0) {
        toast.success(`Successfully downloaded ${successCount} resume(s)!`, { id: toastId })
      } else {
        toast.success(`Downloaded ${successCount} resume(s). ${failCount} opened in new tabs due to download issues.`, {
          id: toastId,
        })
      }
    } catch (error) {
      console.error("Bulk download failed:", error)
      toast.error("Bulk download failed. Opening resumes in new tabs instead.", { id: toastId })
      selectedApps.forEach((app: any) => {
        const absoluteUrl = getAbsoluteUrl(app.resumeUrl)
        window.open(absoluteUrl, "_blank")
      })
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPositionFilter("all")
    setEducationFilter("all")
    setSourceFilter("all")
    setExperienceFilter("all")
    setCurrentPage(1)
    setSelectedApplications(new Set())
    setSelectAll(false)
  }

  const handleDownloadResume = async (url: string, applicantName: string) => {
    const toastId = toast.loading("Downloading resume...")
    const absoluteUrl = getAbsoluteUrl(url)

    try {
      const response = await fetch(absoluteUrl, {
        method: "GET",
        headers: {
          Accept:
            "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,*/*",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)

      // Extract filename from URL or create a default one
      const urlParts = url.split("/")
      const originalFilename = urlParts[urlParts.length - 1]
      const fileExtension = originalFilename.includes(".") ? originalFilename.split(".").pop() : "pdf"
      const filename = `${applicantName.replace(/[^a-zA-Z0-9]/g, "_")}_resume.${fileExtension}`

      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = filename
      link.style.display = "none"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      toast.success("Resume downloaded successfully!", { id: toastId })
    } catch (error) {
      console.error("Download failed:", error)
      toast.error("Failed to download resume. Opening in new tab instead.", { id: toastId })
      window.open(absoluteUrl, "_blank")
    }
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
      <Navbar />

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

      {/* Bulk Actions Bar */}
      {selectedApplications.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">{selectedApplications.size} application(s) selected</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const appsToExport =
                      selectedApplications.size > 0
                        ? applications.filter((app: any) => selectedApplications.has(app.id))
                        : filteredApplications
                    const { headers, csvData, roleSpecificQuestionsArray } = generateCSVData(appsToExport)
                    const csvContent = [headers, ...csvData]
                      .map((row) =>
                        row.map((field: string | number) => `"${String(field).replace(/"/g, '""')}"`).join(","),
                      )
                      .join("\n")

                    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
                    const link = document.createElement("a")
                    const url = URL.createObjectURL(blob)
                    link.setAttribute("href", url)
                    link.setAttribute(
                      "download",
                      selectedApplications.size > 0
                        ? `selected_applications_${new Date().toISOString().split("T")[0]}.csv`
                        : `job_applications_${new Date().toISOString().split("T")[0]}.csv`,
                    )
                    link.style.visibility = "hidden"
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    toast.success(
                      selectedApplications.size > 0
                        ? `${selectedApplications.size} selected applications exported to CSV successfully!`
                        : `All ${filteredApplications.length} applications exported to CSV successfully!`,
                    )
                  }}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <FileDown className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDownloadResumes}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Download className="h-4 w-4" />
                  Download Resumes
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedApplications(new Set())
                    setSelectAll(false)
                  }}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    disabled={paginatedApplications.length === 0}
                  />
                </TableHead>
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
                    <Checkbox
                      checked={selectedApplications.has(app.id)}
                      onCheckedChange={(checked) => handleSelectApplication(app.id, checked as boolean)}
                    />
                  </TableCell>
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
                    ₱{(() => {
                      if (!app.roleSpecific) return "N/A"
                      const entry = Object.values(app.roleSpecific).find((item: any) =>
                        (item as any)?.question?.toLowerCase().includes("expected compensation"),
                      ) as { answer?: any }
                      if (!entry) return "N/A"
                      let raw = entry.answer
                      if (typeof raw === "object" && raw !== null && "value" in raw) {
                        raw = raw.value
                      }
                      const num = Number(raw)
                      return !isNaN(num)
                        ? num.toLocaleString("en-PH", {
                            minimumFractionDigits: 0,
                          })
                        : "N/A"
                    })()}
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
                              {positionData && app.roleSpecific && Object.entries(app.roleSpecific).length > 0 && (
                                <div>
                                  <strong>Role-Specific Information:</strong>
                                  <div className="mt-2 p-3 bg-gray-50 rounded">
                                    {Object.entries(app.roleSpecific).map(([key, value]: [string, any]) => {
                                      const label = value?.question || key
                                      const answer = value?.answer
                                      let displayValue = ""
                                      if (Array.isArray(answer)) {
                                        displayValue = answer
                                          .map((opt: any) => (opt.input ? `${opt.value} (${opt.input})` : opt.value))
                                          .join(", ")
                                      } else if (typeof answer === "object" && answer !== null && "value" in answer) {
                                        displayValue = answer.input ? `${answer.value} (${answer.input})` : answer.value
                                      } else {
                                        displayValue = String(answer ?? "")
                                      }
                                      return (
                                        <div key={key} className="mb-2">
                                          <span className="font-medium">{label}:</span> {displayValue}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                              <div className="flex gap-2 pt-4">
                                {app.resumeUrl && (
                                  <Button
                                    onClick={() => handleDownloadResume(app.resumeUrl, app.name)}
                                    className="flex gap-2 bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Download className="h-4 w-4" />
                                    Download Resume
                                  </Button>
                                )}
                                <Button
                                  onClick={() => exportIndividualToCSV(app)}
                                  variant="outline"
                                  className="flex gap-2"
                                >
                                  <FileText className="h-4 w-4" />
                                  Export CSV
                                </Button>
                              </div>
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                      <Button
                        onClick={() => exportIndividualToCSV(app)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(app.id)}>
                        <Trash2 className="h-4 w-4" />
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
        <Button
          disabled={currentPage === 1 || filteredApplications.length === 0}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          variant="outline"
        >
          Previous
        </Button>
        <span className="text-gray-600">
          {filteredApplications.length > 0
            ? `Page ${currentPage} of ${totalPages} (${filteredApplications.length} results)`
            : "No results"}
        </span>
        <Button
          disabled={currentPage === totalPages || filteredApplications.length === 0}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
