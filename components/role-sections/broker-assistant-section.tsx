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

interface BrokerAssistantSectionProps {
  roleSpecific: FormData["roleSpecific"];
  updateRoleSpecific: (updates: Partial<FormData["roleSpecific"]>) => void;
}

const mortgageSoftware = [
  "Loan Origination Software(LOS)",
  "Loan Servicing Software(LSS)",
  "Customer Relationship Management(CRM)",
];

export function BrokerAssistantSection({
  roleSpecific,
  updateRoleSpecific,
}: BrokerAssistantSectionProps) {
  const handleMortgageSoftwareChange = (value: string) => {
    updateRoleSpecific({ mortgageSoftware: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Broker Assistant Experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>
            How many years of experience do you have as a Broker Assistant *
          </Label>
          <Select
            value={roleSpecific.brokerExperience}
            onValueChange={(value) =>
              updateRoleSpecific({ brokerExperience: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your experience level" />
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
            Have you had any experience working with an Australian mortgage
            broker? *
          </Label>
          <RadioGroup
            value={roleSpecific.australianBrokerExperience}
            onValueChange={(value: any) =>
              updateRoleSpecific({ australianBrokerExperience: value })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="aus-broker-yes" />
              <Label htmlFor="aus-broker-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="aus-broker-no" />
              <Label htmlFor="aus-broker-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>
            What is the mortgage-related software you have used? (Select all
            that apply) *
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <RadioGroup
              value={roleSpecific.mortgageSoftware || ""}
              onValueChange={handleMortgageSoftwareChange}
            >
              {mortgageSoftware.map((software) => (
                <div key={software} className="flex items-center space-x-2">
                  <RadioGroupItem value={software} id={software} />
                  <Label htmlFor={software}>{software}</Label>
                </div>
              ))}

              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="other" id="other-software" />
                <Label htmlFor="other-software">Other (please specify)</Label>
              </div>
            </RadioGroup>

            {roleSpecific.mortgageSoftware === "other" && (
              <Input
                value={roleSpecific.otherMortgageSoftware || ""}
                onChange={(e) =>
                  updateRoleSpecific({ otherMortgageSoftware: e.target.value })
                }
                placeholder="Enter other mortgage software"
                className="mt-2"
              />
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Do you have experience with AOL platform? *</Label>
          <RadioGroup
            value={roleSpecific.aolExperience}
            onValueChange={(value: any) =>
              updateRoleSpecific({ aolExperience: value })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="aol-yes" />
              <Label htmlFor="aol-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="aol-no" />
              <Label htmlFor="aol-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        {roleSpecific.aolExperience === "yes" && (
          <div className="space-y-2">
            <Label>How many years of AOL experience? *</Label>
            <Select
              value={roleSpecific.aolYears}
              onValueChange={(value) => updateRoleSpecific({ aolYears: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select years of AOL experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Less than a year">Less than a year</SelectItem>
                <SelectItem value="1-2 years">1-2 years</SelectItem>
                <SelectItem value="3-5 years">3-5 years</SelectItem>
                <SelectItem value="6 years or more "> 6 years or more </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
