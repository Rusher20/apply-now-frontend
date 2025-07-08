"use client";

import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { FormData } from "@/app/page";
import { Input } from "../ui/input";

interface CreditAssessorSectionProps {
  roleSpecific: FormData["roleSpecific"];
  updateRoleSpecific: (updates: Partial<FormData["roleSpecific"]>) => void;
}

const dealTypes = ["Yes", "No"];

export function CreditAssessorSection({
  roleSpecific,
  updateRoleSpecific,
}: CreditAssessorSectionProps) {
  const handleDealTypeChange = (dealType: string, checked: boolean) => {
    const currentTypes = roleSpecific.dealTypes || [];
    if (checked) {
      updateRoleSpecific({ dealTypes: [...currentTypes, dealType] });
    } else {
      updateRoleSpecific({
        dealTypes: currentTypes.filter((t: string) => t !== dealType),
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Assessor Experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Years of Credit Assessment Experience *</Label>
          <Select
            value={roleSpecific.creditExperience}
            onValueChange={(value) =>
              updateRoleSpecific({ creditExperience: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="less than a year">Less than a year</SelectItem>
              <SelectItem value="1-2 years">1-2 years</SelectItem>
              <SelectItem value="3-5 years">3-5 years</SelectItem>
              <SelectItem value="6 years or more">6 years or more</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>
            Have you had any experience working with an Australian mortgage
            broker? *
          </Label>
          <RadioGroup
            value={roleSpecific.australianBrokerWork}
            onValueChange={(value: any) =>
              updateRoleSpecific({ australianBrokerWork: value })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="aus-work-yes" />
              <Label htmlFor="aus-work-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="aus-work-no" />
              <Label htmlFor="aus-work-no">No</Label>
            </div>
          </RadioGroup>

          {roleSpecific.australianBrokerWork === "yes" && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="aus-work-details">
                Please specify your work experience with an Australian broker:
              </Label>
              <Input
                id="aus-work-details"
                value={roleSpecific.australianBrokerWorkDetails || ""}
                onChange={(e) =>
                  updateRoleSpecific({
                    australianBrokerWorkDetails: e.target.value,
                  })
                }
                placeholder="Please Input here!"
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>
            Have you tried using a serviceability calculator, particularly
            Quickli? *
          </Label>
          <RadioGroup
            value={roleSpecific.serviceabilityCalculator}
            onValueChange={(value: any) =>
              updateRoleSpecific({
                serviceabilityCalculator: value,
                serviceabilityCalculatorDetails:
                  value === "yes"
                    ? roleSpecific.serviceabilityCalculatorDetails || ""
                    : "",
              })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="calc-yes" />
              <Label htmlFor="calc-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="calc-no" />
              <Label htmlFor="calc-no">No</Label>
            </div>
          </RadioGroup>

          {roleSpecific.serviceabilityCalculator === "yes" && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="calculator-details">
                Please specify the serviceability calculators you’ve used:
              </Label>
              <Input
                id="calculator-details"
                value={roleSpecific.serviceabilityCalculatorDetails || ""}
                onChange={(e) =>
                  updateRoleSpecific({
                    serviceabilityCalculatorDetails: e.target.value,
                  })
                }
                placeholder="e.g. CBA calculator, ANZ, NAB, Excel-based tools"
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>
           Do you have any experience in assessing self-employed and complex PAYG mortgage deals? *
          </Label>
          <div className="space-y-3">
           <RadioGroup
  value={roleSpecific.dealTypes || ""}
  onValueChange={(value: string) => updateRoleSpecific({ dealTypes: value })}
>
  {dealTypes.map((dealType) => (
    <div key={dealType} className="flex items-center space-x-2">
      <RadioGroupItem value={dealType} id={dealType} />
      <Label htmlFor={dealType} className="text-sm">
        {dealType}
      </Label>
    </div>
  ))}
</RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
