import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { Shield } from "lucide-react";
import type { FormData } from "@/app/page";

interface ConfidentialityStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export function ConfidentialityStep({
  formData,
  updateFormData,
}: ConfidentialityStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Confidentiality Agreement</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Data Protection & Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 w-full border rounded-md p-4">
            <div className="space-y-4 text-sm text-gray-700">
              <p>
                <strong>Confidentiality Agreement</strong>
              </p>

              <p>
                This Confidentiality Agreement is entered into as of today, by
                and between the disclosing party and ProgressPro Services Inc.,
                located at Golam Drive, Meridian by Avenir, Cebu, Central
                Visayas 6000, PH (Receiving Party).
              </p>

              <div className="space-y-2">
                <p>
                  This Agreement does not apply to information that is or
                  becomes publicly known through no fault of ProgressPro
                  Services Inc., is already known to ProgressPro Services Inc.
                  before disclosure, or is independently developed by
                  ProgressPro Services Inc.
                </p>
                <br />
                <p>
                  The obligations under this Agreement shall remain in effect
                  throughout years of the involvement of both parties following
                  the date of disclosure. Upon termination of this Agreement or
                  upon request, ProgressPro Services Inc. shall return or
                  destroy all Confidential Information.
                </p>
                <br />
                <p>
                  This Agreement shall be governed by the laws of the company’s
                  jurisdiction.
                </p>

                <p>
                  IN WITNESS WHEREOF, the parties have executed this Agreement
                  as of the date of the disclosure.
                </p>
                <br />
                <p className={formData.name ? "" : "text-gray-400 italic"}>
                  {formData.name.trim() || "[Disclosing Party Name]"}
                </p>

                <br />
                <p>ProgressPro Services Inc.</p>
              </div>

              <p className="font-medium">
                If you do not agree to these terms, please do not proceed with
                the application.
              </p>
            </div>
          </ScrollArea>

          <div className="flex items-center space-x-2 mt-6">
            <Checkbox
              id="confidentiality"
              checked={formData.confidentialityAgreed}
              onCheckedChange={(checked: boolean) =>
                updateFormData({ confidentialityAgreed: checked as boolean })
              }
            />
            <label
              htmlFor="confidentiality"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and agree to the Confidentiality Agreement and Data
              Protection Policy
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
