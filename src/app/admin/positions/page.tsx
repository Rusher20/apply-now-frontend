"use client"
import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "@apollo/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Textarea } from "../../../../components/ui/textarea"
import { Badge } from "../../../../components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../../components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { Checkbox } from "../../../../components/ui/checkbox"
import { ScrollArea } from "../../../../components/ui/scroll-area"
import { Separator } from "../../../../components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog"
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  Users,
  Briefcase,
  HelpCircle,
  Loader2,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  CheckSquare,
  Power,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { GET_POSITION } from "@/graphql/query/get-position"
import { CREATE_POSITION } from "@/graphql/mutations/create-position"
import { DELETE_POSITION } from "@/graphql/mutations/delete-position"
import { UPDATE_POSITION } from "@/graphql/mutations/update-position"
import Navbar from "../../../../components/navbar"

type EditableOption =
  | string
  | {
      value: string
      id?: number
      __typename?: string
      requiresInput?: boolean
      inputLabel?: string
    }

type EditableQuestion = {
  type: "radio" | "checkbox" | "textarea" | "number" | "dropdown"
  label: string
  placeholder?: string
  required: boolean
  options?: EditableOption[]
}

interface QuestionOption {
  value: string
  requiresInput?: boolean
  inputLabel?: string
}

interface Question {
  id: string
  type: "radio" | "checkbox" | "textarea" | "number" | "dropdown"
  label: string
  placeholder?: string
  required: boolean
  options?: QuestionOption[]
}

interface Position {
  id: string
  value: string
  title: string
  description: string
  // Removed icon: string
  isActive: boolean
  questions: Question[]
  createdAt: string
  updatedAt: string
}

interface FormData {
  title: string
  description: string
  // Removed icon: string
  isActive: boolean
}

const questionTypes = [
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "dropdown", label: "Dropdown" },
]

const POSITIONS_PER_PAGE = 10

// Bulk Actions Bar Component
const BulkActionsBar = memo(
  ({
    selectedCount,
    totalCount,
    onSelectAll,
    onDeselectAll,
    onBulkDelete,
    isDeleting,
    onBulkToggleStatus,
    isTogglingStatus,
    selectedPositionsStatus, // New prop
  }: {
    selectedCount: number
    totalCount: number
    onSelectAll: () => void
    onDeselectAll: () => void
    onBulkDelete: () => void
    isDeleting: boolean
    onBulkToggleStatus: () => void
    isTogglingStatus: boolean
    selectedPositionsStatus: "active" | "inactive" | "mixed" | "none" // New
  }) => {
    if (selectedCount === 0) return null

    let toggleButtonText = "Toggle Status"
    const toggleButtonVariant: "default" | "outline" | "destructive" = "outline"
    let toggleButtonClass =
      "flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700 bg-transparent"

    if (selectedPositionsStatus === "active") {
      toggleButtonText = "Deactivate Selected"
      toggleButtonClass =
        "flex items-center gap-2 text-yellow-600 border-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 bg-transparent"
    } else if (selectedPositionsStatus === "inactive") {
      toggleButtonText = "Activate Selected"
      toggleButtonClass =
        "flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 bg-transparent"
    }

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                {selectedCount} position{selectedCount !== 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedCount < totalCount && (
                <Button variant="outline" size="sm" onClick={onSelectAll}>
                  Select All ({totalCount})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onDeselectAll}>
                <X className="h-4 w-4 mr-1" />
                Clear Selection
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={toggleButtonVariant}
              onClick={onBulkToggleStatus}
              disabled={isTogglingStatus || isDeleting}
              className={toggleButtonClass}
            >
              {isTogglingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating Status...
                </>
              ) : (
                <>
                  <Power className="h-4 w-4" />
                  {toggleButtonText}
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={onBulkDelete}
              disabled={isDeleting || isTogglingStatus}
              className="flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  },
)
BulkActionsBar.displayName = "BulkActionsBar"

// Pagination component
const Pagination = memo(
  ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
  }: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    onPageChange: (page: number) => void
  }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    const getVisiblePages = () => {
      const delta = 2
      const range = []
      const rangeWithDots = []
      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i)
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, "...")
      } else {
        rangeWithDots.push(1)
      }

      rangeWithDots.push(...range)

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...", totalPages)
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages)
      }

      return rangeWithDots
    }

    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-gray-700">
          Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span> results
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {getVisiblePages().map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={page === "..."}
              className={page === currentPage ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  },
)
Pagination.displayName = "Pagination"

