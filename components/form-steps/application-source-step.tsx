"use client"

import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Search, Wifi } from "lucide-react"
import type { FormData } from "@/app/page"

interface ApplicationSourceStepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

export function ApplicationSourceStep({ formData, updateFormData }: ApplicationSourceStepProps) {
  const handleInputChange = (field: keyof FormData, value: string) => {
    updateFormData({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Search className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Application Source & Internet Capability</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>How did you find this job posting? <span className="text-red-500"> *</span></Label>
          <Select
            value={formData.applicationSource}
            onValueChange={(value) => handleInputChange("applicationSource", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select application source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="mynimo">Mynimo</SelectItem>
              <SelectItem value="indeed">Indeed</SelectItem>
              <SelectItem value="company-website">Company Website</SelectItem>
              <SelectItem value="referral">Employee Referral</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.applicationSource === "referral" && (
          <div className="space-y-2">
            <Label htmlFor="referralName">Referral Name </Label>
            <Input
              id="referralName"
              value={formData.referralName}
              onChange={(e) => handleInputChange("referralName", e.target.value)}
              placeholder="Enter the name of the person who referred you"
              required
            />
          </div>
        )}

        <div className="border-t pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Wifi className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium">Internet Capability</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Do you have a stable home internet connection? <span className="text-red-500"> *</span></Label>
              <RadioGroup
                value={formData.hasStableInternet}
                onValueChange={(value: string) => handleInputChange("hasStableInternet", value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="internet-yes" />
                  <Label htmlFor="internet-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="internet-no" />
                  <Label htmlFor="internet-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.hasStableInternet === "yes" && (
              <div className="space-y-2">
                <Label htmlFor="internetProvider">Internet Service Provider <span className="text-red-500"> *</span></Label>
                <Select
                  value={formData.internetProvider}
                  onValueChange={(value) => handleInputChange("internetProvider", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your internet provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pldt">PLDT</SelectItem>
                    <SelectItem value="globe">Globe</SelectItem>
                    <SelectItem value="smart">Smart</SelectItem>
                    <SelectItem value="sky">Sky</SelectItem>
                    <SelectItem value="converge">Converge</SelectItem>
                    <SelectItem value="dito">Dito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
