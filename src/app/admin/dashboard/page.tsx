"use client";

import { SemesterSelector } from "@/components/Supervisor/SemesterSelector";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Award,
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  GraduationCap,
  MessageSquare,
  RefreshCw,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface Activity {
  id: string;
  type: "submission" | "approval" | "rejection" | "comment";
  title: string;
  description: string;
  time: string;
  groupNo: string;
  status: "success" | "warning" | "error" | "info";
}

interface Supervisor {
  id: string;
  name: string;
  email: string;
  department: string;
  assignedGroups: number;
  completedGroups: number;
  pendingGroups: number;
  avatar: string;
  performance: number;
}

export default function AdminDashboard() {
  const [selectedSemester, setSelectedSemester] = useState("Spring 2025-26");

  // Stats Data
  const stats = [
    {
      title: "Total Students",
      value: "1,284",
      change: "+12%",
      icon: Users,
      color: "bg-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Active Supervisors",
      value: "48",
      change: "+5%",
      icon: UserCheck,
      color: "bg-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Thesis Groups",
      value: "156",
      change: "+18%",
      icon: GraduationCap,
      color: "bg-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Completed Theses",
      value: "89",
      change: "+23%",
      icon: Award,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      textColor: "text-yellow-600 dark:text-yellow-400",
    },
  ];

  // Submission Stats
  const submissionStats = [
    {
      label: "Submitted",
      value: 12,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      label: "Action Needed",
      value: 3,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    {
      label: "Resubmitted",
      value: 5,
      icon: RefreshCw,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      label: "Cancelled",
      value: 2,
      icon: XCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
    },
    {
      label: "Complete",
      value: 8,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
  ];

  // Recent Activities
  const recentActivities: Activity[] = [
    {
      id: "1",
      type: "submission",
      title: "New Thesis Submission",
      description: "Group G01 submitted their final thesis book",
      time: "10 minutes ago",
      groupNo: "G01",
      status: "success",
    },
    {
      id: "2",
      type: "approval",
      title: "Thesis Approved",
      description: "Dr. Smith approved thesis for Group G03",
      time: "1 hour ago",
      groupNo: "G03",
      status: "success",
    },
    {
      id: "3",
      type: "rejection",
      title: "Revision Required",
      description: "Group G05 needs to resubmit plagiarism report",
      time: "3 hours ago",
      groupNo: "G05",
      status: "error",
    },
    {
      id: "4",
      type: "comment",
      title: "New Comment",
      description: "Supervisor added feedback on Group G02",
      time: "5 hours ago",
      groupNo: "G02",
      status: "info",
    },
    {
      id: "5",
      type: "submission",
      title: "OBE Marks Uploaded",
      description: "Group G04 uploaded OBE marksheet",
      time: "1 day ago",
      groupNo: "G04",
      status: "success",
    },
  ];

  // Supervisor Performance Data
  const supervisors: Supervisor[] = [
    {
      id: "1",
      name: "Dr. John Smith",
      email: "john.smith@university.edu",
      department: "Computer Science",
      assignedGroups: 8,
      completedGroups: 6,
      pendingGroups: 2,
      avatar: "JS",
      performance: 92,
    },
    {
      id: "2",
      name: "Prof. Sarah Johnson",
      email: "sarah.johnson@university.edu",
      department: "Software Engineering",
      assignedGroups: 6,
      completedGroups: 5,
      pendingGroups: 1,
      avatar: "SJ",
      performance: 88,
    },
    {
      id: "3",
      name: "Dr. Michael Lee",
      email: "michael.lee@university.edu",
      department: "Data Science",
      assignedGroups: 10,
      completedGroups: 7,
      pendingGroups: 3,
      avatar: "ML",
      performance: 85,
    },
    {
      id: "4",
      name: "Prof. Emily Brown",
      email: "emily.brown@university.edu",
      department: "Cybersecurity",
      assignedGroups: 5,
      completedGroups: 4,
      pendingGroups: 1,
      avatar: "EB",
      performance: 90,
    },
  ];

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "submission":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "approval":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejection":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBgColor = (status: Activity["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-50 dark:bg-green-900/10";
      case "error":
        return "bg-red-50 dark:bg-red-900/10";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/10";
      default:
        return "bg-blue-50 dark:bg-blue-900/10";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of thesis management system
          </p>
        </div>

        {/* Semester Selector */}
        <div className="mb-8">
          <SemesterSelector
            selectedSemester={selectedSemester}
            onSemesterChange={setSelectedSemester}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`rounded-lg ${stat.bgColor} p-3`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-black dark:text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Submission Status - Left Column */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-black dark:text-white">
                  Submission Status
                </h2>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {submissionStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg ${stat.bgColor} p-2`}>
                          <Icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {stat.label}
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-black dark:text-white">
                        {stat.value}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Overall Progress
                  </span>
                  <span className="font-semibold text-black dark:text-white">
                    68%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: "68%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities - Right Column */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-black dark:text-white">
                  Recent Activities
                </h2>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-3 p-3 rounded-lg ${getActivityBgColor(activity.status)}`}
                  >
                    <div className="mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-black dark:text-white">
                          {activity.title}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {activity.description}
                      </p>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        Group {activity.groupNo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Supervisor Performance Table */}
        <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-black dark:text-white">
                  Supervisor Performance
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Overview of supervisor activities and completion rates
                </p>
              </div>
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#050505] border-b border-gray-200 dark:border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">
                    Supervisor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">
                    Department
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white">
                    Assigned Groups
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white">
                    Pending
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {supervisors.map((supervisor) => (
                  <tr
                    key={supervisor.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {supervisor.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {supervisor.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {supervisor.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {supervisor.department}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                      {supervisor.assignedGroups}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        {supervisor.completedGroups}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
                        <Clock className="h-3 w-3" />
                        {supervisor.pendingGroups}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${supervisor.performance}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {supervisor.performance}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