const PositionForm = memo(
  ({
    formData,
    questions,
    onFormDataChange,
    onQuestionsChange,
  }: {
    formData: FormData
    questions: Omit<Question, "id">[]
    onFormDataChange: (data: FormData) => void
    onQuestionsChange: (questions: Omit<Question, "id">[]) => void
  }) => {
    const handleFormChange = useCallback(
      (field: keyof FormData, value: string | boolean) => {
        onFormDataChange({ ...formData, [field]: value })
      },
      [formData, onFormDataChange],
    )

    const handleQuestionChange = useCallback(
      (index: number, updates: Partial<Omit<Question, "id">>) => {
        const newQuestions = [...questions]
        newQuestions[index] = { ...newQuestions[index], ...updates }
        onQuestionsChange(newQuestions)
      },
      [questions, onQuestionsChange],
    )

    const addQuestion = useCallback(() => {
      const newQuestion: Omit<Question, "id"> = {
        type: "textarea",
        label: "",
        required: false,
        options: [],
      }
      onQuestionsChange([...questions, newQuestion])
    }, [questions, onQuestionsChange])

    const removeQuestion = useCallback(
      (index: number) => {
        onQuestionsChange(questions.filter((_, i) => i !== index))
      },
      [questions, onQuestionsChange],
    )

    const addOption = useCallback(
      (questionIndex: number) => {
        const newQuestions = [...questions]
        const question = newQuestions[questionIndex]
        if (question) {
          const newOption: QuestionOption = {
            value: "",
            requiresInput: false,
            inputLabel: "",
          }
          question.options = [...(question.options || []), newOption]
          onQuestionsChange(newQuestions)
        }
      },
      [questions, onQuestionsChange],
    )

    const updateOption = useCallback(
      (questionIndex: number, optionIndex: number, updates: Partial<QuestionOption>) => {
        const newQuestions = [...questions]
        const question = newQuestions[questionIndex]
        if (question?.options) {
          const newOptions = [...question.options]
          newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates }
          question.options = newOptions
          onQuestionsChange(newQuestions)
        }
      },
      [questions, onQuestionsChange],
    )

    const removeOption = useCallback(
      (questionIndex: number, optionIndex: number) => {
        const newQuestions = [...questions]
        const question = newQuestions[questionIndex]
        if (question?.options) {
          question.options = question.options.filter((_, index) => index !== optionIndex)
          onQuestionsChange(newQuestions)
        }
      },
      [questions, onQuestionsChange],
    )

    return (
      <div className="space-y-6 p-1">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <Label>Position Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                placeholder="e.g., Customer Service Representative"
              />
            </div>
          </div>
          <div>
            <Label>Description *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              placeholder="Brief description of the position..."
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleFormChange("isActive", checked as boolean)}
            />
            <Label htmlFor="isActive">Active (visible to applicants)</Label>
          </div>
        </div>

        <Separator />

        {/* Questions Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Role-Specific Questions</h3>
            <Button type="button" onClick={addQuestion} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
          {questions.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <HelpCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No questions added yet</p>
              <p className="text-sm">Click "Add Question" to create role-specific questions</p>
            </div>
          )}
          {questions.map((question, index) => (
            <Card key={`question-${index}`} className="p-4 border-l-4 border-l-blue-500">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-blue-700">Question {index + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Question Type</Label>
                    <Select
                      value={question.type}
                      onValueChange={(value) =>
                        handleQuestionChange(index, {
                          type: value as Question["type"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id={`required-${index}`}
                      checked={question.required}
                      onCheckedChange={(checked) =>
                        handleQuestionChange(index, {
                          required: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor={`required-${index}`}>Required field</Label>
                  </div>
                </div>
                <div>
                  <Label>Question Label *</Label>
                  <Input
                    value={question.label}
                    onChange={(e) => handleQuestionChange(index, { label: e.target.value })}
                    placeholder="Enter the question text..."
                  />
                </div>
                {(question.type === "textarea" || question.type === "number") && (
                  <div>
                    <Label>Placeholder Text</Label>
                    <Input
                      value={question.placeholder || ""}
                      onChange={(e) =>
                        handleQuestionChange(index, {
                          placeholder: e.target.value,
                        })
                      }
                      placeholder="Enter placeholder text..."
                    />
                  </div>
                )}
                {(question.type === "radio" || question.type === "checkbox" || question.type === "dropdown") && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Options *</Label>
                      <Button type="button" onClick={() => addOption(index)} variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Option
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {question.options?.map((option, optionIndex) => (
                        <Card key={`option-${index}-${optionIndex}`} className="p-4 bg-gray-50 border-gray-200">
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <Input
                                value={option.value || ""}
                                onChange={(e) =>
                                  updateOption(index, optionIndex, {
                                    value: e.target.value,
                                  })
                                }
                                placeholder={`Option ${optionIndex + 1}`}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                onClick={() => removeOption(index, optionIndex)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`requires-input-${index}-${optionIndex}`}
                                checked={option.requiresInput || false}
                                onCheckedChange={(checked) =>
                                  updateOption(index, optionIndex, {
                                    requiresInput: checked as boolean,
                                  })
                                }
                              />
                              <Label htmlFor={`requires-input-${index}-${optionIndex}`}>
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  Show input field when applicant selects this option
                                </div>
                              </Label>
                            </div>
                            {option.requiresInput && (
                              <div className="ml-6 pt-2 border-t border-gray-200">
                                <Label className="text-sm text-gray-600">Placeholder text for applicant input</Label>
                                <p className="text-xs text-gray-500 mb-2">
                                  This placeholder will guide applicants on what to enter when they select this option
                                </p>
                                <Input
                                  value={option.inputLabel || ""}
                                  onChange={(e) =>
                                    updateOption(index, optionIndex, {
                                      inputLabel: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., Please specify your experience..."
                                  className="mt-1"
                                />
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                      {(!question.options || question.options.length === 0) && (
                        <p className="text-sm text-gray-500 italic">
                          No options added yet. Click "Add Option" to start.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  },
)
PositionForm.displayName = "PositionForm"

export default function AdminPositionsPage() {
  const router = useRouter()

  // GraphQL queries and mutations
  const { data: positionsData, loading: positionsLoading, refetch } = useQuery(GET_POSITION)
  const [createPositionMutation, { loading: createLoading }] = useMutation(CREATE_POSITION, {
    refetchQueries: [GET_POSITION],
    onCompleted: () => toast.success("Position created successfully"),
    onError: (error) => toast.error(error.message || "Failed to create position"),
  })
  const [updatePositionMutation, { loading: updateLoading }] = useMutation(UPDATE_POSITION, {
    refetchQueries: [GET_POSITION],
    onCompleted: () => toast.success("Position updated successfully"),
    onError: (error) => toast.error(error.message || "Failed to update position"),
  })
  const [deletePositionMutation, { loading: deleteLoading }] = useMutation(DELETE_POSITION, {
    refetchQueries: [GET_POSITION],
    onCompleted: () => toast.success("Position deleted successfully"),
    onError: (error) => toast.error(error.message || "Failed to delete position"),
  })

  const positions = positionsData?.positions || []

  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)

  // Bulk selection state
  const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set())
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isBulkToggleStatusDialogOpen, setIsBulkToggleStatusDialogOpen] = useState(false)
  const [isBulkTogglingStatus, setIsBulkTogglingStatus] = useState(false)

  // Form state for creating/editing positions
  const [createFormData, setCreateFormData] = useState<FormData>({
    title: "",
    description: "",
    // Removed icon: "Users",
    isActive: true,
  })
  const [editFormData, setEditFormData] = useState<FormData>({
    title: "",
    description: "",
    // Removed icon: "Users",
    isActive: true,
  })
  const [createQuestions, setCreateQuestions] = useState<EditableQuestion[]>([])
  const [editQuestions, setEditQuestions] = useState<EditableQuestion[]>([])

  // Pagination calculations
  const totalPositions = positions.length
  const totalPages = Math.ceil(totalPositions / POSITIONS_PER_PAGE)
  const startIndex = (currentPage - 1) * POSITIONS_PER_PAGE
  const endIndex = startIndex + POSITIONS_PER_PAGE
  const currentPositions = positions.slice(startIndex, endIndex)

  // Reset to first page when positions change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) router.push("/login")
  }, [router])

  // Bulk selection handlers
  const handleSelectPosition = useCallback((positionId: string, checked: boolean) => {
    setSelectedPositions((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(positionId)
      } else {
        newSet.delete(positionId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedPositions(new Set(currentPositions.map((p: { id: string }) => p.id)))
  }, [currentPositions])

  const handleDeselectAll = useCallback(() => {
    setSelectedPositions(new Set())
  }, [])

  const handleBulkDelete = useCallback(() => {
    if (selectedPositions.size === 0) return
    setIsBulkDeleteDialogOpen(true)
  }, [selectedPositions.size])

  const confirmBulkDelete = useCallback(async () => {
    if (selectedPositions.size === 0) return
    setIsBulkDeleting(true)
    try {
      const deletePromises = Array.from(selectedPositions).map((id) => deletePositionMutation({ variables: { id } }))
      await Promise.all(deletePromises)
      toast.success(`Successfully deleted ${selectedPositions.size} position${selectedPositions.size !== 1 ? "s" : ""}`)
      setSelectedPositions(new Set())
      setIsBulkDeleteDialogOpen(false)
    } catch (error) {
      toast.error("Failed to delete some positions")
    } finally {
      setIsBulkDeleting(false)
    }
  }, [selectedPositions, deletePositionMutation])

  // New: Bulk Toggle Status Handlers
  const handleBulkToggleStatus = useCallback(() => {
    if (selectedPositions.size === 0) return
    setIsBulkToggleStatusDialogOpen(true)
  }, [selectedPositions.size])

  const confirmBulkStatusUpdate = useCallback(
    async (activate: boolean) => {
      if (selectedPositions.size === 0) return
      setIsBulkTogglingStatus(true)
      try {
        const updatePromises = Array.from(selectedPositions).map((id) => {
          const positionToUpdate = positions.find((p: { id: string }) => p.id === id)
          if (!positionToUpdate) {
            console.warn(`Position with ID ${id} not found, skipping update.`)
            return Promise.resolve() // Skip if position not found
          }
          const questionsForMutation = positionToUpdate.questions.map(
            (q: { type: any; label: any; placeholder: any; required: any; options: any[] }) => ({
              type: q.type,
              label: q.label,
              placeholder: q.placeholder,
              required: q.required,
              options:
                q.options?.map((opt: { value: any; requiresInput: any; inputLabel: any }) => ({
                  value: opt.value,
                  requiresInput: opt.requiresInput || false,
                  inputLabel: opt.inputLabel || "",
                })) || [],
            }),
          )
          return updatePositionMutation({
            variables: {
              id: Number.parseInt(id, 10),
              data: {
                title: positionToUpdate.title,
                description: positionToUpdate.description,
                // Removed icon: positionToUpdate.icon,
                isActive: activate, // This is the only field we are changing
                questions: questionsForMutation, // Pass the fully formatted questions
              },
            },
          })
        })
        await Promise.all(updatePromises)
        toast.success(
          `Successfully ${activate ? "activated" : "deactivated"} ${selectedPositions.size} position${
            selectedPositions.size !== 1 ? "s" : ""
          }`,
        )
        setSelectedPositions(new Set())
        setIsBulkToggleStatusDialogOpen(false)
      } catch (error) {
        toast.error(`Failed to ${activate ? "activate" : "deactivate"} some positions`)
      } finally {
        setIsBulkTogglingStatus(false)
      }
    },
    [selectedPositions, updatePositionMutation, positions],
  )

  const resetForm = useCallback(() => {
    setCreateFormData({
      title: "",
      description: "",
      // Removed icon: "Users",
      isActive: true,
    })
    setCreateQuestions([])
  }, [])

  const handleCreatePosition = useCallback(async () => {
    if (!createFormData.title || !createFormData.description) {
      toast.error("Please fill in all required fields")
      return
    }

    const formattedQuestions = createQuestions.map((q) => ({
      ...q,
      options:
        q.options?.map((opt) => {
          if (typeof opt === "string") {
            return { value: opt }
          }
          return {
            value: opt.value,
            requiresInput: opt.requiresInput || false,
            inputLabel: opt.inputLabel || "",
          }
        }) || [],
    }))

    try {
      await createPositionMutation({
        variables: {
          data: {
            title: createFormData.title,
            description: createFormData.description,
            // Removed icon: createFormData.icon,
            isActive: createFormData.isActive,
            questions: formattedQuestions,
          },
        },
      })
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (error) {
      // Error handling is done in the mutation
    }
  }, [createFormData, createQuestions, createPositionMutation, resetForm])

  const handleEditPosition = useCallback((position: Position) => {
    setEditingPosition(position)
    setEditFormData({
      title: position.title,
      description: position.description,
      // Removed icon: position.icon,
      isActive: position.isActive,
    })
    setEditQuestions(position.questions.map(({ id, ...rest }) => rest))
    setIsEditDialogOpen(true)
  }, [])

  const handleUpdatePosition = useCallback(async () => {
    if (!editingPosition || !editFormData.title || !editFormData.description) {
      toast.error("Please fill in all required fields")
      return
    }

    const formattedQuestions = editQuestions.map((q) => ({
      type: q.type,
      label: q.label,
      placeholder: q.placeholder,
      required: q.required,
      options:
        q.options?.map((opt) => {
          if (typeof opt === "string") {
            return { value: opt }
          }
          if (typeof opt === "object" && opt !== null && "value" in opt) {
            return {
              value: opt.value,
              requiresInput: opt.requiresInput || false,
              inputLabel: opt.inputLabel || "",
            }
          }
          throw new Error("Invalid option format")
        }) || [],
    }))

    try {
      await updatePositionMutation({
        variables: {
          id: Number.parseInt(editingPosition.id, 10),
          data: {
            title: editFormData.title,
            description: editFormData.description,
            // Removed icon: editFormData.icon,
            isActive: editFormData.isActive,
            questions: formattedQuestions,
          },
        },
      })
      setIsEditDialogOpen(false)
      setEditingPosition(null)
      // Reset edit form
      setEditFormData({
        title: "",
        description: "",
        // Removed icon: "Users",
        isActive: true,
      })
      setEditQuestions([])
    } catch (error) {
      // Error handling is done in the mutation
    }
  }, [editingPosition, editFormData, editQuestions, updatePositionMutation])

  const handleDeletePosition = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this position? This action cannot be undone.")) {
        return
      }
      try {
        await deletePositionMutation({
          variables: { id },
        })
      } catch (error) {
        // Error handling is done in the mutation
      }
    },
    [deletePositionMutation],
  )

  const isLoading = createLoading || updateLoading || deleteLoading || isBulkTogglingStatus

  const handleCreateFormDataChange = useCallback((data: FormData) => {
    setCreateFormData(data)
  }, [])

  const handleCreateQuestionsChange = useCallback((newQuestions: Omit<Question, "id">[]) => {
    setCreateQuestions(newQuestions)
  }, [])

  const handleEditFormDataChange = useCallback((data: FormData) => {
    setEditFormData(data)
  }, [])

  const handleEditQuestionsChange = useCallback((newQuestions: Omit<Question, "id">[]) => {
    setEditQuestions(newQuestions)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // Clear selections when changing pages
    setSelectedPositions(new Set())
  }, [])

  const normalizedCreateQuestions: Omit<Question, "id">[] = createQuestions.map((q) => ({
    type: q.type,
    label: q.label,
    placeholder: q.placeholder,
    required: q.required,
    options:
      q.options?.map((opt) => {
        if (typeof opt === "string") return { value: opt }
        if (typeof opt === "object" && opt !== null && "value" in opt) {
          return {
            value: opt.value,
            requiresInput: opt.requiresInput,
            inputLabel: opt.inputLabel,
          }
        }
        throw new Error("Invalid option format")
      }) || [],
  }))

  const normalizedEditQuestions: Omit<Question, "id">[] = editQuestions.map((q) => ({
    type: q.type,
    label: q.label,
    placeholder: q.placeholder,
    required: q.required,
    options:
      q.options?.map((opt) => {
        if (typeof opt === "string") return { value: opt }
        if (typeof opt === "object" && opt !== null && "value" in opt) {
          return {
            value: opt.value,
            requiresInput: opt.requiresInput,
            inputLabel: opt.inputLabel,
          }
        }
        throw new Error("Invalid option format")
      }) || [],
  }))

  const createFormProps = useMemo(
    () => ({
      formData: createFormData,
      questions: normalizedCreateQuestions,
      onFormDataChange: handleCreateFormDataChange,
      onQuestionsChange: handleCreateQuestionsChange,
    }),
    [createFormData, normalizedCreateQuestions, handleCreateFormDataChange, handleCreateQuestionsChange],
  )

  const editFormProps = useMemo(
    () => ({
      formData: editFormData,
      questions: normalizedEditQuestions,
      onFormDataChange: handleEditFormDataChange,
      onQuestionsChange: handleEditQuestionsChange,
    }),
    [editFormData, normalizedEditQuestions, handleEditFormDataChange, handleEditQuestionsChange],
  )

  // Determine the collective status of selected positions
  const selectedPositionsArray = useMemo(() => {
    return Array.from(selectedPositions).map((id) => positions.find((p: { id: string }) => p.id === id))
  }, [selectedPositions, positions])

  const selectedPositionsStatus = useMemo(() => {
    if (selectedPositions.size === 0) return "none"
    const allActive = selectedPositionsArray.every((p) => p?.isActive)
    const allInactive = selectedPositionsArray.every((p) => !p?.isActive)
    if (allActive) return "active"
    if (allInactive) return "inactive"
    return "mixed"
  }, [selectedPositions.size, selectedPositionsArray])

  if (positionsLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading positions...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Navbar />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Position Management</h1>
          <p className="text-gray-600">Create and manage job positions with custom questions</p>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Create Position
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-xl">Create New Position</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <PositionForm {...createFormProps} />
              </ScrollArea>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePosition} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  {createLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Position"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-1">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Positions</p>
                <p className="text-2xl font-bold">{totalPositions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Positions</p>
                <p className="text-2xl font-bold">{positions.filter((p: Position) => p.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            All Positions ({totalPositions})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalPositions === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No positions created yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first job position</p>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Position
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bulk Actions Bar */}
              <BulkActionsBar
                selectedCount={selectedPositions.size}
                totalCount={currentPositions.length}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onBulkDelete={handleBulkDelete}
                isDeleting={isBulkDeleting}
                onBulkToggleStatus={handleBulkToggleStatus}
                isTogglingStatus={isBulkTogglingStatus}
                selectedPositionsStatus={selectedPositionsStatus} // Pass the new prop
              />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          currentPositions.length > 0 &&
                          currentPositions.every((p: { id: string }) => selectedPositions.has(p.id))
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleSelectAll()
                          } else {
                            handleDeselectAll()
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPositions.map((position: Position) => {
                    const isSelected = selectedPositions.has(position.id)
                    return (
                      <TableRow key={position.id} className={isSelected ? "bg-blue-50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectPosition(position.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium">{position.title}</div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">{position.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {position.questions.length} questions
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              position.isActive
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {position.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {position.createdAt ? new Date(position.createdAt).toLocaleDateString() : "Unknown"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditPosition(position)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePosition(position.id)}
                              disabled={deleteLoading}
                            >
                              {deleteLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="border-t pt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalPositions}
                  itemsPerPage={POSITIONS_PER_PAGE}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Position - {editingPosition?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <PositionForm {...editFormProps} />
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePosition} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {updateLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Position"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Positions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedPositions.size} position
              {selectedPositions.size !== 1 ? "s" : ""}? This action cannot be undone and will permanently remove the
              selected positions and all their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              disabled={isBulkDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isBulkDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedPositions.size} Position${selectedPositions.size !== 1 ? "s" : ""}`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Toggle Status Confirmation Dialog */}
      <AlertDialog open={isBulkToggleStatusDialogOpen} onOpenChange={setIsBulkToggleStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Toggle Status for Selected Positions</AlertDialogTitle>
            <AlertDialogDescription>
              You have selected {selectedPositions.size} position
              {selectedPositions.size !== 1 ? "s" : ""}.
              {selectedPositionsStatus === "active" && " All selected positions are currently active."}
              {selectedPositionsStatus === "inactive" && " All selected positions are currently inactive."}
              {selectedPositionsStatus === "mixed" && " Some selected positions are active, others are inactive."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkTogglingStatus}>Cancel</AlertDialogCancel>
            {selectedPositionsStatus === "active" || selectedPositionsStatus === "mixed" ? (
              <Button
                onClick={() => confirmBulkStatusUpdate(false)}
                disabled={isBulkTogglingStatus}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {isBulkTogglingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  `Deactivate Selected`
                )}
              </Button>
            ) : null}
            {selectedPositionsStatus === "inactive" || selectedPositionsStatus === "mixed" ? (
              <Button
                onClick={() => confirmBulkStatusUpdate(true)}
                disabled={isBulkTogglingStatus}
                className="bg-green-600 hover:bg-green-700"
              >
                {isBulkTogglingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Activating...
                  </>
                ) : (
                  `Activate Selected`
                )}
              </Button>
            ) : null}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
