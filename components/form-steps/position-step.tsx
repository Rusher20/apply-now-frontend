"use client"

import { useQuery } from "@apollo/client"
import { GET_POSITION } from "@/graphql/query/get-position"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  Briefcase,
  Users,
  Calculator,
  TrendingUp,
  LucideIcon,
} from "lucide-react"
import type { FormData } from "@/app/page"

interface PositionStepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

// Dynamically map string to icon component
const getIcon = (iconName: string): LucideIcon => {
  switch (iconName.toLowerCase()) {
    case "users":
      return Users
    case "briefcase":
      return Briefcase
    case "calculator":
      return Calculator
    case "trendingup":
      return TrendingUp
    default:
      return Briefcase
  }
}

interface Position {
  id: number
  title: string
  description: string
  value: string
  icon: string
  isActive: boolean // ✅ Include isActive for filtering
}

export function PositionStep({ formData, updateFormData }: PositionStepProps) {
  const { data, loading, error } = useQuery(GET_POSITION)

  const handlePositionChange = (value: string) => {
    updateFormData({
      position: value,
      roleSpecific: {}, // Reset when position changes
    })
  }

  if (loading) {
    return <p className="text-center py-4 text-gray-500">Loading positions...</p>
  }

  if (error) {
    return <p className="text-center py-4 text-red-500">Failed to load positions.</p>
  }

  // ✅ Filter only active positions
  const positions: Position[] = (data?.positions ?? []).filter(
    (p: Position) => p.isActive
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Position Selection</h2>
      </div>

      <div className="space-y-4">
        <Label>Which position are you applying for? *</Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {positions.map((position) => {
            const Icon = getIcon(position.icon)
            const isSelected = formData.position === position.value

            return (
              <Card
                key={position.value}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
                }`}
                onClick={() => handlePositionChange(position.value)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 ${
                        isSelected ? "text-blue-600" : "text-gray-600"
                      }`}
                    />
                    <CardTitle className="text-base">{position.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{position.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-6">
          <Label>Or select from dropdown:</Label>
          <Select value={formData.position} onValueChange={handlePositionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a position" />
            </SelectTrigger>
            <SelectContent>
              {positions.map((position) => (
                <SelectItem key={position.value} value={position.value}>
                  {position.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
