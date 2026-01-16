/**
 * Trend Analysis Utilities
 * Provides functions for analyzing data trends, growth rates, and anomalies
 */

// Date column detection patterns
const DATE_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}$/,           // YYYY-MM-DD
  /^\d{2}\/\d{2}\/\d{4}$/,         // MM/DD/YYYY
  /^\d{2}-\d{2}-\d{4}$/,           // DD-MM-YYYY
  /^\d{4}\/\d{2}\/\d{2}$/,         // YYYY/MM/DD
  /^\w{3}\s\d{1,2},?\s\d{4}$/,     // Jan 01, 2024
  /^\d{1,2}\s\w{3}\s\d{4}$/,       // 01 Jan 2024
]

const DATE_KEYWORDS = ['date', 'time', 'timestamp', 'created', 'updated', 'year', 'month', 'day', 'period']

/**
 * Detect if a column likely contains date values
 */
export function isDateColumn(columnName, sampleValues) {
  // Check column name for date-related keywords
  const lowerName = columnName.toLowerCase()
  if (DATE_KEYWORDS.some(keyword => lowerName.includes(keyword))) {
    return true
  }

  // Check sample values against date patterns
  if (sampleValues && sampleValues.length > 0) {
    const validDateCount = sampleValues.filter(value => {
      if (!value) return false
      const strVal = String(value).trim()
      
      // Check against patterns
      if (DATE_PATTERNS.some(pattern => pattern.test(strVal))) {
        return true
      }
      
      // Try parsing as date
      const parsed = new Date(strVal)
      return !isNaN(parsed.getTime()) && parsed.getFullYear() > 1900 && parsed.getFullYear() < 2100
    }).length

    return validDateCount / sampleValues.length > 0.7
  }

  return false
}

/**
 * Detect potential date columns in headers
 */
export function detectDateColumns(headers, data) {
  const dateColumns = []
  
  headers.forEach(header => {
    const sampleValues = data.slice(0, 20).map(row => row[header]).filter(Boolean)
    if (isDateColumn(header, sampleValues)) {
      dateColumns.push(header)
    }
  })
  
  return dateColumns
}

/**
 * Calculate growth rate between two values
 */
export function calculateGrowthRate(oldValue, newValue) {
  if (oldValue === 0) {
    return newValue === 0 ? 0 : 100
  }
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100
}

/**
 * Calculate absolute change
 */
export function calculateAbsoluteChange(oldValue, newValue) {
  return newValue - oldValue
}

/**
 * Determine trend direction based on values
 * Returns: 'increasing', 'decreasing', 'stable', or 'volatile'
 */
export function determineTrendDirection(values) {
  if (!values || values.length < 2) return 'stable'

  const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v))
  if (numericValues.length < 2) return 'stable'

  // Calculate differences between consecutive values
  const differences = []
  for (let i = 1; i < numericValues.length; i++) {
    differences.push(numericValues[i] - numericValues[i - 1])
  }

  const positiveChanges = differences.filter(d => d > 0).length
  const negativeChanges = differences.filter(d => d < 0).length
  const total = differences.length

  // Determine trend based on majority of changes
  const positiveRatio = positiveChanges / total
  const negativeRatio = negativeChanges / total

  if (positiveRatio > 0.6) return 'increasing'
  if (negativeRatio > 0.6) return 'decreasing'
  if (positiveRatio > 0.3 && negativeRatio > 0.3) return 'volatile'
  return 'stable'
}

/**
 * Calculate trend strength (0-100)
 */
export function calculateTrendStrength(values) {
  if (!values || values.length < 2) return 0

  const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v))
  if (numericValues.length < 2) return 0

  // Calculate R-squared (coefficient of determination) using linear regression
  const n = numericValues.length
  const xMean = (n - 1) / 2
  const yMean = numericValues.reduce((a, b) => a + b, 0) / n

  let ssXY = 0
  let ssXX = 0
  let ssYY = 0

  for (let i = 0; i < n; i++) {
    const xDiff = i - xMean
    const yDiff = numericValues[i] - yMean
    ssXY += xDiff * yDiff
    ssXX += xDiff * xDiff
    ssYY += yDiff * yDiff
  }

  if (ssXX === 0 || ssYY === 0) return 0

  const rSquared = Math.pow(ssXY, 2) / (ssXX * ssYY)
  return Math.round(rSquared * 100)
}

/**
 * Detect outliers using IQR method
 */
