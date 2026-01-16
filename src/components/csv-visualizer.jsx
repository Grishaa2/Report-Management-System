"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Settings,
  BarChart,
  LineChart,
  PieChart,
  Download,
  Search,
  Database,
  TrendingUp,
  TrendingDown,
  Activity,
  Minus,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
} from "lucide-react"
import {
  analyzeAllTrends,
  getTrendIndicator,
  formatPercentage,
  formatNumber,
} from "@/lib/trend-utils"
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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"]

const validateAxisSelection = (xAxis, yAxis) => {
  if (xAxis === yAxis) {
    return {
      isValid: false,
      error: "X and Y axes cannot use the same column. Please select different columns for each axis."
    };
  }
  return { isValid: true, error: null };
};

const validateDataTypes = (data, column) => {
  if (!data || !column) return { isNumeric: false, uniqueValues: 0 };
  
  const values = data.map(row => row[column]).filter(Boolean);
  const numericValues = values.filter(val => !isNaN(Number(val)));
  const uniqueValues = new Set(values).size;
  
  return {
    isNumeric: numericValues.length / values.length > 0.8,
    uniqueValues,
    hasData: values.length > 0
  };
};

const truncateLabel = (label, maxLength = 20) => {
  if (typeof label !== 'string') return String(label);
  return label.length > maxLength ? `${label.substring(0, maxLength)}...` : label;
};

