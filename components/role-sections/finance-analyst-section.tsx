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
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { FormData } from "@/app/page";
import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";

interface FinanceAnalystSectionProps {
  roleSpecific: FormData["roleSpecific"];
  updateRoleSpecific: (updates: Partial<FormData["roleSpecific"]>) => void;
}

export function FinanceAnalystSection({
  roleSpecific,
  updateRoleSpecific,
}: FinanceAnalystSectionProps) {
  const handleSoftwareChange = (software: string, checked: boolean) => {
    const currentSoftware = roleSpecific.financialSoftware || [];
    if (checked) {
      updateRoleSpecific({ financialSoftware: [...currentSoftware, software] });
    } else {
      updateRoleSpecific({
        financialSoftware: currentSoftware.filter(
          (s: string) => s !== software
        ),
      });
    }
  };

  const handleCertificationChange = (cert: string, checked: boolean) => {
    const currentCerts = roleSpecific.certifications || [];
    if (checked) {
      updateRoleSpecific({ certifications: [...currentCerts, cert] });
    } else {
      updateRoleSpecific({
        certifications: currentCerts.filter((c: string) => c !== cert),
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Senior Finance Analyst Qualifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>
            Do you have a bachelor’s degree in finance, accounting, economics,
            or any related field? *
          </Label>
          <RadioGroup
            value={roleSpecific.relevantDegree}
            onValueChange={(value: any) =>
              updateRoleSpecific({ relevantDegree: value })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="degree-yes" />
              <Label htmlFor="degree-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="degree-no" />
              <Label htmlFor="degree-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        {roleSpecific.relevantDegree === "yes" && (
          <div className="space-y-2">
            <Label>Please specify your degree program *</Label>
            <Input
              value={roleSpecific.degreeProgram || ""}
              onChange={(e) =>
                updateRoleSpecific({ degreeProgram: e.target.value })
              }
              placeholder="e.g., Bachelor of Science in Accounting, Master in Finance"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>
            How many years of experience do you have in Financial Planning and
            Analysis? *
          </Label>
          <Select
            value={roleSpecific.fpaExperience}
            onValueChange={(value) =>
              updateRoleSpecific({ fpaExperience: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your FP&A experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Less than a year">Less than a year</SelectItem>
              <SelectItem value="1-2 years">1-2 years</SelectItem>
              <SelectItem value="3-5 years">3-5 years</SelectItem>
              <SelectItem value="6 years or more">6 years or more</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>
            Do you have knowledge in financial forecasting and variance
            analysis? *
          </Label>
          <RadioGroup
            value={roleSpecific.forecastingExperience}
            onValueChange={(value: any) =>
              updateRoleSpecific({ forecastingExperience: value })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="forecast-yes" />
              <Label htmlFor="forecast-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="forecast-no" />
              <Label htmlFor="forecast-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>What are the financial software applications you used? *</Label>
          <div className="space-y-2">
            {(roleSpecific.financialSoftware ?? []).map(
              (software: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={software}
                    onChange={(e) => {
                      const updated = [
                        ...(roleSpecific.financialSoftware ?? []),
                      ] as string[];
                      updated[index] = e.target.value;
                      updateRoleSpecific({ financialSoftware: updated });
                    }}
                    placeholder="Enter financial software"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const updated = [
                        ...(roleSpecific.financialSoftware ?? []),
                      ] as string[];
                      updated.splice(index, 1);
                      updateRoleSpecific({ financialSoftware: updated });
                    }}
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              )
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                updateRoleSpecific({
                  financialSoftware: [
                    ...(roleSpecific.financialSoftware ?? []),
                    "",
                  ],
                })
              }
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Software
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Do you have any certifications in CPA, ACCA, or CFA?</Label>
          <RadioGroup
            value={roleSpecific.certifications?.[0] === "yes" ? "yes" : "no"}
            onValueChange={(value) => {
              if (value === "yes") {
                updateRoleSpecific({ certifications: ["yes"] });
              } else {
                updateRoleSpecific({
                  certifications: ["no"],
                  specificCertifications: "",
                });
              }
            }}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="cert-yes" />
              <Label htmlFor="cert-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="cert-no" />
              <Label htmlFor="cert-no">No</Label>
            </div>
          </RadioGroup>

          {roleSpecific.certifications?.[0] === "yes" && (
            <div className="space-y-2">
              <Input
                value={roleSpecific.specificCertifications || ""}
                onChange={(e) =>
                  updateRoleSpecific({ specificCertifications: e.target.value })
                }
                placeholder="e.g., CPA (2020), CFA Level II (In Progress)"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