export function detectOutliers(values) {
  const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v))
  if (numericValues.length < 4) return { outliers: [], bounds: null }

  const sorted = [...numericValues].sort((a, b) => a - b)
  const q1Index = Math.floor(sorted.length * 0.25)
  const q3Index = Math.floor(sorted.length * 0.75)
  
  const q1 = sorted[q1Index]
  const q3 = sorted[q3Index]
  const iqr = q3 - q1
  
  const lowerBound = q1 - 1.5 * iqr
  const upperBound = q3 + 1.5 * iqr

  const outliers = values
    .map((value, index) => ({ value: parseFloat(value), index }))
    .filter(item => !isNaN(item.value) && (item.value < lowerBound || item.value > upperBound))

  return {
    outliers,
    bounds: { lower: lowerBound, upper: upperBound, q1, q3, iqr }
  }
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(values, windowSize = 3) {
  const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v))
  if (numericValues.length < windowSize) return []

  const result = []
  for (let i = windowSize - 1; i < numericValues.length; i++) {
    const sum = numericValues.slice(i - windowSize + 1, i + 1).reduce((a, b) => a + b, 0)
    result.push(sum / windowSize)
  }
  return result
}

/**
 * Generate comprehensive trend analysis for a column
 */
export function analyzeTrend(columnName, values, data = null) {
  const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v))
  
  if (numericValues.length < 2) {
    return {
      column: columnName,
      hasEnoughData: false,
      message: 'Insufficient numeric data for trend analysis'
    }
  }

  const direction = determineTrendDirection(numericValues)
  const strength = calculateTrendStrength(numericValues)
  const { outliers, bounds } = detectOutliers(numericValues)
  
  // Calculate statistics
  const first = numericValues[0]
  const last = numericValues[numericValues.length - 1]
  const min = Math.min(...numericValues)
  const max = Math.max(...numericValues)
  const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length
  const sum = numericValues.reduce((a, b) => a + b, 0)

  // Calculate growth metrics
  const overallGrowthRate = calculateGrowthRate(first, last)
  const absoluteChange = calculateAbsoluteChange(first, last)

  // Calculate period-over-period changes
  const midpoint = Math.floor(numericValues.length / 2)
  const firstHalfAvg = numericValues.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint
  const secondHalfAvg = numericValues.slice(midpoint).reduce((a, b) => a + b, 0) / (numericValues.length - midpoint)
  const periodChange = calculateGrowthRate(firstHalfAvg, secondHalfAvg)

  // Calculate volatility (standard deviation / mean)
  const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / numericValues.length
  const stdDev = Math.sqrt(variance)
  const volatility = avg !== 0 ? (stdDev / Math.abs(avg)) * 100 : 0

  return {
    column: columnName,
    hasEnoughData: true,
    dataPoints: numericValues.length,
    direction,
    strength,
    statistics: {
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      avg: parseFloat(avg.toFixed(2)),
      sum: parseFloat(sum.toFixed(2)),
      first: parseFloat(first.toFixed(2)),
      last: parseFloat(last.toFixed(2)),
      stdDev: parseFloat(stdDev.toFixed(2)),
      volatility: parseFloat(volatility.toFixed(2))
    },
    growth: {
      overallRate: parseFloat(overallGrowthRate.toFixed(2)),
      absoluteChange: parseFloat(absoluteChange.toFixed(2)),
      periodChange: parseFloat(periodChange.toFixed(2))
    },
    outliers: {
      count: outliers.length,
      items: outliers.slice(0, 5), // Return max 5 outliers
      bounds
    }
  }
}

/**
 * Analyze all numeric columns in a dataset
 */
export function analyzeAllTrends(data, headers) {
  if (!data || data.length === 0 || !headers) {
    return { columns: [], summary: null }
  }

  const columnAnalyses = []
  const dateColumns = detectDateColumns(headers, data)

  headers.forEach(header => {
    // Skip likely non-numeric columns (date columns, IDs, etc.)
    if (dateColumns.includes(header)) return
    
    const lowerHeader = header.toLowerCase()
    if (lowerHeader.includes('id') || lowerHeader === 'index' || lowerHeader === 'name') return

    const values = data.map(row => row[header])
    const analysis = analyzeTrend(header, values, data)
    
    if (analysis.hasEnoughData) {
      columnAnalyses.push(analysis)
    }
  })

  // Generate summary insights
  const summary = generateTrendSummary(columnAnalyses)

  return {
    columns: columnAnalyses,
    dateColumns,
    summary
  }
}

/**
 * Generate summary insights from all column analyses
 */
