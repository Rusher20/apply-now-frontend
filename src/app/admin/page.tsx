"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_POSITION } from "@/graphql/query/get-position";
import { GET_JOB_APPLICATIONS } from "@/graphql/query/getApplication";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Users, Briefcase } from "lucide-react";
import Link from "next/link";
import LogoutButton from "../../../components/LogoutButton";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: appsData, loading: appsLoading } =
    useQuery(GET_JOB_APPLICATIONS);
  const { data: positionsData, loading: positionsLoading } =
    useQuery(GET_POSITION);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  const jobApplications = appsData?.jobApplications || [];
  const allPositions = positionsData?.positions || [];
  const activePositions = allPositions.filter((pos: any) => pos.isActive);
  const pendingReviewCount = jobApplications.filter(
    (app: any) => app.status === "pending"
  ).length;
  const reviewedCount = jobApplications.filter(
    (app: any) => app.status === "reviewed"
  ).length;
  const hiredCount = jobApplications.filter(
    (app: any) => app.status === "hired"
  ).length;
  const interviewedCount = jobApplications.filter(
    (app: any) => app.status === "interviewed"
  ).length;

  // Create recent activity from actual data
  const recentActivity = [
    ...jobApplications.slice(0, 2).map((app: any, index: number) => ({
      id: `app-${index}`,
      action: "New application received",
      position: app.position || "Unknown Position",
      time: new Date(app.createdAt).toLocaleDateString(),
      type: "application",
    })),
    ...activePositions.slice(0, 2).map((pos: any, index: number) => ({
      id: `pos-${index}`,
      action: "Active position",
      position: pos.title || "Unknown Position",
      time: new Date(pos.createdAt).toLocaleDateString(),
      type: "position",
    })),
  ].slice(0, 4);

  if (appsLoading || positionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex justify-between items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Users className="h-6 w-6" />
                </div>
                <div className="px-3 py-1 bg-white/20 text-white border border-white/30 rounded-full text-sm">
                  Admin Dashboard
                </div>
              </div>
              <h1 className="text-4xl font-bold">Welcome back!</h1>
              <p className="text-blue-100 text-lg">
                Manage your recruitment process efficiently
              </p>
            </div>
            <div className="hidden md:block">
              <LogoutButton />
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Applications
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {jobApplications.length}
                  </p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <Users className="h-3 w-3" />
                    All submissions
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Review
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {pendingReviewCount}
                  </p>
                  <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                    <Users className="h-3 w-3" />
                    Needs attention
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Positions
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {activePositions.length}
                  </p>
                  <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                    <Briefcase className="h-3 w-3" />
                    Currently hiring
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hired</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {hiredCount}
                  </p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <Users className="h-3 w-3" />
                    Great progress!
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Link href="/admin/applications" className="block">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-3 bg-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <span className="text-gray-900">Job Applications</span>
                    <div className="ml-2 inline-block px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-full">
                      {pendingReviewCount} pending
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Review and manage job applications from candidates. Track
                  application status, schedule interviews, and make hiring
                  decisions.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{reviewedCount} Reviewed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>{pendingReviewCount} Pending</span>
                  </div>
                </div>
                <Link href="/admin/applications" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <span>View Applications</span>
                    <Users className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/positions" className="block">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-3 bg-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <span className="text-gray-900">Position Management</span>
                    <div className="ml-2 inline-block px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-full">
                      {activePositions.length} active
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Create and manage job positions with custom questions. Define
                  role requirements, set up application forms, and control
                  position visibility.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{activePositions.length} Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>
                      {allPositions.length - activePositions.length} Inactive
                    </span>
                  </div>
                </div>
                <Link href="/admin/positions" className="block">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <span>Manage Positions</span>
                    <Briefcase className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-gray-700" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === "application"
                          ? "bg-blue-100"
                          : activity.type === "position"
                          ? "bg-green-100"
                          : "bg-orange-100"
                      }`}
                    >
                      {activity.type === "application" ? (
                        <Users className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Briefcase className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.position}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="md:hidden flex justify-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
