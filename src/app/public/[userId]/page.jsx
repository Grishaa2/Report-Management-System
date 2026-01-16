"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts"
import {
  analyzeAllTrends,
  getTrendIndicator,
  formatPercentage,
} from "@/lib/trend-utils"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"]

// Format file size to human readable
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Stats Card Component
const StatsCard = ({ icon, label, value, color }) => (
  <div
    style={{
      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      border: "1px solid #334155",
      borderRadius: "1rem",
      padding: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      transition: "all 0.3s ease",
    }}
  >
    <div
      style={{
        width: "50px",
        height: "50px",
        borderRadius: "12px",
        background: `${color}20`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem",
      }}
    >
      <i className={icon} style={{ color }}></i>
    </div>
    <div>
      <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.25rem" }}>{label}</p>
      <p style={{ color: "#f1f5f9", fontSize: "1.5rem", fontWeight: "700" }}>{value}</p>
    </div>
  </div>
)

// Trend Indicator Component
const TrendBadge = ({ direction, value }) => {
  const indicator = getTrendIndicator(direction)
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.375rem 0.75rem",
        borderRadius: "9999px",
        backgroundColor: indicator.bgColor,
        border: `1px solid ${indicator.color}40`,
      }}
    >
      <span style={{ color: indicator.color, fontSize: "1rem" }}>{indicator.icon}</span>
      <span style={{ color: indicator.color, fontSize: "0.75rem", fontWeight: "600" }}>
        {formatPercentage(value)}
      </span>
    </div>
  )
}

// Trend Insights Card Component
const TrendInsightsCard = ({ data }) => {
  const trendAnalysis = useMemo(() => {
    if (!data || data.length < 2) return null
    const headers = Object.keys(data[0] || {})
    return analyzeAllTrends(data, headers)
  }, [data])

  if (!trendAnalysis || trendAnalysis.columns.length === 0) {
    return null
  }

  const { summary, columns } = trendAnalysis

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        border: "1px solid #334155",
        borderRadius: "1rem",
        padding: "1.5rem",
        marginTop: "1rem",
      }}
    >
      <h4 style={{ color: "#f1f5f9", fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <i className="fas fa-chart-line" style={{ color: "#8b5cf6" }}></i>
        Data Trends
      </h4>

      {/* Trend Summary */}
      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <div style={{ textAlign: "center", padding: "0.5rem", background: "#10b98115", borderRadius: "0.5rem" }}>
            <p style={{ color: "#10b981", fontSize: "1.25rem", fontWeight: "700" }}>{summary.distribution.increasing}</p>
            <p style={{ color: "#94a3b8", fontSize: "0.7rem" }}>Rising</p>
          </div>
          <div style={{ textAlign: "center", padding: "0.5rem", background: "#ef444415", borderRadius: "0.5rem" }}>
            <p style={{ color: "#ef4444", fontSize: "1.25rem", fontWeight: "700" }}>{summary.distribution.decreasing}</p>
            <p style={{ color: "#94a3b8", fontSize: "0.7rem" }}>Falling</p>
          </div>
          <div style={{ textAlign: "center", padding: "0.5rem", background: "#f59e0b15", borderRadius: "0.5rem" }}>
            <p style={{ color: "#f59e0b", fontSize: "1.25rem", fontWeight: "700" }}>{summary.distribution.volatile}</p>
            <p style={{ color: "#94a3b8", fontSize: "0.7rem" }}>Volatile</p>
          </div>
          <div style={{ textAlign: "center", padding: "0.5rem", background: "#6b728015", borderRadius: "0.5rem" }}>
            <p style={{ color: "#6b7280", fontSize: "1.25rem", fontWeight: "700" }}>{summary.distribution.stable}</p>
            <p style={{ color: "#94a3b8", fontSize: "0.7rem" }}>Stable</p>
          </div>
        </div>
      )}

      {/* Top Trends */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {columns.slice(0, 3).map((col, idx) => {
          const indicator = getTrendIndicator(col.direction)
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.625rem 0.875rem",
                borderRadius: "0.5rem",
                backgroundColor: indicator.bgColor,
                border: `1px solid ${indicator.color}30`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: indicator.color, fontSize: "1rem" }}>{indicator.icon}</span>
                <span style={{ color: "#f1f5f9", fontSize: "0.85rem", fontWeight: "500" }}>
                  {col.column.length > 18 ? col.column.substring(0, 18) + "..." : col.column}
                </span>
              </div>
              <TrendBadge direction={col.direction} value={col.growth.overallRate} />
            </div>
          )
        })}
      </div>

      {/* Insights */}
      {summary?.insights && summary.insights.length > 0 && (
        <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#0f172a", borderRadius: "0.5rem" }}>
          <p style={{ color: "#94a3b8", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Key Insight</p>
          <p style={{ color: "#e2e8f0", fontSize: "0.85rem", lineHeight: "1.4" }}>
            {summary.insights[0]?.message}
          </p>
        </div>
      )}
    </div>
  )
}

