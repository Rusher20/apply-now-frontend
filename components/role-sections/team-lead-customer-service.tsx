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

interface CustomerServiceTeamLeadProps {
  roleSpecific: Record<string, any>;
  updateRoleSpecific: (updates: Partial<Record<string, any>>) => void;
}

const serviceModes = [
  "Answering emails",
  "Inbound Calls",
  "Outbound Calls",
  "Inbound and outbound calls",
  "All of the above",
];

export function CustomerServiceTeamLeadSection({
  roleSpecific,
  updateRoleSpecific,
}: CustomerServiceTeamLeadProps) {
  const handleServiceModeChange = (mode: string) => {
    updateRoleSpecific({ serviceModes: mode });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Service Experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>How many years of BPO experience? *</Label>
          <Select
            value={roleSpecific.bpoExperience}
            onValueChange={(value) =>
              updateRoleSpecific({ bpoExperience: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="How many years of BPO experience?" />
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
          <Label>Mode of client service *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <RadioGroup
              value={roleSpecific.serviceModes || ""}
              onValueChange={handleServiceModeChange}
            >
              {serviceModes.map((mode) => (
                <div key={mode} className="flex items-center space-x-2">
                  <RadioGroupItem value={mode} id={mode} />
                  <Label htmlFor={mode}>{mode}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Do you have any experience in a financial account?*</Label>
          <RadioGroup
            value={roleSpecific.financialAccountExperience}
            onValueChange={(value: any) =>
              updateRoleSpecific({ financialAccountExperience: value })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="financial-yes" />
              <Label htmlFor="financial-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="financial-no" />
              <Label htmlFor="financial-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        {roleSpecific.financialAccountExperience === "no" && (
          <div className="space-y-2">
            <Label>What type of account did you handle? *</Label>
            <Input
              value={roleSpecific.financialAccountType || ""}
              onChange={(e) =>
                updateRoleSpecific({ financialAccountType: e.target.value })
              }
              placeholder="e.g., Telecommunications, E-commerce, Healthcare"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Most Recent Compensation *</Label>
            <Input
              value={roleSpecific.mostRecentSalary || ""}
              onChange={(e) =>
                updateRoleSpecific({ mostRecentSalary: e.target.value })
              }
              placeholder="Most Recent Compensation"
            />
          </div>

          <div className="space-y-2">
            <Label>Expected Compensation *</Label>
            <Input
              value={roleSpecific.expectedSalary || ""}
              onChange={(e) =>
                updateRoleSpecific({ expectedSalary: e.target.value })
              }
              placeholder="Expected  Compensation"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Availability to Start *</Label>
          <Select
            value={roleSpecific.availabilityToStart}
            onValueChange={(value) =>
              updateRoleSpecific({ availabilityToStart: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="When can you start?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASAP">ASAP</SelectItem>
              <SelectItem value="15 days">15 days</SelectItem>
              <SelectItem value="30 days">30 days</SelectItem>
              <SelectItem value="60 days">60 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
