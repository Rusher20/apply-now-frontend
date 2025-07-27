"use client";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { User } from "lucide-react";
import type { FormData } from "@/app/page";

interface BasicInfoStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export function BasicInfoStep({
  formData,
  updateFormData,
}: BasicInfoStepProps) {
  const handleInputChange = (field: keyof FormData, value: string) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Basic Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            Full Name <span className="text-red-500"> *</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">
            Age <span className="text-red-500"> *</span>
          </Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange("age", e.target.value)}
            onKeyDown={(e) => {
              const invalidChars = ["e", "E", "+", "-", "*", "/", "=", "."];
              if (invalidChars.includes(e.key)) {
                e.preventDefault();
              }
            }}
            placeholder="Enter your age"
            min="18"
            max="65"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address <span className="text-red-500"> *</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter your email address"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactNumber">Contact Number <span className="text-red-500"> *</span></Label>
          <Input
            id="contactNumber"
            type="tel"
            value={formData.contactNumber}
            onChange={(e) => handleInputChange("contactNumber", e.target.value)}
            placeholder="Enter your contact number"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">
            Current City <span className="text-red-500"> *</span>
          </Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            placeholder="Enter your current city"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="province">
            Current Province <span className="text-red-500"> *</span>
          </Label>
          <Input
            id="province"
            value={formData.province}
            onChange={(e) => handleInputChange("province", e.target.value)}
            placeholder="Enter your current province"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>
            Highest Educational Attainment{" "}
            <span className="text-red-500"> *</span>
          </Label>
          <Select
            value={formData.education}
            onValueChange={(value) => handleInputChange("education", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your education level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Junior High Diploma or Equivalent">
                Junior High School Diploma or Equivalent
              </SelectItem>
              <SelectItem value="Senior High">Senior High School</SelectItem>
              <SelectItem value="Bachelor Degree">Bachelor's Degree</SelectItem>
              <SelectItem value="Graduate or Professional Degree">
                Graduate or Professional Degree
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">
          Complete Home Address <span className="text-red-500"> *</span>
        </Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="Enter your complete home address"
          required
        />
      </div>

      <div className="space-y-3">
        <Label>
          Gender <span className="text-red-500"> *</span>
        </Label>
        <RadioGroup
          value={formData.gender}
          onValueChange={(value) => handleInputChange("gender", value)}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Male" id="male" />
            <Label htmlFor="male">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Female" id="female" />
            <Label htmlFor="female">Female</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
