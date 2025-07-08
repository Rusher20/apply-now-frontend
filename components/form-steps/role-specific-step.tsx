"use client";

import { useQuery } from "@apollo/client";
import { GET_POSITION } from "@/graphql/query/get-position";
import { Settings } from "lucide-react";
import type { FormData } from "@/app/page";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

interface RoleSpecificStepProps {
  formData: FormData;
  updateRoleSpecific: (updates: Partial<FormData["roleSpecific"]>) => void;
}

interface OptionWithInput {
  value: string;
  input?: string;
}

export function RoleSpecificStep({
  formData,
  updateRoleSpecific,
}: RoleSpecificStepProps) {
  const { data, loading } = useQuery(GET_POSITION);

  if (!formData.position) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please select a position first to see role-specific questions.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Loading questions...</div>
    );
  }

  const selected = data?.positions?.find(
    (pos: any) => pos.value === formData.position
  );
  const questions = (selected?.questions ?? []).filter((q: any) => q.required);

  const handleChange = (qId: number, value: any) => {
    updateRoleSpecific({ [qId]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Role-Specific Questions</h2>
      </div>

      {questions.map((q: any) => {
        const stored = formData.roleSpecific?.[q.id];
        const valueObj: OptionWithInput = typeof stored === "object" ? stored : { value: stored };
        const currentValue = valueObj.value || "";
        const selectedOptions = (formData.roleSpecific?.[q.id] as OptionWithInput[]) || [];

        return (
          <div key={q.id} className="space-y-2">
            <Label>
              {q.label}
              {q.required && <span className="text-red-500"> *</span>}
            </Label>

            {/* Text */}
            {q.type === "text" && (
              <Input
                placeholder={q.placeholder}
                value={currentValue}
                onChange={(e) => handleChange(q.id, e.target.value)}
              />
            )}

            {/* Number */}
            {q.type === "number" && (
              <Input
                type="number"
                placeholder={q.placeholder}
                value={currentValue}
                onChange={(e) => handleChange(q.id, e.target.value)}
              />
            )}

            {/* Textarea */}
            {q.type === "textarea" && (
              <Textarea
                placeholder={q.placeholder}
                value={currentValue}
                onChange={(e) => handleChange(q.id, e.target.value)}
              />
            )}

            {/* Radio */}
            {q.type === "radio" && (
              <RadioGroup
                value={currentValue}
                onValueChange={(val) => handleChange(q.id, { value: val })}
              >
                {q.options.map((opt: any) => (
                  <div key={opt.id} className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={opt.value} id={`${q.id}-${opt.id}`} />
                      <Label htmlFor={`${q.id}-${opt.id}`}>{opt.value}</Label>
                    </div>
                    {opt.requiresInput && currentValue === opt.value && (
                      <Input
                        className="ml-6 mt-1"
                        placeholder={opt.inputLabel || "Please specify"}
                        value={valueObj.input || ""}
                        onChange={(e) =>
                          handleChange(q.id, {
                            value: opt.value,
                            input: e.target.value,
                          })
                        }
                      />
                    )}
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Checkbox */}
            {q.type === "checkbox" && (
              <div className="space-y-2">
                {q.options.map((opt: any) => {
                  const hasObj = selectedOptions.find((o) => o.value === opt.value);
                  const checked = !!hasObj;
                  const inputVal = hasObj?.input || "";

                  return (
                    <div key={opt.id} className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`${q.id}-${opt.id}`}
                          checked={checked}
                          onCheckedChange={(chk) => {
                            const arr = [...selectedOptions];
                            let updated: OptionWithInput[] = [];
                            if (chk) {
                              updated = [
                                ...arr,
                                opt.requiresInput
                                  ? { value: opt.value, input: "" }
                                  : { value: opt.value },
                              ];
                            } else {
                              updated = arr.filter((o) => o.value !== opt.value);
                            }
                            handleChange(q.id, updated);
                          }}
                        />
                        <Label htmlFor={`${q.id}-${opt.id}`}>{opt.value}</Label>
                      </div>
                      {opt.requiresInput && checked && (
                        <Input
                          className="ml-6 mt-1"
                          placeholder={opt.inputLabel || "Please specify"}
                          value={inputVal}
                          onChange={(e) => {
                            const updated = selectedOptions.map((o) =>
                              o.value === opt.value
                                ? { ...o, input: e.target.value }
                                : o
                            );
                            handleChange(q.id, updated);
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dropdown */}
            {q.type === "dropdown" && (
              <>
                <Select
                  value={currentValue}
                  onValueChange={(val) => handleChange(q.id, { value: val })}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Choose…" />
                  </SelectTrigger>
                  <SelectContent>
                    {q.options.map((opt: any) => (
                      <SelectItem key={opt.id} value={opt.value}>
                        {opt.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Show input for dropdown with requiresInput */}
                {(() => {
                  const selectedOpt = q.options.find((o: any) => o.value === currentValue);
                  if (selectedOpt?.requiresInput) {
                    return (
                      <Input
                        className="mt-2"
                        placeholder={selectedOpt.inputLabel || "Please specify"}
                        value={valueObj.input || ""}
                        onChange={(e) =>
                          handleChange(q.id, {
                            value: currentValue,
                            input: e.target.value,
                          })
                        }
                      />
                    );
                  }
                  return null;
                })()}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