function generateTrendSummary(analyses) {
  if (analyses.length === 0) return null

  const increasing = analyses.filter(a => a.direction === 'increasing')
  const decreasing = analyses.filter(a => a.direction === 'decreasing')
  const volatile = analyses.filter(a => a.direction === 'volatile')
  const stable = analyses.filter(a => a.direction === 'stable')

  // Find strongest trends
  const sortedByStrength = [...analyses].sort((a, b) => b.strength - a.strength)
  const strongestTrends = sortedByStrength.slice(0, 3)

  // Find biggest movers
  const sortedByGrowth = [...analyses].sort((a, b) => Math.abs(b.growth.overallRate) - Math.abs(a.growth.overallRate))
  const biggestMovers = sortedByGrowth.slice(0, 3)

  // Find most volatile
  const sortedByVolatility = [...analyses].sort((a, b) => b.statistics.volatility - a.statistics.volatility)
  const mostVolatile = sortedByVolatility.slice(0, 3)

  // Count total outliers
  const totalOutliers = analyses.reduce((sum, a) => sum + a.outliers.count, 0)

  return {
    totalColumns: analyses.length,
    distribution: {
      increasing: increasing.length,
      decreasing: decreasing.length,
      volatile: volatile.length,
      stable: stable.length
    },
    strongestTrends: strongestTrends.map(t => ({
      column: t.column,
      direction: t.direction,
      strength: t.strength
    })),
    biggestMovers: biggestMovers.map(t => ({
      column: t.column,
      growthRate: t.growth.overallRate
    })),
    mostVolatile: mostVolatile.map(t => ({
      column: t.column,
      volatility: t.statistics.volatility
    })),
    totalOutliers,
    insights: generateInsightMessages(analyses, { increasing, decreasing, volatile, stable, biggestMovers })
  }
}

/**
 * Generate human-readable insight messages
 */
function generateInsightMessages(analyses, categorized) {
  const insights = []
  const { increasing, decreasing, biggestMovers } = categorized

  // Overall trend insight
  if (increasing.length > decreasing.length) {
    insights.push({
      type: 'positive',
      message: `Overall positive trend: ${increasing.length} of ${analyses.length} metrics are increasing`
    })
  } else if (decreasing.length > increasing.length) {
    insights.push({
      type: 'warning',
      message: `Overall declining trend: ${decreasing.length} of ${analyses.length} metrics are decreasing`
    })
  } else {
    insights.push({
      type: 'neutral',
      message: `Mixed trends across ${analyses.length} metrics`
    })
  }

  // Biggest mover insight
  if (biggestMovers.length > 0) {
    const biggest = biggestMovers[0]
    const direction = biggest.growth.overallRate > 0 ? 'increased' : 'decreased'
    insights.push({
      type: biggest.growth.overallRate > 0 ? 'positive' : 'warning',
      message: `"${biggest.column}" ${direction} by ${Math.abs(biggest.growth.overallRate).toFixed(1)}%`
    })
  }

  // Strong trend insight
  const veryStrong = analyses.filter(a => a.strength > 80)
  if (veryStrong.length > 0) {
    insights.push({
      type: 'info',
      message: `${veryStrong.length} metric(s) show very strong trends (>80% consistency)`
    })
  }

  // Outlier warning
  const withOutliers = analyses.filter(a => a.outliers.count > 0)
  if (withOutliers.length > 0) {
    const totalOutliers = withOutliers.reduce((sum, a) => sum + a.outliers.count, 0)
    insights.push({
      type: 'alert',
      message: `${totalOutliers} outlier(s) detected across ${withOutliers.length} column(s)`
    })
  }

  return insights
}

/**
 * Get trend icon and color based on direction
 */
export function getTrendIndicator(direction, value = null) {
  switch (direction) {
    case 'increasing':
      return {
        icon: '↑',
        arrow: 'TrendingUp',
        color: '#10b981',
        bgColor: '#10b98120',
        label: 'Increasing'
      }
    case 'decreasing':
      return {
        icon: '↓',
        arrow: 'TrendingDown',
        color: '#ef4444',
        bgColor: '#ef444420',
        label: 'Decreasing'
      }
    case 'volatile':
      return {
        icon: '⇅',
        arrow: 'Activity',
        color: '#f59e0b',
        bgColor: '#f59e0b20',
        label: 'Volatile'
      }
    default:
      return {
        icon: '→',
        arrow: 'Minus',
        color: '#6b7280',
        bgColor: '#6b728020',
        label: 'Stable'
      }
  }
}

/**
 * Format percentage with sign
 */
export function formatPercentage(value, includeSign = true) {
  if (value === null || value === undefined || isNaN(value)) return 'N/A'
  const sign = includeSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

/**
 * Format number with appropriate precision
 */
export function formatNumber(value, maxDecimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return 'N/A'
  
  const absValue = Math.abs(value)
  if (absValue >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  }
  if (absValue >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return value.toFixed(maxDecimals)
}