export const CsvVisualizer = ({ data, headers, showNotification, reportId, initialChartConfig }) => {
  const [chartType, setChartType] = useState("bar")
  const [chartTitle, setChartTitle] = useState("Data Visualization")
  const [xAxisColumn, setXAxisColumn] = useState(headers[0])
  const [yAxisColumn, setYAxisColumn] = useState(headers.length > 1 ? headers[1] : undefined)
  const [currentChartData, setCurrentChartData] = useState([])
  const [showChart, setShowChart] = useState(false)
  const [effectiveXAxisDataKey, setEffectiveXAxisDataKey] = useState(headers[0])
  const [effectiveYAxisDataKey, setEffectiveYAxisDataKey] = useState(undefined)
  const [isDownloading, setIsDownloading] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")
  const [searchQuery, setSearchQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [validationErrors, setValidationErrors] = useState(null)

  const chartRef = useRef(null)

  const handleAxisSelection = useCallback((axis, value) => {
    const newXAxis = axis === 'x' ? value : xAxisColumn;
    const newYAxis = axis === 'y' ? value : yAxisColumn;
    const validationResult = validateAxisSelection(newXAxis, newYAxis);
    
    if (!validationResult.isValid) {
      setValidationErrors(validationResult.error);
      setTimeout(() => showNotification(validationResult.error, "error"), 0);
      return;
    }

    if (axis === 'y') {
      const { isNumeric, hasData } = validateDataTypes(data, value);
      if (!isNumeric && chartType !== 'pie') {
        setTimeout(() => showNotification(
          "Selected Y-axis contains primarily non-numeric data. Consider using it as X-axis instead.",
          "warning"
        ), 0);
      }
      if (!hasData) {
        setTimeout(() => showNotification("Selected column contains no data.", "error"), 0);
        return;
      }
    }

    if (axis === 'x') {
      setXAxisColumn(value);
      setEffectiveXAxisDataKey(value);
    } else {
      setYAxisColumn(value);
      setEffectiveYAxisDataKey(value);
    }
    setValidationErrors(null);
  }, [data, xAxisColumn, yAxisColumn, chartType, showNotification]);

  const generateVisualization = useCallback(async () => {
    const validationResult = validateAxisSelection(xAxisColumn, yAxisColumn);
    if (!validationResult.isValid) {
      showNotification(validationResult.error, "error");
      return;
    }

    if (chartType !== 'pie') {
      const { isNumeric, hasData } = validateDataTypes(data, yAxisColumn);
      if (!hasData) {
        showNotification("Selected Y-axis column contains no data.", "error");
        return;
      }
      if (!isNumeric) {
        showNotification("Y-axis should contain numeric data for bar/line charts.", "warning");
      }
    }

    if (!data || data.length === 0) {
      showNotification("No data available to visualize.", "error")
      return
    }

    if (!xAxisColumn) {
      showNotification("Please select an X-Axis column.", "warning")
      return
    }

    if (!yAxisColumn) {
      showNotification("Please select a Y-Axis column.", "warning")
      return
    }

    setIsGenerating(true)

    await new Promise((resolve) => setTimeout(resolve, 800))

    let workingData = data
    const MAX_DATA_POINTS = 1000

    if (data.length > MAX_DATA_POINTS) {
      const step = Math.floor(data.length / MAX_DATA_POINTS)
      workingData = data.filter((_, index) => index % step === 0).slice(0, MAX_DATA_POINTS)
    }

    let transformedData = []
    let currentEffectiveXAxisDataKey
    let currentEffectiveYAxisDataKey

    let isYAxisNumerical = true
    try {
      isYAxisNumerical = workingData.every((row) => !isNaN(Number.parseFloat(row[yAxisColumn])))
    } catch (error) {
      console.error("Error checking numerical data:", error)
      isYAxisNumerical = false
    }

    if (chartType === "pie") {
      const pieDataMap = new Map()

      try {
        workingData.forEach((row) => {
          if (!row || typeof row !== "object") return

          const category = String(row[xAxisColumn] || "Unknown")
          const value = Number.parseFloat(row[yAxisColumn])

          if (isNaN(value)) {
            pieDataMap.set(category, (pieDataMap.get(category) || 0) + 1)
          } else {
            pieDataMap.set(category, (pieDataMap.get(category) || 0) + value)
          }
        })

        const sortedEntries = Array.from(pieDataMap.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)

        transformedData = sortedEntries.map(([name, value]) => ({
          name: name.length > 20 ? name.substring(0, 20) + "..." : name,
          value: Number(value.toFixed(2)),
          fullName: name,
        }))

        currentEffectiveXAxisDataKey = "name"
        currentEffectiveYAxisDataKey = "value"
      } catch (error) {
        console.error("Error processing pie chart data:", error)
        showNotification("Error processing data for pie chart. Please try a different configuration.", "error")
        setIsGenerating(false)
        return
      }
    } else {
      try {
        if (!isYAxisNumerical) {
          const aggregatedData = {}
          workingData.forEach((row) => {
            if (!row || typeof row !== "object") return

            const categoryValue = String(row[yAxisColumn] || "Unknown")
            if (categoryValue !== undefined && categoryValue !== null) {
              aggregatedData[categoryValue] = (aggregatedData[categoryValue] || 0) + 1
            }
          })

          const sortedCategories = Object.entries(aggregatedData)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 50)

          transformedData = sortedCategories.map(([key, count]) => ({
            [yAxisColumn]: key,
            Count: count,
          }))

          currentEffectiveXAxisDataKey = yAxisColumn
          currentEffectiveYAxisDataKey = "Count"
        } else {
          transformedData = workingData
            .map((row) => {
              if (!row || typeof row !== "object") return null

              const xValue = row[xAxisColumn]
              const yValue = Number.parseFloat(row[yAxisColumn])

              if (isNaN(yValue)) return null

              return {
                [xAxisColumn]: xValue,
                [yAxisColumn]: yValue,
              }
            })
            .filter((item) => item !== null)

          currentEffectiveXAxisDataKey = xAxisColumn
          currentEffectiveYAxisDataKey = yAxisColumn
        }
      } catch (error) {
        console.error("Error processing chart data:", error)
        showNotification("Error processing data for chart. Please try a different configuration.", "error")
        setIsGenerating(false)
        return
      }
    }

    if (!transformedData || transformedData.length === 0) {
      showNotification("No valid data found for the selected columns.", "warning")
      setIsGenerating(false)
      return
    }

    if (reportId) {
      const chartConfig = {
        chartType,
        chartTitle,
        xAxisColumn,
        yAxisColumn,
      }

      fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartConfig }),
      }).catch((error) => console.error('Error saving chart config:', error))
    }

    setCurrentChartData(transformedData)
    setEffectiveXAxisDataKey(currentEffectiveXAxisDataKey)
    setEffectiveYAxisDataKey(currentEffectiveYAxisDataKey)
    setShowChart(true)
    setIsGenerating(false)
    showNotification("Visualization generated successfully!", "success")
  }, [data, xAxisColumn, yAxisColumn, chartType, showNotification, chartTitle, reportId])

  useEffect(() => {
    if (initialChartConfig) {
      setChartType(initialChartConfig.chartType || "bar")
      setChartTitle(initialChartConfig.chartTitle || "Data Visualization")
      setXAxisColumn(initialChartConfig.xAxisColumn || headers[0])
      setYAxisColumn(initialChartConfig.yAxisColumn || headers[1])
      
      setTimeout(() => {
        generateVisualization()
      }, 800)
    }
  }, [initialChartConfig])

  const dataSummary = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        rowCount: 0,
        columnCount: 0,
        numericalColumns: {},
      }
    }

    const rowCount = data.length
    const columnCount = headers.length

    const numericalColumns = {}

    headers.forEach((header) => {
      const values = data.map((row) => Number.parseFloat(row[header])).filter((val) => !isNaN(val))
      if (values.length > 0) {
        const min = Math.min(...values)
        const max = Math.max(...values)
        const sum = values.reduce((acc, val) => acc + val, 0)
        const avg = sum / values.length

        numericalColumns[header] = {
          min,
          max,
          avg,
          sum,
        }
      }
    })

    return {
      rowCount,
      columnCount,
      numericalColumns,
    }
  }, [data, headers])

  // Trend Analysis
  const trendAnalysis = useMemo(() => {
    if (!data || data.length < 2 || !headers) {
      return { columns: [], summary: null }
    }
    return analyzeAllTrends(data, headers)
  }, [data, headers])

  // Get icon component for trend direction
  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'increasing': return TrendingUp
      case 'decreasing': return TrendingDown
      case 'volatile': return Activity
      default: return Minus
    }
  }

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data

    return data.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase())),
    )
  }, [data, searchQuery])

  const exportDataAsCSV = useCallback(() => {
    if (!currentChartData || currentChartData.length === 0) {
      showNotification("No data available to export", "error")
      return
    }

    try {
      const headers = Object.keys(currentChartData[0])
      const csvContent = [
        headers.join(','),
        ...currentChartData.map(row => 
          headers.map(header => {
            const value = row[header] || ''
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          }).join(',')
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${chartTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chart_data.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
      
      showNotification("Chart data exported successfully!", "success")
    } catch (error) {
      console.error('Error exporting CSV:', error)
      showNotification("Failed to export data", "error")
    }
  }, [currentChartData, chartTitle, showNotification])

  const downloadChart = useCallback(async () => {
    if (!showChart || !currentChartData.length) {
      showNotification("No chart available to download.", "error")
      return
    }

    setIsDownloading(true)
    showNotification("Preparing chart download...", "info")

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const chartContainer = chartRef.current
      if (!chartContainer) {
        throw new Error("Chart container not found")
      }

      const svgElement = chartContainer.querySelector(".recharts-wrapper svg")
      if (!svgElement) {
        throw new Error("Chart SVG not found")
      }

      const svgClone = svgElement.cloneNode(true)

      const chartWidthOnCanvas = 1100
      const chartHeightOnCanvas = 600

      svgClone.setAttribute("width", chartWidthOnCanvas.toString())
      svgClone.setAttribute("height", chartHeightOnCanvas.toString())
      svgClone.setAttribute(
        "viewBox",
        `0 0 ${svgElement.getAttribute("width") || 800} ${svgElement.getAttribute("height") || 600}`,
      )

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const canvasWidth = 1200
      const canvasHeight = 1200
      canvas.width = canvasWidth
      canvas.height = canvasHeight

      ctx.fillStyle = "#1a2332"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      let currentY = 50

      ctx.fillStyle = "#f1f5f9"
      ctx.font = "bold 36px 'Inter', sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(chartTitle, canvas.width / 2, currentY)
      currentY += 45

      ctx.font = "20px 'Inter', sans-serif"
      ctx.fillStyle = "#94a3b8"
      ctx.fillText(
        `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart • ${currentChartData.length} data points`,
        canvas.width / 2,
        currentY,
      )
      currentY += 60

      const svgData = new XMLSerializer().serializeToString(svgClone)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          const chartX = (canvasWidth - chartWidthOnCanvas) / 2
          ctx.drawImage(img, chartX, currentY, chartWidthOnCanvas, chartHeightOnCanvas)
          currentY += chartHeightOnCanvas + 40

          ctx.textAlign = "left"
          ctx.fillStyle = "#f1f5f9"
          ctx.font = "bold 22px 'Inter', sans-serif"
          ctx.fillText(`X-Axis: ${effectiveXAxisDataKey}`, 50, currentY)
          currentY += 30
          ctx.fillText(`Y-Axis: ${effectiveYAxisDataKey}`, 50, currentY)
          currentY += 60

          ctx.fillStyle = "#a855f7"
          ctx.font = "bold 28px 'Inter', sans-serif"
          ctx.fillText("Key Insights", 50, currentY)
          currentY += 40

          ctx.fillStyle = "#e2e8f0"
          ctx.font = "18px 'Inter', sans-serif"
          ctx.textAlign = "left"

          const insights = []
          if (chartType === "bar" || chartType === "line") {
            if (currentChartData.length > 0 && effectiveYAxisDataKey) {
              const sortedData = [...currentChartData].sort(
                (a, b) => b[effectiveYAxisDataKey] - a[effectiveYAxisDataKey],
              )
              const topItem = sortedData[0]
              const bottomItem = sortedData[sortedData.length - 1]
              insights.push(
                `• Highest value: "${topItem[effectiveXAxisDataKey]}" with ${topItem[effectiveYAxisDataKey].toFixed(2)}`,
              )
              insights.push(
                `• Lowest value: "${bottomItem[effectiveXAxisDataKey]}" with ${bottomItem[effectiveYAxisDataKey].toFixed(2)}`,
              )
            }
          } else if (chartType === "pie") {
            if (currentChartData.length > 0) {
              const total = currentChartData.reduce((sum, item) => sum + item.value, 0)
              const largestSlice = currentChartData.reduce(
                (max, item) => (item.value > max.value ? item : max),
                currentChartData[0],
              )
              insights.push(
                `• Largest segment: "${largestSlice.fullName || largestSlice.name}" representing ${((largestSlice.value / total) * 100).toFixed(1)}%`,
              )
              insights.push(`• Total segments: ${currentChartData.length}`)
            }
          }
          insights.push(
            `• Dataset contains ${dataSummary.rowCount.toLocaleString()} total rows and ${dataSummary.columnCount} columns.`,
          )

          insights.forEach((insight) => {
            ctx.fillText(insight, 50, currentY)
            currentY += 30
          })
          currentY += 40

          ctx.fillStyle = "#3b82f6"
          ctx.font = "bold 28px 'Inter', sans-serif"
          ctx.fillText("Contextual Information", 50, currentY)
          currentY += 40

          ctx.fillStyle = "#e2e8f0"
          ctx.font = "18px 'Inter', sans-serif"
          const contextInfo = [
            "• This visualization helps identify key trends, distributions, or comparisons within your CSV data.",
            "• Consider filtering or aggregating data further for deeper insights into specific subsets.",
            "• The chart provides a snapshot; combining it with other data sources can reveal more complex patterns.",
          ]

          contextInfo.forEach((context) => {
            ctx.fillText(context, 50, currentY)
            currentY += 30
          })
          currentY += 60

          ctx.fillStyle = "#6b7280"
          ctx.font = "16px 'Inter', sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(
            `Generated by ReportManagement on ${new Date().toLocaleDateString()}`,
            canvas.width / 2,
            canvas.height - 30,
          )

          canvas.toBlob(
            (blob) => {
              const url = URL.createObjectURL(blob)
              const link = document.createElement("a")
              link.download = `${chartTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_detailed_chart.png`
              link.href = url
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(url)
              URL.revokeObjectURL(svgUrl)

              showNotification("Detailed chart downloaded successfully!", "success")
            },
            "image/png",
            0.95,
          )
        } catch (error) {
          console.error("Error processing image:", error)
          showNotification("Failed to download chart. Please try again.", "error")
        } finally {
          setIsDownloading(false)
        }
      }

      img.onerror = () => {
        console.error("Error loading SVG image")
        showNotification("Failed to download chart. Please try again.", "error")
        setIsDownloading(false)
        URL.revokeObjectURL(svgUrl)
      }

      img.src = svgUrl
    } catch (error) {
      console.error("Error downloading chart:", error)
      showNotification("Failed to download chart. Please try again.", "error")
      setIsDownloading(false)
    }
  }, [
    chartTitle,
    showChart,
    showNotification,
    currentChartData,
    chartType,
    effectiveXAxisDataKey,
    effectiveYAxisDataKey,
    dataSummary,
  ])

  const renderChart = useCallback(() => {
    if (!showChart || !currentChartData || currentChartData.length === 0 || !effectiveYAxisDataKey)
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "580px",
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          <div
            style={{
              animation: "pulse 2s infinite",
              opacity: 0.3,
            }}
          >
            <BarChart className="w-20 h-20 mb-6" />
          </div>
          <p style={{ fontSize: "1.3rem", marginBottom: "0.75rem", fontWeight: "600" }}>No Chart Generated</p>
          <p style={{ fontSize: "1rem", maxWidth: "400px", lineHeight: "1.5" }}>
            Configure your chart settings and click "Generate Visualization" to see your data come to life
          </p>
        </div>
      )

    try {
      if (chartType === "bar") {
        return (
          <ResponsiveContainer width="100%" height={580}>
            <RechartsBarChart data={currentChartData} margin={{ top: 40, right: 40, left: 60, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
              <XAxis
                dataKey={effectiveXAxisDataKey}
                stroke="rgba(255,255,255,0.8)"
                tick={{ fontSize: 13, fill: "rgba(255,255,255,0.8)" }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval="preserveStartEnd"
                axisLine={{ stroke: "rgba(255,255,255,0.8)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.8)" }}
                tickFormatter={(value) => truncateLabel(value, 15)}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.8)" 
                tick={{ fontSize: 13, fill: "rgba(255,255,255,0.8)" }}
                tickFormatter={(value) => value}
                axisLine={{ stroke: "rgba(255,255,255,0.8)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.8)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f9fafb",
                  fontSize: "14px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                }}
                cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
              />
              <Legend />
              <Bar dataKey={effectiveYAxisDataKey} fill="#3b82f6" name={effectiveYAxisDataKey} radius={[6, 6, 0, 0]}>
                {currentChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        )
      } else if (chartType === "line") {
        return (
          <ResponsiveContainer width="100%" height={580}>
            <RechartsLineChart data={currentChartData} margin={{ top: 40, right: 40, left: 60, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
              <XAxis
                dataKey={effectiveXAxisDataKey}
                stroke="rgba(255,255,255,0.8)"
                tick={{ fontSize: 13, fill: "rgba(255,255,255,0.8)" }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.8)" 
                tick={{ fontSize: 13, fill: "rgba(255,255,255,0.8)" }}
                tickFormatter={(value) => value}
                axisLine={{ stroke: "rgba(255,255,255,0.8)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.8)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f9fafb",
                  fontSize: "14px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                }}
                cursor={{ stroke: "rgba(59, 130, 246, 0.5)", strokeWidth: 2 }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={effectiveYAxisDataKey}
                stroke="#3b82f6"
                strokeWidth={4}
                activeDot={{
                  r: 8,
                  fill: "#3b82f6",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                  style: { filter: "drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))" },
                }}
                dot={{ r: 5, fill: "#3b82f6", stroke: "#ffffff", strokeWidth: 1 }}
                name={effectiveYAxisDataKey}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        )
      } else if (chartType === "pie") {
        const RADIAN = Math.PI / 180
        const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
          if (percent < 0.03) return null

          const radius = innerRadius + (outerRadius - innerRadius) * 0.5
          const x = cx + radius * Math.cos(-midAngle * RADIAN)
          const y = cy + radius * Math.sin(-midAngle * RADIAN)

          return (
            <text
              x={x}
              y={y}
              fill="white"
              textAnchor={x > cx ? "start" : "end"}
              dominantBaseline="central"
              fontSize="12"
              fontWeight="600"
              style={{ filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.8))" }}
            >
              {`${(percent * 100).toFixed(1)}%`}
            </text>
          )
        }

        return (
          <ResponsiveContainer width="100%" height={580}>
            <RechartsPieChart>
              <Pie
                data={currentChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={180}
                innerRadius={60}
                fill="#3b82f6"
                paddingAngle={2}
              >
                {currentChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    style={{
                      filter: `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]}40)`,
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f9fafb",
                  fontSize: "14px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                }}
                formatter={(value, name, props) => [
                  `${value} (${((value / currentChartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)`,
                  props.payload.fullName || name,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={60}
                formatter={(value, entry) => (
                  <span
                    style={{
                      color: "#f1f5f9",
                      fontSize: "13px",
                      display: "inline-block",
                      maxWidth: "120px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {value}
                  </span>
                )}
                wrapperStyle={{
                  paddingTop: "20px",
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        )
      }
    } catch (error) {
      console.error("Error rendering chart:", error)
      return (
        <div
          style={{
            textAlign: "center",
            color: "#ef4444",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "580px",
          }}
        >
          <AlertCircle className="w-12 h-12 mb-4" />
          <p style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem" }}>Error rendering chart</p>
          <p style={{ fontSize: "0.9rem", color: "#94a3b8" }}>Please try a different configuration.</p>
        </div>
      )
    }

    return null
  }, [showChart, currentChartData, effectiveYAxisDataKey, chartType, effectiveXAxisDataKey])

  return (
    <section
      id="data-visualization-section"
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            animation: "fadeInUp 0.6s ease-out",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
              color: "#f1f5f9",
              background: "linear-gradient(135deg, #3b82f6, #10b981)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            CSV Data Visualizer
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>
            Configure your chart on the left, generate visualization on the right
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "520px 1fr",
            gap: "2.5rem",
            minHeight: "800px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              animation: "slideInLeft 0.8s ease-out",
            }}
          >
            <Card
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: "all 0.3s ease",
                borderRadius: "1rem",
              }}
            >
              <CardHeader style={{ paddingBottom: "1.5rem", borderBottom: "1px solid #334155" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      borderRadius: "0.75rem",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                    }}
                  >
                    <Settings className="w-6 h-6" style={{ color: "#3b82f6" }} />
                  </div>
                  <div>
                    <h2
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#f1f5f9",
                        marginBottom: "0.25rem",
                        letterSpacing: "-0.025em",
                      }}
                    >
                      Chart Configuration
                    </h2>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#94a3b8",
                        fontWeight: "400",
                      }}
                    >
                      Customize your data visualization
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2rem",
                  padding: "2rem",
                }}
              >
                <div>
                  <Label
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#f1f5f9",
                      marginBottom: "1rem",
                      display: "block",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Visualization Type
                  </Label>
                  <div
                    style={{
                      display: "grid",
                      gap: "0.75rem",
                    }}
                  >
                    {[
                      {
                        value: "bar",
                        icon: BarChart,
                        title: "Bar Chart",
                        desc: "Compare values across categories",
                        gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      },
                      {
                        value: "line",
                        icon: LineChart,
                        title: "Line Chart",
                        desc: "Show trends and changes over time",
                        gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
                      },
                      {
                        value: "pie",
                        icon: PieChart,
                        title: "Pie Chart",
                        desc: "Display proportions and percentages",
                        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      },
                    ].map(({ value, icon: Icon, title, desc, gradient }) => (
                      <label
                        key={value}
                        htmlFor={`chart-type-${value}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "1rem",
                          borderRadius: "0.75rem",
                          border: `2px solid ${chartType === value ? "#3b82f6" : "transparent"}`,
                          backgroundColor: chartType === value ? "rgba(59, 130, 246, 0.1)" : "#334155",
                          cursor: "pointer",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          transform: chartType === value ? "scale(1.02)" : "scale(1)",
                          boxShadow:
                            chartType === value
                              ? "0 10px 25px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.05)"
                              : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onMouseEnter={(e) => {
                          if (chartType !== value) {
                            e.currentTarget.style.backgroundColor = "#3f4c63"
                            e.currentTarget.style.transform = "scale(1.01)"
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (chartType !== value) {
                            e.currentTarget.style.backgroundColor = "#334155"
                            e.currentTarget.style.transform = "scale(1)"
                          }
                        }}
                      >
                        <input
                          type="radio"
                          id={`chart-type-${value}`}
                          name="chartType"
                          value={value}
                          checked={chartType === value}
                          onChange={(e) => setChartType(e.target.value)}
                          style={{ display: "none" }}
                        />

                        <div
                          style={{
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            background: chartType === value ? gradient : "#475569",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <Icon className="w-6 h-6" style={{ color: "white" }} />
                        </div>

                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: "600",
                              fontSize: "0.95rem",
                              color: "#f1f5f9",
                              marginBottom: "0.25rem",
                            }}
                          >
                            {title}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{desc}</div>
                        </div>

                        {chartType === value && (
                          <CheckCircle
                            className="w-5 h-5"
                            style={{
                              color: "#3b82f6",
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="chart-title"
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#f1f5f9",
                      marginBottom: "0.75rem",
                      display: "block",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Chart Title
                  </Label>
                  <Input
                    id="chart-title"
                    value={chartTitle}
                    onChange={(e) => setChartTitle(e.target.value)}
                    placeholder="Enter chart title"
                    style={{
                      backgroundColor: "#334155",
                      border: "1px solid #475569",
                      color: "#f1f5f9",
                      padding: "0.75rem 1rem",
                      fontSize: "0.95rem",
                      borderRadius: "0.5rem",
                      transition: "all 0.2s ease",
                    }}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="x-axis"
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#f1f5f9",
                      marginBottom: "0.75rem",
                      display: "block",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    X-Axis Column
                  </Label>
                  <Select value={xAxisColumn} onValueChange={(value) => handleAxisSelection('x', value)}>
                    <SelectTrigger
                      id="x-axis"
                      style={{
                        backgroundColor: "#334155",
                        border: "1px solid #475569",
                        color: "#f1f5f9",
                        padding: "0.75rem 1rem",
                        fontSize: "0.95rem",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        backgroundColor: "#334155",
                        border: "1px solid #475569",
                        borderRadius: "0.5rem",
                        maxHeight: "300px",
                      }}
                    >
                      {headers.map((header) => (
                        <SelectItem
                          key={header}
                          value={header}
                          style={{
                            color: "#f1f5f9",
                            padding: "0.75rem 1rem",
                            cursor: "pointer",
                          }}
                        >
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="y-axis"
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#f1f5f9",
                      marginBottom: "0.75rem",
                      display: "block",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Y-Axis Column
                  </Label>
                  <Select value={yAxisColumn} onValueChange={(value) => handleAxisSelection('y', value)}>
                    <SelectTrigger
                      id="y-axis"
                      style={{
                        backgroundColor: "#334155",
                        border: "1px solid #475569",
                        color: "#f1f5f9",
                        padding: "0.75rem 1rem",
                        fontSize: "0.95rem",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        backgroundColor: "#334155",
                        border: "1px solid #475569",
                        borderRadius: "0.5rem",
                        maxHeight: "300px",
                      }}
                    >
                      {headers.map((header) => (
                        <SelectItem
                          key={header}
                          value={header}
                          style={{
                            color: "#f1f5f9",
                            padding: "0.75rem 1rem",
                            cursor: "pointer",
                          }}
                        >
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={generateVisualization}
                  disabled={!xAxisColumn || !yAxisColumn || isGenerating}
                  style={{
                    width: "100%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    height: "3.5rem",
                    padding: "0 1.5rem",
                    background:
                      !xAxisColumn || !yAxisColumn || isGenerating
                        ? "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
                        : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    color: "white",
                    fontSize: "1.05rem",
                    fontWeight: "700",
                    border: "none",
                    borderRadius: "0.75rem",
                    cursor: !xAxisColumn || !yAxisColumn || isGenerating ? "not-allowed" : "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow:
                      !xAxisColumn || !yAxisColumn || isGenerating
                        ? "none"
                        : "0 10px 25px -5px rgba(59, 130, 246, 0.5)",
                    transform: isGenerating ? "scale(0.98)" : "scale(1)",
                  }}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      Generate Visualization
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                borderRadius: "1rem",
              }}
            >
              <CardHeader style={{ paddingBottom: "1rem", borderBottom: "1px solid #334155" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      borderRadius: "0.75rem",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                    }}
                  >
                    <Database className="w-6 h-6" style={{ color: "#10b981" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#f1f5f9" }}>Data Summary</h3>
                    <p style={{ fontSize: "0.875rem", color: "#94a3b8" }}>Overview of your dataset</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent style={{ padding: "1.5rem" }}>
                <div style={{ display: "grid", gap: "1rem" }}>
                  <div
                    style={{
                      padding: "1rem",
                      backgroundColor: "#334155",
                      borderRadius: "0.5rem",
                      border: "1px solid #475569",
                    }}
                  >
                    <div style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.25rem" }}>Total Rows</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f1f5f9" }}>
                      {dataSummary.rowCount.toLocaleString()}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "1rem",
                      backgroundColor: "#334155",
                      borderRadius: "0.5rem",
                      border: "1px solid #475569",
                    }}
                  >
                    <div style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.25rem" }}>Total Columns</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f1f5f9" }}>
                      {dataSummary.columnCount}
                    </div>
                  </div>

                  {yAxisColumn && dataSummary.numericalColumns[yAxisColumn] && (
                    <div
                      style={{
                        padding: "1rem",
                        backgroundColor: "#334155",
                        borderRadius: "0.5rem",
                        border: "1px solid #475569",
                      }}
                    >
                      <div style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.75rem" }}>
                        {yAxisColumn} Statistics
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Min</div>
                          <div style={{ fontSize: "1rem", fontWeight: "600", color: "#f1f5f9" }}>
                            {dataSummary.numericalColumns[yAxisColumn].min.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Max</div>
                          <div style={{ fontSize: "1rem", fontWeight: "600", color: "#f1f5f9" }}>
                            {dataSummary.numericalColumns[yAxisColumn].max.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Average</div>
                          <div style={{ fontSize: "1rem", fontWeight: "600", color: "#f1f5f9" }}>
                            {dataSummary.numericalColumns[yAxisColumn].avg.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Sum</div>
                          <div style={{ fontSize: "1rem", fontWeight: "600", color: "#f1f5f9" }}>
                            {dataSummary.numericalColumns[yAxisColumn].sum.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trend Analysis Card */}
            <Card
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                borderRadius: "1rem",
              }}
            >
              <CardHeader style={{ paddingBottom: "1rem", borderBottom: "1px solid #334155" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "rgba(139, 92, 246, 0.1)",
                      borderRadius: "0.75rem",
                      border: "1px solid rgba(139, 92, 246, 0.2)",
                    }}
                  >
                    <BarChart2 className="w-6 h-6" style={{ color: "#8b5cf6" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#f1f5f9" }}>Trend Analysis</h3>
                    <p style={{ fontSize: "0.875rem", color: "#94a3b8" }}>Data patterns & insights</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent style={{ padding: "1.5rem" }}>
                {trendAnalysis.columns.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2rem 1rem",
                      color: "#94a3b8",
                    }}
                  >
                    <Activity className="w-10 h-10" style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                    <p>No numeric data available for trend analysis</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Summary Overview */}
                    {trendAnalysis.summary && (
                      <div
                        style={{
                          padding: "1rem",
                          backgroundColor: "#334155",
                          borderRadius: "0.5rem",
                          border: "1px solid #475569",
                        }}
                      >
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Trend Overview
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <TrendingUp className="w-4 h-4" style={{ color: "#10b981" }} />
                            <span style={{ color: "#f1f5f9", fontSize: "0.875rem" }}>
                              {trendAnalysis.summary.distribution.increasing} Rising
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <TrendingDown className="w-4 h-4" style={{ color: "#ef4444" }} />
                            <span style={{ color: "#f1f5f9", fontSize: "0.875rem" }}>
                              {trendAnalysis.summary.distribution.decreasing} Falling
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Activity className="w-4 h-4" style={{ color: "#f59e0b" }} />
                            <span style={{ color: "#f1f5f9", fontSize: "0.875rem" }}>
                              {trendAnalysis.summary.distribution.volatile} Volatile
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Minus className="w-4 h-4" style={{ color: "#6b7280" }} />
                            <span style={{ color: "#f1f5f9", fontSize: "0.875rem" }}>
                              {trendAnalysis.summary.distribution.stable} Stable
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Key Insights */}
                    {trendAnalysis.summary?.insights && trendAnalysis.summary.insights.length > 0 && (
                      <div
                        style={{
                          padding: "1rem",
                          backgroundColor: "#334155",
                          borderRadius: "0.5rem",
                          border: "1px solid #475569",
                        }}
                      >
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Key Insights
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {trendAnalysis.summary.insights.slice(0, 4).map((insight, idx) => {
                            const iconColor = insight.type === 'positive' ? '#10b981' : 
                                             insight.type === 'warning' ? '#f59e0b' : 
                                             insight.type === 'alert' ? '#ef4444' : '#3b82f6'
                            const Icon = insight.type === 'positive' ? ArrowUpRight : 
                                        insight.type === 'warning' ? ArrowDownRight : 
                                        insight.type === 'alert' ? AlertTriangle : CheckCircle
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "0.5rem",
                                  padding: "0.5rem",
                                  borderRadius: "0.375rem",
                                  backgroundColor: `${iconColor}10`,
                                }}
                              >
                                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: iconColor, marginTop: "0.125rem" }} />
                                <span style={{ color: "#e2e8f0", fontSize: "0.8rem", lineHeight: "1.4" }}>
                                  {insight.message}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Top Trends */}
                    <div
                      style={{
                        padding: "1rem",
                        backgroundColor: "#334155",
                        borderRadius: "0.5rem",
                        border: "1px solid #475569",
                      }}
                    >
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Column Trends
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "200px", overflowY: "auto" }}>
                        {trendAnalysis.columns.slice(0, 6).map((col, idx) => {
                          const indicator = getTrendIndicator(col.direction)
                          const TrendIcon = getTrendIcon(col.direction)
                          return (
                            <div
                              key={idx}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "0.625rem",
                                borderRadius: "0.375rem",
                                backgroundColor: indicator.bgColor,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <TrendIcon className="w-4 h-4" style={{ color: indicator.color }} />
                                <span style={{ color: "#f1f5f9", fontSize: "0.85rem", fontWeight: "500" }}>
                                  {col.column.length > 15 ? col.column.substring(0, 15) + '...' : col.column}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <span
                                  style={{
                                    color: indicator.color,
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
                                  }}
                                >
                                  {formatPercentage(col.growth.overallRate)}
                                </span>
                                <span
                                  style={{
                                    padding: "0.125rem 0.5rem",
                                    borderRadius: "9999px",
                                    backgroundColor: indicator.color,
                                    color: "white",
                                    fontSize: "0.65rem",
                                    fontWeight: "600",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {col.strength}%
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Outlier Warning */}
                    {trendAnalysis.summary?.totalOutliers > 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.75rem 1rem",
                          backgroundColor: "#f59e0b15",
                          borderRadius: "0.5rem",
                          border: "1px solid #f59e0b30",
                        }}
                      >
                        <AlertTriangle className="w-5 h-5" style={{ color: "#f59e0b" }} />
                        <span style={{ color: "#fbbf24", fontSize: "0.85rem" }}>
                          {trendAnalysis.summary.totalOutliers} outlier(s) detected in your data
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              animation: "slideInRight 0.8s ease-out",
            }}
          >
            <Card
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                borderRadius: "1rem",
                minHeight: "700px",
              }}
            >
              <CardHeader style={{ paddingBottom: "1rem", borderBottom: "1px solid #334155" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f1f5f9", marginBottom: "0.25rem" }}>
                      {chartTitle}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
                      {showChart
                        ? `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart • ${currentChartData.length} data points`
                        : "Configure settings and generate to view"}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button
                      onClick={downloadChart}
                      disabled={!showChart || isDownloading}
                      title={!showChart ? "Generate a chart first" : "Download chart as image"}
                      style={{
                        width: "auto",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        height: "2.5rem",
                        padding: "0 1rem",
                        background: !showChart || isDownloading
                          ? "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
                          : "linear-gradient(135deg, #10b981 0%, #047857 100%)",
                        color: "white",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: !showChart || isDownloading ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: !showChart || isDownloading
                          ? "none"
                          : "0 4px 12px -2px rgba(16, 185, 129, 0.4)",
                      }}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={exportDataAsCSV}
                      disabled={!showChart}
                      title={!showChart ? "Generate a chart first" : "Export chart data as CSV"}
                      style={{
                        width: "auto",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        height: "2.5rem",
                        padding: "0 1rem",
                        background: !showChart
                          ? "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
                          : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                        color: "white",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: !showChart ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: !showChart
                          ? "none"
                          : "0 4px 12px -2px rgba(139, 92, 246, 0.4)",
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent style={{ padding: "2rem" }}>
                <div ref={chartRef} style={{ width: "100%", height: "600px" }}>
                  {renderChart()}
                </div>
              </CardContent>
            </Card>

            <Card
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                borderRadius: "1rem",
              }}
            >
              <CardHeader style={{ paddingBottom: "1rem", borderBottom: "1px solid #334155" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div
                      style={{
                        padding: "0.75rem",
                        backgroundColor: "rgba(245, 158, 11, 0.1)",
                        borderRadius: "0.75rem",
                        border: "1px solid rgba(245, 158, 11, 0.2)",
                      }}
                    >
                      <Database className="w-6 h-6" style={{ color: "#f59e0b" }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#f1f5f9" }}>Data Preview</h3>
                      <p style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
                        Showing {filteredData.length} of {data.length} rows
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", maxWidth: "300px" }}>
                    <Search className="w-5 h-5" style={{ color: "#94a3b8" }} />
                    <Input
                      type="text"
                      placeholder="Search data..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        backgroundColor: "#334155",
                        border: "1px solid #475569",
                        color: "#f1f5f9",
                        padding: "0.5rem 1rem",
                        fontSize: "0.875rem",
                        borderRadius: "0.5rem",
                      }}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent style={{ padding: "0" }}>
                <div style={{ overflowX: "auto", maxHeight: "400px", overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                    <thead
                      style={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#1e293b",
                        zIndex: 10,
                      }}
                    >
                      <tr>
                        {headers.map((header, index) => (
                          <th
                            key={index}
                            style={{
                              padding: "1rem",
                              textAlign: "left",
                              fontWeight: "600",
                              color: "#f1f5f9",
                              borderBottom: "2px solid #334155",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.slice(0, 100).map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          style={{
                            borderBottom: "1px solid #334155",
                            transition: "background-color 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#334155"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent"
                          }}
                        >
                          {headers.map((header, colIndex) => (
                            <td
                              key={colIndex}
                              style={{
                                padding: "0.75rem 1rem",
                                color: "#e2e8f0",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "200px",
                              }}
                            >
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredData.length > 100 && (
                    <div
                      style={{
                        padding: "1rem",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "0.875rem",
                        backgroundColor: "#1e293b",
                        borderTop: "1px solid #334155",
                      }}
                    >
                      Showing first 100 rows of {filteredData.length} matching rows
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
