// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#050505]">
        <h1 className="text-2xl font-bold text-black dark:text-white mb-2 px-2">
          Welcome back!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's an overview of your FST Platform activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#050505]">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Students
          </p>
          <p className="mt-2 text-3xl font-bold text-black dark:text-white">
            2,841
          </p>
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
            +12%
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#050505]">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Active Courses
          </p>
          <p className="mt-2 text-3xl font-bold text-black dark:text-white">
            47
          </p>
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">+3</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#050505]">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Completion Rate
          </p>
          <p className="mt-2 text-3xl font-bold text-black dark:text-white">
            89%
          </p>
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">+5%</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#050505]">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Avg. Performance
          </p>
          <p className="mt-2 text-3xl font-bold text-black dark:text-white">
            85%
          </p>
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">+2%</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#050505]">
        <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          {[
            {
              course: "Database Systems",
              code: "CSE 301",
              time: "2 hours ago",
            },
            { course: "Web Development", code: "CSE 405", time: "5 hours ago" },
            {
              course: "Software Engineering",
              code: "CSE 327",
              time: "1 day ago",
            },
          ].map((activity, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 dark:border-white/5"
            >
              <div>
                <p className="text-sm font-medium text-black dark:text-white">
                  Course assignment graded
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {activity.code} - {activity.course}
                </p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
