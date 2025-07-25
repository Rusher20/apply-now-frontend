"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { Badge } from "../../components/ui/badge"
import { ConfidentialityStep } from "../../components/form-steps/confidentiality-step"
import { BasicInfoStep } from "../../components/form-steps/basic-info-step"
import { ApplicationSourceStep } from "../../components/form-steps/application-source-step"
import { PositionStep } from "../../components/form-steps/position-step"
import { RoleSpecificStep } from "../../components/form-steps/role-specific-step"
import { ReviewStep } from "../../components/form-steps/review-step"
import { ChevronLeft, ChevronRight, Save, Trash2 } from "lucide-react"

export interface FormData {
  confidentialityAgreed: boolean
  name: string
  age: string
  gender: string
  email: string
  contactNumber: string
  address: string
  city: string
  province: string
  region: string
  education: string
  applicationSource: string
  referralName: string
  hasStableInternet: string
  internetProvider: string
  position: string
  roleSpecific: Record<string, any>
  resume: File | null
}

const STEPS = [
  "Confidentiality Agreement",
  "Basic Information",
  "Application Source",
  "Position Selection",
  "Role-Specific Questions",
  "Review & Submit",
]

const STORAGE_KEY = "job-application-form-data"
const STEP_STORAGE_KEY = "job-application-current-step"

export default function JobApplicationForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [formData, setFormData] = useState<FormData>({
    confidentialityAgreed: false,
    name: "",
    age: "",
    gender: "",
    email: "",
    contactNumber: "",
    address: "",
    city: "",
    province: "",
    region: "",
    education: "",
    applicationSource: "",
    referralName: "",
    hasStableInternet: "",
    internetProvider: "",
    position: "",
    roleSpecific: {},
    resume: null,
  })

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    const savedStep = localStorage.getItem(STEP_STORAGE_KEY)

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setFormData((prev) => ({ ...prev, ...parsedData }))
        setLastSaved(new Date(parsedData.savedAt || Date.now()))
      } catch (error) {
        console.error("Error loading saved form data:", error)
      }
    }

    if (savedStep) {
      const stepNumber = Number.parseInt(savedStep, 10)
      if (stepNumber >= 0 && stepNumber < STEPS.length) {
        setCurrentStep(stepNumber)
      }
    }

    setIsLoaded(true)
  }, [])

  // Save data to localStorage whenever formData or currentStep changes
  useEffect(() => {
    if (!isLoaded) return // Don't save during initial load

    const dataToSave = {
      ...formData,
      resume: null, // Don't save file object
      savedAt: new Date().toISOString(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    localStorage.setItem(STEP_STORAGE_KEY, currentStep.toString())
    setLastSaved(new Date())
  }, [formData, currentStep, isLoaded])

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const updateRoleSpecific = (updates: Partial<FormData["roleSpecific"]>) => {
    setFormData((prev) => ({
      ...prev,
      roleSpecific: { ...prev.roleSpecific, ...updates },
    }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const clearSavedData = () => {
    if (confirm("Are you sure you want to clear all saved progress? This action cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STEP_STORAGE_KEY)
      setFormData({
        confidentialityAgreed: false,
        name: "",
        age: "",
        gender: "",
        email: "",
        contactNumber: "",
        address: "",
        city: "",
        province: "",
        region: "",
        education: "",
        applicationSource: "",
        referralName: "",
        hasStableInternet: "",
        internetProvider: "",
        position: "",
        roleSpecific: {},
        resume: null,
      })
      setCurrentStep(0)
      setLastSaved(null)
    }
  }

  const handleSubmit = async () => {
    if (!formData.resume) {
      alert("Resume is required")
      return
    }

    setLoading(true)
    try {
      const operations = JSON.stringify({
        query: `
          mutation SubmitApplication($input: CreateApplicationInput!, $file: Upload!) {
            submitApplication(input: $input, file: $file)
          }
        `,
        variables: {
          input: {
            name: formData.name,
            age: formData.age,
            gender: formData.gender,
            email: formData.email,
            contactNumber: formData.contactNumber,
            address: formData.address,
            city: formData.city,
            province: formData.province,
            education: formData.education,
            confidentialityAgreed: formData.confidentialityAgreed,
            applicationSource: formData.applicationSource,
            referralName: formData.referralName || null,
            hasStableInternet: formData.hasStableInternet,
            internetProvider: formData.internetProvider || null,
            position: formData.position,
            roleSpecific: formData.roleSpecific,
          },
          file: null,
        },
      })

      const map = JSON.stringify({
        "1": ["variables.file"],
      })

      const body = new FormData()
      body.append("operations", operations)
      body.append("map", map)
      body.append("1", formData.resume)

      const response = await fetch("https://apply-now-backend-production.up.railway.app/graphql", {
        method: "POST",
        body,
      })

      const result = await response.json()
      if (result.errors) {
        console.error("GraphQL Error:", result.errors)
        alert("Submission failed.")
      } else {
        // Clear saved data on successful submission
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(STEP_STORAGE_KEY)
        router.push("/application/confirmation")
      }
    } catch (error) {
      console.error("Submission Error:", error)
      alert("An error occurred while submitting.")
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <ConfidentialityStep formData={formData} updateFormData={updateFormData} />
      case 1:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} />
      case 2:
        return <ApplicationSourceStep formData={formData} updateFormData={updateFormData} />
      case 3:
        return <PositionStep formData={formData} updateFormData={updateFormData} />
      case 4:
        return (
          <RoleSpecificStep
            formData={formData}
            updateFormData={updateFormData}
            updateRoleSpecific={updateRoleSpecific}
          />
        )
      case 5:
        return <ReviewStep formData={formData} updateFormData={updateFormData} />
      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.confidentialityAgreed
      case 1:
        return formData.name && formData.email && formData.contactNumber && formData.address
      case 2:
        return formData.applicationSource && formData.hasStableInternet
      case 3:
        return formData.position
      case 4:
        return true
      case 5:
        return !!formData.resume
      default:
        return false
    }
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading please wait...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <img src="/PPSI.png" alt="PPSI Logo" className="h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Application Form</h1>
          <p className="text-gray-600">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
          </p>

          {/* Progress save indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSavedData}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear Progress
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-center">{STEPS[currentStep]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStep()}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              {currentStep === STEPS.length - 1 ? (
                <Button onClick={handleSubmit} disabled={!canProceed() || loading} className="flex items-center gap-2">
                  {loading ? "Submitting..." : "Submit Application"}
                </Button>
              ) : (
                <Button onClick={nextStep} disabled={!canProceed()} className="flex items-center gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