// Report Card Component
const ReportCard = ({ report, onViewChart }) => {
  const chartType = report.chartConfig?.chartType || "none"
  const chartIcon =
    chartType === "bar" ? "fas fa-chart-bar" : chartType === "line" ? "fas fa-chart-line" : chartType === "pie" ? "fas fa-chart-pie" : "fas fa-table"

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        border: "1px solid #334155",
        borderRadius: "1rem",
        padding: "1.5rem",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <h3 style={{ color: "#f1f5f9", fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>{report.title}</h3>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>{report.description || "No description"}</p>
        </div>
        <div
          style={{
            padding: "0.5rem",
            borderRadius: "0.5rem",
            background: "#3b82f620",
          }}
        >
          <i className={chartIcon} style={{ color: "#3b82f6", fontSize: "1.25rem" }}></i>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginBottom: "1rem",
          padding: "1rem",
          background: "#0f172a",
          borderRadius: "0.75rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#94a3b8", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Rows</p>
          <p style={{ color: "#f1f5f9", fontSize: "1.125rem", fontWeight: "600" }}>{report.stats?.rowCount?.toLocaleString() || 0}</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#94a3b8", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Columns</p>
          <p style={{ color: "#f1f5f9", fontSize: "1.125rem", fontWeight: "600" }}>{report.stats?.columnCount || 0}</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#94a3b8", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Size</p>
          <p style={{ color: "#f1f5f9", fontSize: "1.125rem", fontWeight: "600" }}>{formatFileSize(report.fileSize)}</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
          <i className="fas fa-calendar-alt" style={{ marginRight: "0.5rem" }}></i>
          {formatDate(report.createdAt)}
        </span>
        {report.chartConfig && (
          <button
            onClick={() => onViewChart(report)}
            style={{
              padding: "0.5rem 1rem",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <i className="fas fa-eye"></i>
            View Chart
          </button>
        )}
      </div>

      {/* Trend Insights */}
      {report.dataPreview && report.dataPreview.length > 2 && (
        <TrendInsightsCard data={report.dataPreview} />
      )}
    </div>
  )
}

// Chart Modal Component
const ChartModal = ({ report, onClose }) => {
  const chartConfig = report?.chartConfig
  const dataPreview = report?.dataPreview || []

  const chartData = useMemo(() => {
    if (!chartConfig || !dataPreview.length) return []

    const { chartType, xAxisColumn, yAxisColumn } = chartConfig

    if (chartType === "pie") {
      const pieDataMap = new Map()
      dataPreview.forEach((row) => {
        const category = String(row[xAxisColumn] || "Unknown")
        const value = parseFloat(row[yAxisColumn])
        if (isNaN(value)) {
          pieDataMap.set(category, (pieDataMap.get(category) || 0) + 1)
        } else {
          pieDataMap.set(category, (pieDataMap.get(category) || 0) + value)
        }
      })
      return Array.from(pieDataMap.entries()).map(([name, value]) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        value: Number(value.toFixed(2)),
      }))
    }

    return dataPreview.map((row) => ({
      [xAxisColumn]: row[xAxisColumn],
      [yAxisColumn]: parseFloat(row[yAxisColumn]) || 0,
    }))
  }, [chartConfig, dataPreview])

  if (!report) return null

  const renderChart = () => {
    const { chartType, xAxisColumn, yAxisColumn } = chartConfig || {}

    if (!chartType || chartData.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
          <i className="fas fa-chart-bar" style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}></i>
          <p>No chart data available (preview limited to 5 rows)</p>
        </div>
      )
    }

    if (chartType === "bar") {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey={xAxisColumn} stroke="#94a3b8" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }} />
            <Legend />
            <Bar dataKey={yAxisColumn} fill="#3b82f6" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      )
    }

    if (chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <RechartsLineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey={xAxisColumn} stroke="#94a3b8" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }} />
            <Legend />
            <Line type="monotone" dataKey={yAxisColumn} stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6" }} />
          </RechartsLineChart>
        </ResponsiveContainer>
      )
    }

    if (chartType === "pie") {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <RechartsPieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} innerRadius={60} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }} />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      )
    }

    return null
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1e293b",
          borderRadius: "1rem",
          padding: "2rem",
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ color: "#f1f5f9", fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.25rem" }}>{report.title}</h2>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
              {chartConfig?.chartType?.charAt(0).toUpperCase() + chartConfig?.chartType?.slice(1)} Chart • Preview (5 rows max)
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#374151",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              color: "#f1f5f9",
              cursor: "pointer",
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div style={{ background: "#0f172a", borderRadius: "0.75rem", padding: "1rem" }}>{renderChart()}</div>

        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#0f172a", borderRadius: "0.75rem" }}>
          <h3 style={{ color: "#f1f5f9", fontSize: "1rem", fontWeight: "600", marginBottom: "0.75rem" }}>Chart Configuration</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            <div>
              <p style={{ color: "#64748b", fontSize: "0.75rem" }}>Chart Type</p>
              <p style={{ color: "#f1f5f9", fontWeight: "500" }}>{chartConfig?.chartType || "N/A"}</p>
            </div>
            <div>
              <p style={{ color: "#64748b", fontSize: "0.75rem" }}>X-Axis</p>
              <p style={{ color: "#f1f5f9", fontWeight: "500" }}>{chartConfig?.xAxisColumn || "N/A"}</p>
            </div>
            <div>
              <p style={{ color: "#64748b", fontSize: "0.75rem" }}>Y-Axis</p>
              <p style={{ color: "#f1f5f9", fontWeight: "500" }}>{chartConfig?.yAxisColumn || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Public Profile Page
export default function PublicProfilePage() {
  const params = useParams()
  const userId = params.userId

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    if (!userId) return

    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/public/stats/${userId}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("User not found")
          }
          throw new Error("Failed to load profile")
        }

        const data = await response.json()
        setProfile(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  // Loading State
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "4px solid #334155",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          ></div>
          <p style={{ color: "#94a3b8", fontSize: "1.125rem" }}>Loading public profile...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            background: "#1e293b",
            borderRadius: "1rem",
            border: "1px solid #334155",
            maxWidth: "400px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "#ef444420",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <i className="fas fa-exclamation-triangle" style={{ color: "#ef4444", fontSize: "2rem" }}></i>
          </div>
          <h2 style={{ color: "#f1f5f9", fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>Profile Not Found</h2>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>{error}</p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              background: "#3b82f6",
              color: "white",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  // Success State
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#f8fafc",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "rgba(15, 23, 42, 0.9)",
          borderBottom: "1px solid #334155",
          padding: "1rem 2rem",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
            <i className="fas fa-chart-line" style={{ color: "#3b82f6", fontSize: "1.5rem" }}></i>
            <span style={{ color: "#f1f5f9", fontSize: "1.25rem", fontWeight: "700" }}>ReportHub</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#94a3b8" }}>
            <i className="fas fa-globe"></i>
            <span>Public Profile</span>
          </div>
        </div>
      </header>

      {/* Profile Hero */}
      <section style={{ padding: "3rem 2rem", borderBottom: "1px solid #334155" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "2rem" }}>
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3rem",
              color: "white",
              fontWeight: "700",
              flexShrink: 0,
            }}
          >
            {profile.user.avatar ? (
              <img
                src={profile.user.avatar}
                alt={profile.user.displayName}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              profile.user.displayName?.charAt(0)?.toUpperCase() || "?"
            )}
          </div>
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "0.5rem", color: "#f1f5f9" }}>{profile.user.displayName}</h1>
            <p style={{ color: "#94a3b8", fontSize: "1.125rem", marginBottom: "1rem" }}>Data Analyst & Report Creator</p>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <i className="fas fa-calendar-check"></i>
                Member since {formatDate(profile.summary.memberSince)}
              </span>
              <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <i className="fas fa-clock"></i>
                Last active {formatDate(profile.summary.lastActivity)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section style={{ padding: "2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem", color: "#f1f5f9" }}>
            <i className="fas fa-chart-pie" style={{ marginRight: "0.75rem", color: "#3b82f6" }}></i>
            Statistics Overview
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            <StatsCard icon="fas fa-file-alt" label="Total Reports" value={profile.summary.totalReports} color="#3b82f6" />
            <StatsCard icon="fas fa-database" label="Total Data Rows" value={profile.summary.totalDataRows.toLocaleString()} color="#10b981" />
            <StatsCard icon="fas fa-hdd" label="Total File Size" value={formatFileSize(profile.summary.totalFileSize)} color="#f59e0b" />
            <StatsCard
              icon="fas fa-chart-bar"
              label="Charts Created"
              value={Object.values(profile.summary.chartTypeDistribution).reduce((a, b) => a + b, 0)}
              color="#8b5cf6"
            />
          </div>
        </div>
      </section>

      {/* Reports Grid */}
      <section style={{ padding: "2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem", color: "#f1f5f9" }}>
            <i className="fas fa-folder-open" style={{ marginRight: "0.75rem", color: "#10b981" }}></i>
            Public Reports ({profile.reports.length})
          </h2>

          {profile.reports.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 2rem",
                background: "#1e293b",
                borderRadius: "1rem",
                border: "1px solid #334155",
              }}
            >
              <i className="fas fa-folder-open" style={{ fontSize: "3rem", color: "#334155", marginBottom: "1rem" }}></i>
              <p style={{ color: "#94a3b8", fontSize: "1.125rem" }}>No public reports available yet.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
              {profile.reports.map((report) => (
                <ReportCard key={report.id} report={report} onViewChart={setSelectedReport} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "2rem",
          borderTop: "1px solid #334155",
          textAlign: "center",
          marginTop: "2rem",
        }}
      >
        <p style={{ color: "#64748b" }}>
          Powered by <span style={{ color: "#3b82f6", fontWeight: "600" }}>ReportHub</span> • Public Profile
        </p>
      </footer>

      {/* Chart Modal */}
      {selectedReport && <ChartModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
    </div>
  )
}
