import { useEffect, useState, useCallback } from "react";
import {
  BookOpen,Users,Library,Layers,BarChart2,User,BookMarked,Info,Menu,X,AlertCircle,CheckCircle2,Wifi,WifiOff,
  Inbox,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

/* ── Helpers ────────────────────────────────────────────── */

const COURSES = [
  "Data Structures",
  "Object Oriented Programming",
  "Digital Principles and System Design",
  "Communication Engineering",
  "Discrete Mathematics",
];

function displayValue(v) {
  return v === null || v === undefined || v === "" ? "—" : v;
}

function tagClass(val) {
  if (!val) return "rec-tag";
  const v = String(val).toLowerCase();
  if (v === "beginner") return "rec-tag beginner";
  if (v === "intermediate") return "rec-tag intermediate";
  if (v === "notes") return "rec-tag notes";
  if (v === "video") return "rec-tag video";
  if (v === "practice") return "rec-tag practice";
  return "rec-tag";
}

function getWhyText(item) {
  if (Number(item.Priority) === 1) {
    return `This resource is given higher priority based on the student's learning activity cluster. ${item.Difficulty}-level material was identified as most appropriate for this learner profile.`;
  }
  return "This resource is provided as a secondary learning option for this course, complementing the primary recommendation.";
}

/* ── Sidebar nav items ──────────────────────────────────── */
const NAV_ITEMS = [
  { id: "overview",        label: "Overview",         icon: BarChart2  },
  { id: "students",        label: "Students",         icon: Users      },
  { id: "recommendations", label: "Recommendations",  icon: BookMarked },
  { id: "about",           label: "About the System", icon: Info       },
];

/* ══════════════════════════════════════════════════════════
   APP
══════════════════════════════════════════════════════════ */
export default function App() {
  /* state */
  const [stats, setStats]                 = useState(null);
  const [students, setStudents]           = useState([]);
  const [studentId, setStudentId]         = useState("201801001");
  const [courseName, setCourseName]       = useState("Data Structures");
  const [profile, setProfile]             = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [cluster, setCluster]             = useState(null);

  const [loading, setLoading]             = useState(false);
  const [statsLoading, setStatsLoading]   = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [appReady, setAppReady]           = useState(false);

  const [apiConnected, setApiConnected]   = useState(false);
  const [error, setError]                 = useState("");

  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);

  /* ── data fetchers ──────────────────────────────────── */
  const loadStudentData = useCallback(
    async (id, course) => {
      setLoading(true);
      setError("");
      setProfile(null);
      setRecommendations([]);
      setCluster(null);

      try {
        const [profileRes, recRes] = await Promise.all([
          fetch(`${API}/api/students/${id}`),
          fetch(
            `${API}/api/students/${id}/personalized-recommendations?course_name=${encodeURIComponent(
              course
            )}`
          ),
        ]);

        if (!profileRes.ok || !recRes.ok) {
          throw new Error("Student data or course recommendations not found.");
        }

        const [profileData, recData] = await Promise.all([
          profileRes.json(),
          recRes.json(),
        ]);

        setProfile(profileData);
        setRecommendations(recData.recommendations ?? []);
        setCluster(recData.cluster ?? null);
      } catch (err) {
        setError(err.message || "Unable to load student recommendations.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ── init ───────────────────────────────────────────── */
  useEffect(() => {
    let alive = true;

    async function init() {
      try {
        const [sRes, stRes] = await Promise.all([
          fetch(`${API}/api/stats`),
          fetch(`${API}/api/students`),
        ]);
        if (!sRes.ok || !stRes.ok) throw new Error("Unable to connect to the backend.");

        const [statsData, studentsData] = await Promise.all([
          sRes.json(),
          stRes.json(),
        ]);
        if (!alive) return;

        setStats(statsData);
        setStudents(studentsData);
        setApiConnected(true);

        if (studentsData.length > 0) {
          const firstId = String(studentsData[0]["Student-Id"]);
          setStudentId(firstId);
          await loadStudentData(firstId, "Data Structures");
        } else {
          setError("No student records found.");
        }
      } catch (err) {
        if (alive) {
          setApiConnected(false);
          setError(err.message || "Backend connection failed.");
        }
      } finally {
        if (alive) {
          setStatsLoading(false);
          setStudentsLoading(false);
          setTimeout(() => { if (alive) setAppReady(true); }, 800);
        }
      }
    }

    init();
    return () => { alive = false; };
  }, [loadStudentData]);

  /* ── actions ────────────────────────────────────────── */
  function handleGetRecommendations() {
    if (!studentId) { setError("Please select a student ID."); return; }
    loadStudentData(studentId, courseName);
  }

  function handleCourseSelect(c) {
    setCourseName(c);
  }

  /* ── loading screen ─────────────────────────────────── */
  if (!appReady) {
    return (
      <div className="app-loader">
        <div className="app-loader-mark">✦</div>
        <div>
          <h1>Personalized Learning System</h1>
          <p>Analyzing learner profiles and preparing your dashboard…</p>
        </div>
        <div className="app-loader-bar">
          <div className="app-loader-bar-fill" />
        </div>
        <div className="app-loader-steps">
          <div className={`app-loader-step ${apiConnected ? "done" : "active"}`}>
            {apiConnected ? "✓" : "○"}&nbsp; Connecting to recommendation API
          </div>
          <div className={`app-loader-step ${students.length > 0 ? "done" : "active"}`}>
            {students.length > 0 ? "✓" : "○"}&nbsp; Loading student profiles
          </div>
          <div className="app-loader-step active">○&nbsp; Preparing dashboard</div>
        </div>
      </div>
    );
  }

  /* ── main render ────────────────────────────────────── */
  return (
    <div className="app-shell">

      {/* Sidebar overlay (mobile) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ═══ Sidebar ═══ */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <BookOpen size={16} />
          </div>
          <div className="sidebar-logo-text">
            PL Recommender
            <span>Brainware University</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Navigation</div>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`sidebar-nav-item ${activeSection === id ? "active" : ""}`}
              onClick={() => { setActiveSection(id); setSidebarOpen(false); }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer / API status */}
        <div className="sidebar-footer">
          <div className={`api-status-pill ${apiConnected ? "online" : "offline"}`}>
            <span className="api-status-dot" />
            {apiConnected ? "API Connected" : "API Offline"}
          </div>
        </div>
      </aside>

      {/* ═══ Main ═══ */}
      <div className="main-content">

        {/* Top bar */}
        <div className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-nav-toggle"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle navigation"
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            <div>
              <div className="topbar-title">
                {NAV_ITEMS.find(n => n.id === activeSection)?.label}
              </div>
              <div className="topbar-subtitle">K-Means ML Recommendation System</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {apiConnected
              ? <Wifi size={14} color="var(--accent)" />
              : <WifiOff size={14} color="#DC2626" />}
            <span style={{ fontSize: 11.5, color: apiConnected ? "var(--accent)" : "#DC2626", fontWeight: 600 }}>
              {apiConnected ? "Live" : "Offline"}
            </span>
          </div>
        </div>

        {/* Page body */}
        <div className="page-body">

          {/* ─── OVERVIEW SECTION ─── */}
          {activeSection === "overview" && (
            <>
              <div style={{ marginBottom: 24 }}>
                <div className="section-label">Learning Analytics</div>
                <div className="section-title">Dashboard Overview</div>
                <div className="section-desc">
                  Understand student activity and discover personalized ML-driven learning recommendations.
                </div>
              </div>

              {/* Stats */}
              <div className="stats-grid">
                {[
                  { label: "Total Students",      value: stats?.total_students,      icon: Users,    cls: "green"  },
                  { label: "Available Courses",   value: stats?.total_courses,       icon: Layers,   cls: "blue"   },
                  { label: "Learning Resources",  value: stats?.total_resources,     icon: Library,  cls: "amber"  },
                  { label: "Total Recommendations", value: stats?.total_recommendations, icon: BookMarked, cls: "purple" },
                ].map(({ label, value, icon: Icon, cls }) => (
                  <div className="stat-card" key={label}>
                    <div className={`stat-card-icon ${cls}`}><Icon size={16} /></div>
                    {statsLoading
                      ? <div className="skel skel-num" />
                      : <div className="stat-card-value">{value ?? "—"}</div>}
                    <div className="stat-card-label">{label}</div>
                  </div>
                ))}
              </div>

              {/* Full-width Student Explorer card */}
              <div className="card explorer-card" style={{ marginBottom: 14 }}>
                <div className="card-header">
                  <div className="card-header-left">
                    <div className="card-title">Student Explorer</div>
                    <div className="card-subtitle">Select a student and subject to view personalized recommendations</div>
                  </div>
                  <div className="card-header-icon"><Users size={15} /></div>
                </div>

                <div className="explorer-row">
                  <div className="field-wrap">
                    <label className="field-label">Student ID</label>
                    <select
                      className="field-select"
                      value={studentId}
                      disabled={studentsLoading || students.length === 0}
                      onChange={e => setStudentId(e.target.value)}
                    >
                      {students.map(s => (
                        <option key={s["Student-Id"]} value={s["Student-Id"]}>
                          {s["Student-Id"]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field-wrap">
                    <label className="field-label">Course</label>
                    <select
                      className="field-select"
                      value={courseName}
                      onChange={e => setCourseName(e.target.value)}
                    >
                      {COURSES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field-wrap field-wrap-btn">
                    <label className="field-label" style={{ visibility: "hidden" }}>Action</label>
                    <button
                      className="btn-primary"
                      onClick={handleGetRecommendations}
                      disabled={loading || studentsLoading || !apiConnected}
                    >
                      {loading
                        ? (<><span className="btn-spinner" /> Analyzing…</>)
                        : (<>Get Recommendations <ChevronRight size={14} /></>)}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="alert-error" style={{ marginTop: 12 }}>
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    {error}
                  </div>
                )}
              </div>

              {/* Compact collapsible Student Profile strip — only shown after data loads */}
              {loading && (
                <div className="card" style={{ marginBottom: 14 }}>
                  <div className="inline-loading">
                    <div className="spinner-ring" />
                    <span>Analyzing learner profile…</span>
                  </div>
                </div>
              )}

              {!loading && profile && (
                <div className="profile-strip" style={{ marginBottom: 14 }}>
                  <button
                    className="profile-strip-toggle"
                    onClick={() => setProfileExpanded(o => !o)}
                    aria-expanded={profileExpanded}
                  >
                    <div className="profile-strip-left">
                      <div className="profile-strip-avatar"><User size={14} /></div>
                      <div className="profile-strip-info">
                        <span className="profile-strip-id">Student {profile["Student-Id"]}</span>
                        {cluster !== null && (
                          <span className="profile-strip-cluster">
                            <CheckCircle2 size={10} />
                            Cluster {cluster} — {cluster === 0 ? "Foundation Learner" : "High-Engagement Learner"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="profile-strip-right">
                      <span className="profile-strip-hint">{profileExpanded ? "Collapse" : "View profile"}</span>
                      <ChevronDown
                        size={14}
                        style={{
                          transition: "transform .2s",
                          transform: profileExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </div>
                  </button>

                  {profileExpanded && (
                    <div className="profile-strip-body">
                      <div className="profile-metrics">
                        {[
                          { label: "Student ID",        value: profile["Student-Id"] },
                          { label: "Courses Enrolled",  value: displayValue(profile.courses_enrolled) },
                          { label: "Avg Feedback",      value: displayValue(profile.avg_feedback) },
                          { label: "Previous Attempts", value: displayValue(profile.previous_attempts) },
                          { label: "Days Viewed",       value: displayValue(profile.days_viewed) },
                          { label: "Total Clicks",      value: displayValue(profile.total_clicks) },
                        ].map(({ label, value }) => (
                          <div className="profile-metric" key={label}>
                            <div className="profile-metric-label">{label}</div>
                            <div className="profile-metric-value">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {!loading && recommendations.length > 0 && (
                <div className="card recs-section">
                  <div className="recs-header">
                    <div>
                      <div className="card-title">Personalized Recommendations</div>
                      <div className="card-subtitle" style={{ marginTop: 2 }}>
                        Resources prioritized by K-Means cluster profile · {courseName}
                      </div>
                    </div>
                    <span className="recs-count-badge">{recommendations.length} Resources</span>
                  </div>

                  <div className="recs-grid">
                    {recommendations.map(item => (
                      <div className="rec-card" key={item["Resource ID"]}>
                        <div className="rec-card-top">
                          <span className={`rec-priority-badge ${Number(item.Priority) === 1 ? "p1" : "p2"}`}>
                            Priority {item.Priority}
                          </span>
                          <span className="rec-id">{item["Resource ID"]}</span>
                        </div>

                        <div>
                          <div className="rec-topic">{item.Topic}</div>
                          <div className="rec-course">{item["Course Name"]}</div>
                        </div>

                        <div className="rec-tags">
                          <span className={tagClass(item["Resource Type"])}>{item["Resource Type"]}</span>
                          <span className={tagClass(item.Difficulty)}>{item.Difficulty}</span>
                        </div>

                        <div className="rec-why">
                          <div className="rec-why-label">Why recommended?</div>
                          <div className="rec-why-text">{getWhyText(item)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && profile && recommendations.length === 0 && (
                <div className="card">
                  <div className="empty-state">
                    <Inbox size={28} />
                    <strong>No recommendations available</strong>
                    There are currently no recommendations for this student and course combination.
                  </div>
                </div>
              )}
            </>
          )}

          {/* ─── STUDENTS SECTION ─── */}
          {activeSection === "students" && (
            <>
              <div style={{ marginBottom: 24 }}>
                <div className="section-label">Student Directory</div>
                <div className="section-title">Student Profiles</div>
                <div className="section-desc">
                  Select a student and course to view their ML-generated personalized learning path.
                </div>
              </div>

              {/* selector + result */}
              <div className="card" style={{ marginBottom: 14 }}>
                <div className="card-header">
                  <div className="card-header-left">
                    <div className="card-title">Find a Learner</div>
                    <div className="card-subtitle">Select student and course, then fetch recommendations</div>
                  </div>
                  <div className="card-header-icon"><Users size={15} /></div>
                </div>

                <div className="selector-row">
                  <div className="field-wrap">
                    <label className="field-label">Student ID</label>
                    <select
                      className="field-select"
                      value={studentId}
                      disabled={studentsLoading || students.length === 0}
                      onChange={e => setStudentId(e.target.value)}
                    >
                      {students.map(s => (
                        <option key={s["Student-Id"]} value={s["Student-Id"]}>{s["Student-Id"]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field-wrap">
                    <label className="field-label">Course</label>
                    <select
                      className="field-select"
                      value={courseName}
                      onChange={e => setCourseName(e.target.value)}
                    >
                      {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  onClick={handleGetRecommendations}
                  disabled={loading || studentsLoading || !apiConnected}
                >
                  {loading
                    ? (<><span className="btn-spinner" /> Analyzing profile…</>)
                    : (<>Get Recommendations <ChevronRight size={14} /></>)}
                </button>

                {error && (
                  <div className="alert-error">
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    {error}
                  </div>
                )}
              </div>

              {/* Profile card */}
              {!loading && profile && (
                <div className="card">
                  <div className="card-header">
                    <div className="card-header-left">
                      <div className="card-title">Learner Profile — {profile["Student-Id"]}</div>
                      <div className="card-subtitle">LMS engagement attributes</div>
                    </div>
                    {cluster !== null && (
                      <div className="cluster-badge">
                        <CheckCircle2 size={12} />
                        Cluster {cluster}
                      </div>
                    )}
                  </div>
                  <div className="profile-metrics">
                    {[
                      { label: "Student ID",        value: profile["Student-Id"] },
                      { label: "Courses Enrolled",  value: displayValue(profile.courses_enrolled) },
                      { label: "Avg Feedback",      value: displayValue(profile.avg_feedback) },
                      { label: "Previous Attempts", value: displayValue(profile.previous_attempts) },
                      { label: "Days Viewed",       value: displayValue(profile.days_viewed) },
                      { label: "Total Clicks",      value: displayValue(profile.total_clicks) },
                    ].map(({ label, value }) => (
                      <div className="profile-metric" key={label}>
                        <div className="profile-metric-label">{label}</div>
                        <div className="profile-metric-value">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="card">
                  <div className="inline-loading">
                    <div className="spinner-ring" />
                    <span>Loading student profile…</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ─── RECOMMENDATIONS SECTION ─── */}
          {activeSection === "recommendations" && (
            <>
              <div style={{ marginBottom: 24 }}>
                <div className="section-label">Learning Path</div>
                <div className="section-title">Personalized Recommendations</div>
                <div className="section-desc">
                  ML-driven resource recommendations sorted by K-Means cluster profile and difficulty priority.
                </div>
              </div>

              {/* Course selector pills */}
              <div className="card" style={{ marginBottom: 14 }}>
                <div className="card-header">
                  <div className="card-header-left">
                    <div className="card-title">Configure Recommendation</div>
                    <div className="card-subtitle">Choose student and subject course</div>
                  </div>
                </div>

                <div className="selector-row" style={{ marginBottom: 16 }}>
                  <div className="field-wrap">
                    <label className="field-label">Student ID</label>
                    <select
                      className="field-select"
                      value={studentId}
                      disabled={studentsLoading || students.length === 0}
                      onChange={e => setStudentId(e.target.value)}
                    >
                      {students.map(s => (
                        <option key={s["Student-Id"]} value={s["Student-Id"]}>{s["Student-Id"]}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field-wrap">
                    <label className="field-label">Course</label>
                    <div className="course-pills">
                      {COURSES.map(c => (
                        <button
                          key={c}
                          className={`course-pill ${courseName === c ? "active" : ""}`}
                          onClick={() => handleCourseSelect(c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  onClick={handleGetRecommendations}
                  disabled={loading || studentsLoading || !apiConnected}
                >
                  {loading
                    ? (<><span className="btn-spinner" /> Analyzing profile…</>)
                    : (<>Get Recommendations <ChevronRight size={14} /></>)}
                </button>

                {error && (
                  <div className="alert-error">
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    {error}
                  </div>
                )}
              </div>

              {/* Cluster info banner */}
              {!loading && cluster !== null && profile && (
                <div className="card" style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="cluster-badge" style={{ margin: 0 }}>
                      <CheckCircle2 size={12} />
                      Cluster {cluster} — {cluster === 0 ? "Foundation Learner" : "High-Engagement Learner"}
                    </div>
                    <span style={{ fontSize: 12.5, color: "var(--text-sec)" }}>
                      {cluster === 0
                        ? "Beginner resources are prioritized (Priority 1). Intermediate resources follow (Priority 2)."
                        : "Intermediate resources are prioritized (Priority 1). Beginner resources follow (Priority 2)."}
                    </span>
                  </div>
                </div>
              )}

              {/* Results */}
              {loading && (
                <div className="card">
                  <div className="inline-loading">
                    <div className="spinner-ring" />
                    <span>Predicting cluster and sorting resources…</span>
                  </div>
                </div>
              )}

              {!loading && recommendations.length > 0 && (
                <div className="card">
                  <div className="recs-header">
                    <div>
                      <div className="card-title">Results — {courseName}</div>
                      <div className="card-subtitle" style={{ marginTop: 2 }}>Student {studentId}</div>
                    </div>
                    <span className="recs-count-badge">{recommendations.length} Resources</span>
                  </div>
                  <div className="recs-grid">
                    {recommendations.map(item => (
                      <div className="rec-card" key={item["Resource ID"]}>
                        <div className="rec-card-top">
                          <span className={`rec-priority-badge ${Number(item.Priority) === 1 ? "p1" : "p2"}`}>
                            Priority {item.Priority}
                          </span>
                          <span className="rec-id">{item["Resource ID"]}</span>
                        </div>
                        <div>
                          <div className="rec-topic">{item.Topic}</div>
                          <div className="rec-course">{item["Course Name"]}</div>
                        </div>
                        <div className="rec-tags">
                          <span className={tagClass(item["Resource Type"])}>{item["Resource Type"]}</span>
                          <span className={tagClass(item.Difficulty)}>{item.Difficulty}</span>
                        </div>
                        <div className="rec-why">
                          <div className="rec-why-label">Why recommended?</div>
                          <div className="rec-why-text">{getWhyText(item)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && profile && recommendations.length === 0 && (
                <div className="card">
                  <div className="empty-state">
                    <Inbox size={28} />
                    <strong>No recommendations found</strong>
                    No resources were returned for this student and course combination.
                  </div>
                </div>
              )}
            </>
          )}

          {/* ─── ABOUT SECTION ─── */}
          {activeSection === "about" && (
            <>
              <div style={{ marginBottom: 24 }}>
                <div className="section-label">System Information</div>
                <div className="section-title">About the System</div>
                <div className="section-desc">
                  Technical details about the ML model, dataset and recommendation methodology.
                </div>
              </div>

              <div className="about-grid">
                {/* System Info */}
                <div className="about-card">
                  <h3>System Details</h3>
                  {[
                    ["Project",          "Personalized Learning Recommendation System"],
                    ["Institution",      "Brainware University"],
                    ["Department",       "Computational Sciences"],
                    ["Degree",           "Bachelor of Computer Application"],
                    ["Frontend",         "React 19 + Vite"],
                    ["Backend",          "FastAPI (Python)"],
                    ["ML Library",       "Scikit-Learn"],
                  ].map(([k, v]) => (
                    <div className="about-info-row" key={k}>
                      <span>{k}</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Dataset Info */}
                <div className="about-card">
                  <h3>Dataset & Model</h3>
                  {[
                    ["Source Dataset",        "OULAD (Open University)"],
                    ["Total Records",         "200"],
                    ["Unique Students",       stats ? String(stats.total_students) : "—"],
                    ["Course Modules",        stats ? String(stats.total_courses) : "—"],
                    ["Learning Resources",    stats ? String(stats.total_resources) : "—"],
                    ["Total Recommendations", stats ? String(stats.total_recommendations) : "—"],
                    ["ML Algorithm",          "K-Means Clustering (K=2)"],
                    ["Silhouette Score",      "0.4759 (optimal)"],
                  ].map(([k, v]) => (
                    <div className="about-info-row" key={k}>
                      <span>{k}</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Cluster methodology */}
                <div className="about-card">
                  <h3>Cluster Recommendation Methodology</h3>
                  <div className="cluster-info-block">
                    <div className="cluster-info-label c0">Cluster 0 — Foundation Learner (78% of students)</div>
                    <p>Lower previous attempts and fewer active days. Beginner resources are assigned Priority 1 to build foundational understanding. Intermediate resources follow at Priority 2.</p>
                  </div>
                  <div className="cluster-info-block">
                    <div className="cluster-info-label c1">Cluster 1 — High-Engagement Learner (22% of students)</div>
                    <p>Higher re-attempt history and more active learning days. Intermediate practice resources are assigned Priority 1 to address gaps. Beginner resources follow at Priority 2.</p>
                  </div>
                </div>

                {/* Features */}
                <div className="about-card">
                  <h3>Clustering Features</h3>
                  {[
                    ["courses_enrolled",   "Number of concurrent modules enrolled"],
                    ["avg_feedback",       "Average course feedback score"],
                    ["previous_attempts",  "Number of previous course re-attempts"],
                    ["days_viewed",        "Cumulative LMS access days"],
                  ].map(([k, v]) => (
                    <div className="about-info-row" key={k}>
                      <span style={{ fontFamily: "monospace", fontSize: 12 }}>{k}</span>
                      <span style={{ maxWidth: 180, textAlign: "right", fontSize: 11.5 }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 16 }}>
                    <h3 style={{ marginBottom: 10 }}>Supported Courses</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {COURSES.map((c, i) => (
                        <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                          <span style={{ background: "var(--accent-dim)", color: "var(--accent)", borderRadius: 4, padding: "2px 7px", fontSize: 11, fontWeight: 700 }}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>{/* /page-body */}

        {/* Footer */}
        <div className="footer">
          <span>Personalized Learning Recommendation System · BCA PBL Project 2026</span>
          <span>Brainware University · Department of Computational Sciences</span>
        </div>

      </div>{/* /main-content */}
    </div>
  );
}
