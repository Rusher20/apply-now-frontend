"use client"

import type React from "react"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { FileText, Upload, CheckCircle } from "lucide-react"
import type { FormData } from "@/app/page"

interface ReviewStepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

interface OptionWithInput {
  value: string
  input?: string
}

export function ReviewStep({ formData, updateFormData }: ReviewStepProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      updateFormData({ resume: e.target.files[0] })
    }
  }

  const formatAnswer = (answer: any): string => {
    if (!answer) return "Not answered"

    if (Array.isArray(answer)) {
      return answer
        .map((item: OptionWithInput) => {
          if (item.input) {
            return `${item.value} (${item.input})`
          }
          return item.value
        })
        .join(", ")
    }

    if (typeof answer === "object" && answer.value) {
      if (answer.input) {
        return `${answer.value} (${answer.input})`
      }
      return answer.value
    }

    return String(answer)
  }

  const hasRoleSpecificAnswers = formData.roleSpecific && Object.keys(formData.roleSpecific).length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Review & Submit</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Name:</span> {formData.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {formData.email}
            </div>
            <div>
              <span className="font-medium">Position:</span>{" "}
              {formData.position?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </div>
            <div>
              <span className="font-medium">Education:</span>{" "}
              {formData.education?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </div>
          </div>
        </CardContent>
      </Card>

      {hasRoleSpecificAnswers && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Role-Specific Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(formData.roleSpecific).map(([questionId, data]) => (
              <div key={questionId} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">{data.question || `Question ${questionId}`}:</span>
                  <p className="mt-1 text-gray-600">{formatAnswer(data.answer)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <Label htmlFor="resume">
          Upload Resume <span className="text-red-500"> *</span>
        </Label>
        <label
          htmlFor="resume"
          className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <Input
            id="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
            required
          />
          <span className="text-sm text-gray-600 hover:text-gray-800">
            Click to upload your resume (PDF, DOC, DOCX)
          </span>
          {formData.resume && <p className="text-sm mt-2 text-green-600 font-medium">✓ {formData.resume.name}</p>}
        </label>
      </div>
    </div>
  )
}
