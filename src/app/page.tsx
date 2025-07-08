"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { ConfidentialityStep } from "../../components/form-steps/confidentiality-step"
import { BasicInfoStep } from "../../components/form-steps/basic-info-step"
import { ApplicationSourceStep } from "../../components/form-steps/application-source-step"
import { PositionStep } from "../../components/form-steps/position-step"
import { RoleSpecificStep } from "../../components/form-steps/role-specific-step"
import { ReviewStep } from "../../components/form-steps/review-step"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
  applicationLetter: string
}

const STEPS = [
  "Confidentiality Agreement",
  "Basic Information",
  "Application Source",
  "Position Selection",
  "Role-Specific Questions",
  "Review & Submit",
]

export default function JobApplicationForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)

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
    applicationLetter: "",
  })

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
            applicationLetter: formData.applicationLetter,
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

      const response = await fetch("http://localhost:3000/graphql", {
        method: "POST",
        body,
      })

      const result = await response.json()
      if (result.errors) {
        console.error("GraphQL Error:", result.errors)
        alert("Submission failed.")
      } else {
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
        return formData.resume && formData.applicationLetter
      default:
        return false
    }
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <img src="/PPSI.png" alt="PPSI Logo" className="h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Application Form</h1>
          <p className="text-gray-600">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
          </p>
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
