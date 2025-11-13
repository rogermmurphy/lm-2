import { useState, useMemo } from "react";
import { 
  Upload, Download, Search, Eye, Edit, Trash2, 
  TrendingUp, TrendingDown, Award, AlertCircle, CheckCircle,
  Clock, Users, FileText, MessageSquare, BookOpen, BarChart3,
  Calendar, Star, Send, Plus, X
} from "lucide-react";

// 🎓 Enhanced LM Teacher View - Complete Implementation

// Helper Components
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-[#151922] rounded-xl p-6 border border-pink-500/20 hover:border-pink-500/40 transition">
    <div className="flex items-center justify-between mb-4">
      <Icon className={`w-8 h-8 text-${color}-400`} />
    </div>
    <div className={`text-3xl font-bold text-${color}-400 mb-2`}>{value}</div>
    <div className="text-gray-400 text-sm">{label}</div>
  </div>
);

const QuickActionButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="p-4 bg-[#1a1e29] rounded-xl border border-pink-500/20 hover:border-pink-500/40 hover:bg-[#1f2332] transition text-center"
  >
    <Icon className="w-6 h-6 mx-auto mb-2 text-pink-400" />
    <div className="text-sm font-semibold">{label}</div>
  </button>
);

const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-blue-500/20 text-blue-400 border-blue-500",
    graded: "bg-green-500/20 text-green-400 border-green-500",
    overdue: "bg-red-500/20 text-red-400 border-red-500",
    upcoming: "bg-purple-500/20 text-purple-400 border-purple-500",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500"
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.active}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Main Component
export default function LMTeacherView() {
  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: BarChart3 },
    { id: "gradebook", name: "Gradebook", icon: BookOpen },
    { id: "assignments", name: "Assignments", icon: FileText },
    { id: "submissions", name: "Submissions", icon: Upload },
    { id: "students", name: "Students", icon: Users },
    { id: "analytics", name: "Analytics", icon: TrendingUp },
    { id: "messages", name: "Messages", icon: MessageSquare },
  ];

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewAssignmentModal, setShowNewAssignmentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data
  const courseData = {
    name: "Algebra 1 – 2nd Period",
    classAverage: 87.3,
    totalStudents: 28,
    pendingGrades: 12,
    avgCompletionRate: 94,
    
    recentActivity: [
      { id: 1, student: "Emma Johnson", action: "submitted Chemistry Lab", time: "5 min ago", status: "new" },
      { id: 2, student: "Michael Chen", action: "received 95% on Math Quiz", time: "15 min ago", status: "success" },
      { id: 3, student: "David Thompson", action: "missed assignment deadline", time: "1 hour ago", status: "warning" },
    ],

    assignments: [
      { id: 1, title: "Quadratic Equations", due: "Nov 14, 2025", dueTime: "11:59 PM", points: 20, submitted: 24, total: 28, graded: 18, avgScore: 85, status: "active", category: "Homework" },
      { id: 2, title: "Vertex Form Quiz", due: "Nov 18, 2025", dueTime: "2:00 PM", points: 10, submitted: 28, total: 28, graded: 28, avgScore: 92, status: "graded", category: "Quiz" },
      { id: 3, title: "Factoring Practice", due: "Nov 12, 2025", dueTime: "11:59 PM", points: 15, submitted: 22, total: 28, graded: 20, avgScore: 78, status: "overdue", category: "Homework" },
      { id: 4, title: "Unit 3 Test", due: "Nov 22, 2025", dueTime: "1:00 PM", points: 100, submitted: 0, total: 28, graded: 0, avgScore: 0, status: "upcoming", category: "Test" },
    ],

    students: [
      { id: 1, name: "Emma Johnson", email: "emma.j@school.edu", average: 95.2, trend: "up", completed: 20, total: 20, absences: 1, participationScore: 98 },
      { id: 2, name: "Michael Chen", email: "michael.c@school.edu", average: 88.5, trend: "up", completed: 19, total: 20, absences: 2, participationScore: 92 },
      { id: 3, name: "Sarah Martinez", email: "sarah.m@school.edu", average: 97.8, trend: "stable", completed: 20, total: 20, absences: 0, participationScore: 100 },
      { id: 4, name: "David Thompson", email: "david.t@school.edu", average: 72.3, trend: "down", completed: 15, total: 20, absences: 5, participationScore: 68 },
      { id: 5, name: "Olivia Brown", email: "olivia.b@school.edu", average: 91.2, trend: "up", completed: 19, total: 20, absences: 1, participationScore: 95 },
      { id: 6, name: "James Wilson", email: "james.w@school.edu", average: 85.7, trend: "stable", completed: 18, total: 20, absences: 2, participationScore: 88 },
    ],

    submissions: [
      { id: 1, student: "Emma Johnson", assignment: "Quadratic Equations", submitted: "Nov 10, 11:45 PM", grade: null, status: "pending" },
      { id: 2, student: "Sarah Martinez", assignment: "Quadratic Equations", submitted: "Nov 10, 10:20 PM", grade: 19, status: "graded" },
      { id: 3, student: "Michael Chen", assignment: "Vertex Form Quiz", submitted: "Nov 8, 1:55 PM", grade: 9, status: "graded" },
    ],

    messages: [
      { id: 1, from: "Emma Johnson", subject: "Question about Quiz", preview: "Hi Ms. Anderson, I have a question about...", time: "10 min ago", unread: true },
      { id: 2, from: "Parent - David Thompson", subject: "Concern about grades", preview: "Hello, I wanted to discuss...", time: "1 hour ago", unread: true },
    ]
  };

  // Statistics
  const stats = useMemo(() => {
    const students = courseData.students;
    const topPerformers = students.filter(s => s.average >= 90).length;
    const needsAttention = students.filter(s => s.average < 75).length;
    const avgParticipation = (students.reduce((acc, s) => acc + s.participationScore, 0) / students.length).toFixed(1);
    
    return { topPerformers, needsAttention, avgParticipation };
  }, [courseData.students]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    let filtered = courseData.students;
    
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterStatus === "high") filtered = filtered.filter(s => s.average >= 90);
    else if (filterStatus === "medium") filtered = filtered.filter(s => s.average >= 75 && s.average < 90);
    else if (filterStatus === "low") filtered = filtered.filter(s => s.average < 75);
    
    return filtered;
  }, [courseData.students, searchQuery, filterStatus]);

  // Render functions
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={courseData.totalStudents} color="pink" />
        <StatCard icon={BarChart3} label="Class Average" value={`${courseData.classAverage}%`} color="purple" />
        <StatCard icon={FileText} label="Pending Grades" value={courseData.pendingGrades} color="yellow" />
        <StatCard icon={TrendingUp} label="Completion" value={`${courseData.avgCompletionRate}%`} color="green" />
      </div>

      <div className="bg-[#151922] rounded-xl p-6 border border-pink-500/20">
        <h3 className="text-lg font-semibold mb-4 text-pink-400">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickActionButton icon={Plus} label="New Assignment" onClick={() => setShowNewAssignmentModal(true)} />
          <QuickActionButton icon={Upload} label="Upload Materials" onClick={() => setShowUploadModal(true)} />
          <QuickActionButton icon={Download} label="Export Grades" onClick={() => alert("Exporting...")} />
          <QuickActionButton icon={MessageSquare} label="Messages" onClick={() => setActiveTab("messages")} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#151922] rounded-xl p-6 border border-pink-500/20">
          <h3 className="text-lg font-semibold mb-4 text-pink-400">Recent Activity</h3>
          <div className="space-y-3">
            {courseData.recentActivity.map((activity) => (
              <div key={activity.id} className="p-3 bg-[#1a1e29] rounded-lg flex gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === 'new' ? 'bg-blue-400' :
                  activity.status === 'success' ? 'bg-green-400' : 'bg-yellow-400'
                }`} />
                <div className="flex-1">
                  <div className="font-semibold text-sm">{activity.student}</div>
                  <div className="text-gray-400 text-xs">{activity.action}</div>
                  <div className="text-gray-500 text-xs mt-1">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#151922] rounded-xl p-6 border border-pink-500/20">
          <h3 className="text-lg font-semibold mb-4 text-pink-400">Upcoming Assignments</h3>
          <div className="space-y-3">
            {courseData.assignments.filter(a => a.status === "active" || a.status === "upcoming").slice(0, 3).map((a) => (
              <div key={a.id} className="p-3 bg-[#1a1e29] rounded-lg">
                <div className="flex justify-between mb-2">
                  <h4 className="font-semibold text-sm">{a.title}</h4>
                  <span className="text-xs text-pink-400 font-bold">{a.points}pts</span>
                </div>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span>{a.due}</span>
                  <span>{a.submitted}/{a.total} submitted</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#151922] rounded-xl p-6 border border-pink-500/20">
        <h3 className="text-lg font-semibold mb-4 text-pink-400">Class Performance</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-[#1a1e29] rounded-lg">
            <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">{stats.topPerformers}</div>
            <div className="text-sm text-gray-400">Top Performers</div>
          </div>
          <div className="text-center p-4 bg-[#1a1e29] rounded-lg">
            <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-400">{stats.avgParticipation}%</div>
            <div className="text-sm text-gray-400">Participation</div>
          </div>
          <div className="text-center p-4 bg-[#1a1e29] rounded-lg">
            <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-400">{stats.needsAttention}</div>
            <div className="text-sm text-gray-400">Need Help</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGradebook = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-pink-400">Gradebook</h2>
        <button className="px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="bg-[#151922] rounded-xl border border-pink-500/20 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#1a1e29] border-b border-pink-500/20">
            <tr>
              <th className="px-4 py-3 text-left text-pink-400">Student</th>
              {courseData.assignments.slice(0, 3).map((a) => (
                <th key={a.id} className="px-4 py-3 text-center text-pink-400 min-w-[100px]">
                  <div className="text-sm">{a.title.substring(0, 15)}...</div>
                  <div className="text-xs text-gray-400">{a.points}pts</div>
                </th>
              ))}
              <th className="px-4 py-3 text-center text-pink-400">Average</th>
            </tr>
          </thead>
          <tbody>
            {courseData.students.map((s) => (
              <tr key={s.id} className="border-b border-gray-800 hover:bg-[#1a1e29]">
                <td className="px-4 py-3 font-semibold">{s.name}</td>
                {courseData.assignments.slice(0, 3).map((a) => (
                  <td key={a.id} className="px-4 py-3 text-center">
                    <input 
                      type="number" 
                      className="w-16 bg-[#0b0d10] border border-gray-700 rounded px-2 py-1 text-center"
                      placeholder="--"
                      max={a.points}
                    />
                  </td>
                ))}
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold ${
                    s.average >= 90 ? 'text-green-400' :
                    s.average >= 80 ? 'text-blue-400' :
                    s.average >= 70 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {s.average.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-pink-400">Assignments</h2>
        <button 
          onClick={() => setShowNewAssignmentModal(true)}
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      <div className="grid gap-4">
        {courseData.assignments.map((a) => (
          <div key={a.id} className="bg-[#151922] rounded-xl p-6 border border-pink-500/20">
            <div className="flex justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{a.title}</h3>
                  <StatusBadge status={a.status} />
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                    {a.category}
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>Due: {a.due} at {a.dueTime}</span>
                  <span>{a.points} points</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-pink-500/20 rounded-lg"><Edit className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
              <div>
                <div className="text-sm text-gray-400">Submitted</div>
                <div className="text-2xl font-bold text-pink-400">{a.submitted}/{a.total}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Graded</div>
                <div className="text-2xl font-bold text-blue-400">{a.graded}/{a.submitted}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Avg Score</div>
                <div className="text-2xl font-bold text-green-400">{a.graded > 0 ? `${a.avgScore}%` : '--'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSubmissions = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-pink-400">Recent Submissions</h2>
      <div className="bg-[#151922] rounded-xl border border-pink-500/20">
        <table className="w-full">
          <thead className="bg-[#1a1e29] border-b border-pink-500/20">
            <tr>
              <th className="px-4 py-3 text-left text-pink-400">Student</th>
              <th className="px-4 py-3 text-left text-pink-400">Assignment</th>
              <th className="px-4 py-3 text-left text-pink-400">Submitted</th>
              <th className="px-4 py-3 text-center text-pink-400">Grade</th>
              <th className="px-4 py-3 text-center text-pink-400">Status</th>
              <th className="px-4 py-3 text-center text-pink-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courseData.submissions.map((sub) => (
              <tr key={sub.id} className="border-b border-gray-800 hover:bg-[#1a1e29]">
                <td className="px-4 py-3">{sub.student}</td>
                <td className="px-4 py-3">{sub.assignment}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{sub.submitted}</td>
                <td className="px-4 py-3 text-center">{sub.grade || '--'}</td>
                <td className="px-4 py-3 text-center"><StatusBadge status={sub.status} /></td>
                <td className="px-4 py-3 text-center">
                  <button className="px-3 py-1 bg-pink-500 hover:bg-pink-600 rounded text-sm">Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-pink-400">Students</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#1a1e29] border border-gray-700 rounded-lg"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-[#1a1e29] border border-gray-700 rounded-lg"
          >
            <option value="all">All</option>
            <option value="high">High (90%+)</option>
            <option value="medium">Average (75-90%)</option>
            <option value="low">Struggling (&lt;75%)</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filteredStudents.map((s) => (
          <div key={s.id} className="bg-[#151922] rounded-xl p-5 border border-pink-500/20 hover:border-pink-500/40 cursor-pointer">
            <div className="flex justify-between mb-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center font-bold">
                  {s.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-sm text-gray-400">{s.email}</p>
                </div>
              </div>
              {s.trend === "up" && <TrendingUp className="w-5 h-5 text-green-400" />}
              {s.trend === "down" && <TrendingDown className="w-5 h-5 text-red-400" />}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-[#1a1e29] rounded-lg">
                <div className={`text-xl font-bold ${
                  s.average >= 90 ? 'text-green-400' :
                  s.average >= 80 ? 'text-blue-400' :
                  s.average >= 70 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {s.average.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">Average</div>
              </div>
              <div className="text-center p-2 bg-[#1a1e29] rounded-lg">
                <div className="text-xl font-bold text-pink-400">{s.completed}/{s.total}</div>
                <div className="text-xs text-gray-400">Done</div>
              </div>
              <div className="text-center p-2 bg-[#1a1e29] rounded-lg">
                <div className="text-xl font-bold text-purple-400">{s.absences}</div>
                <div className="text-xs text-gray-400">Absent</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-pink-400">Analytics</h2>
      <div className="bg-[#151922] rounded-xl p-6 border border-pink-500/20">
        <p className="text-gray-400 mb-4">Performance metrics and insights</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#1a1e29] rounded-lg">
            <h3 className="font-semibold mb-2">Grade Distribution</h3>
            <div className="h-40 flex items-end justify-around gap-2">
              <div className="flex-1 bg-red-500 rounded-t" style={{height: '30%'}}></div>
              <div className="flex-1 bg-yellow-500 rounded-t" style={{height: '50%'}}></div>
              <div className="flex-1 bg-blue-500 rounded-t" style={{height: '70%'}}></div>
              <div className="flex-1 bg-green-500 rounded-t" style={{height: '90%'}}></div>
            </div>
            <div className="flex justify-around mt-2 text-xs text-gray-400">
              <span>F</span><span>D</span><span>C</span><span>B</span><span>A</span>
            </div>
          </div>
          <div className="p-4 bg-[#1a1e29] rounded-lg">
            <h3 className="font-semibold mb-2">Completion Trend</h3>
            <div className="h-40 flex items-end justify-around gap-1">
              {[85, 88, 92, 89, 94, 91, 94].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-pink-500 to-purple-600 rounded-t" style={{height: `${h}%`}}></div>
              ))}
            </div>
            <div className="text-center mt-2 text-xs text-gray-400">Last 7 days</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-pink-400">Messages</h2>
      <div className="bg-[#151922] rounded-xl p-6 border border-pink-500/20">
        <div className="space-y-3 mb-4">
          {courseData.messages.map((msg) => (
            <div key={msg.id} className={`p-4 rounded-lg cursor-pointer ${msg.unread ? 'bg-pink-500/10 border border-pink-500/30' : 'bg-[#1a1e29]'}`}>
              <div className="flex justify-between mb-2">
                <div className="font-semibold">{msg.from}</div>
                <div className="text-xs text-gray-400">{msg.time}</div>
              </div>
              <div className="text-sm mb-1">{msg.subject}</div>
              <div className="text-xs text-gray-400">{msg.preview}</div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <textarea
            placeholder="Write a message..."
            className="w-full bg-[#1a1e29] rounded-lg p-3 h-32 border border-gray-700"
          />
          <button className="px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send Message
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboard();
      case "gradebook": return renderGradebook();
      case "assignments": return renderAssignments();
      case "submissions": return renderSubmissions();
      case "students": return renderStudents();
      case "analytics": return renderAnalytics();
      case "messages": return renderMessages();
      default: return renderDashboard();
    }
  };

  // Main render
  return (
    <div className="min-h-screen bg-[#0b0d10] text-white font-[Poppins]">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-pink-500/30 bg-gradient-to-r from-[#6b46c1] to-[#ff62b0]">
        <h1 className="text-2xl font-bold">{courseData.name} – Teacher View</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition"
        >
          + Upload
        </button>
      </header>

      {/* Tabs */}
      <nav className="flex gap-3 px-4 py-3 border-b border-gray-800 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
                activeTab === tab.id
                  ? "bg-pink-600 text-white"
                  : "bg-[#151922] text-gray-300 hover:bg-[#1d2330]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <main className="p-6">{renderContent()}</main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#151922] rounded-2xl p-6 w-96 relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-pink-400">
              Upload Materials
            </h2>
            <input
              type="text"
              placeholder="Title"
              className="w-full mb-2 p-2 rounded bg-[#1a1e29] border border-gray-700"
            />
            <textarea
              placeholder="Description"
              className="w-full mb-3 p-2 rounded bg-[#1a1e29] h-24 border border-gray-700"
            />
            <input
              type="file"
              className="w-full mb-3 text-sm text-gray-300"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-600">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Assignment Modal */}
      {showNewAssignmentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#151922] rounded-2xl p-6 w-[500px] relative">
            <button
              onClick={() => setShowNewAssignmentModal(false)}
              className="absolute top-4 right-4"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-pink-400">
              Create New Assignment
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Assignment Title"
                className="w-full p-2 rounded bg-[#1a1e29] border border-gray-700"
              />
              <textarea
                placeholder="Description"
                className="w-full p-2 rounded bg-[#1a1e29] h-24 border border-gray-700"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="p-2 rounded bg-[#1a1e29] border border-gray-700"
                />
                <input
                  type="time"
                  className="p-2 rounded bg-[#1a1e29] border border-gray-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Points"
                  className="p-2 rounded bg-[#1a1e29] border border-gray-700"
                />
                <select className="p-2 rounded bg-[#1a1e29] border border-gray-700">
                  <option>Homework</option>
                  <option>Quiz</option>
                  <option>Test</option>
                  <option>Project</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowNewAssignmentModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-600">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
