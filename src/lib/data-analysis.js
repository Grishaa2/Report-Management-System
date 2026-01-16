export function analyzeDataType(data, headers) {
  const numericHeaders = headers.filter(header => {
    const values = data.slice(0, 10).map(row => row[header]);
    const numericCount = values.filter(v => !isNaN(parseFloat(v)) && v !== "").length;
    return numericCount / values.length > 0.8;
  });

  if (numericHeaders.length === 0) {
    return { type: 'categorical', label: 'Categorical Data', description: 'Text-based data without numeric values', confidence: 0.9 };
  }

  const sampleData = data.slice(0, 20);
  const allValues = sampleData.flatMap(row => numericHeaders.map(h => parseFloat(row[h])).filter(v => !isNaN(v)));
  const total = allValues.reduce((a, b) => a + b, 0);
  const avg = allValues.length > 0 ? total / allValues.length : 0;

  const hasManyColumns = numericHeaders.length > 3;
  const hasHighValues = avg > 10000;
  const hasPercentages = numericHeaders.some(h => {
    const values = sampleData.map(row => parseFloat(row[h])).filter(v => !isNaN(v));
    return values.length > 0 && values.every(v => v >= 0 && v <= 100);
  });
  const hasCurrencySymbols = headers.some(h => h.toLowerCase().includes('price') || h.toLowerCase().includes('cost') || h.toLowerCase().includes('revenue') || h.toLowerCase().includes('amount'));
  const hasDateColumn = headers.some(h => h.toLowerCase().includes('date') || h.toLowerCase().includes('time') || h.toLowerCase().includes('year') || h.toLowerCase().includes('month'));

  if ((hasCurrencySymbols || hasHighValues) && hasManyColumns) {
    return { type: 'financial', label: 'Financial Data', description: 'Revenue, costs, profits, and other monetary metrics', confidence: 0.85 };
  }

  if (hasDateColumn && hasManyColumns) {
    const monthHeaders = headers.filter(h => {
      const values = data.slice(0, 5).map(row => row[h]);
      return values.some(v => {
        const str = String(v).toLowerCase();
        return str.includes('jan') || str.includes('feb') || str.includes('mar') || 
               str.includes('apr') || str.includes('may') || str.includes('jun') ||
               str.includes('jul') || str.includes('aug') || str.includes('sep') ||
               str.includes('oct') || str.includes('nov') || str.includes('dec');
      });
    });
    if (monthHeaders.length > 0) {
      return { type: 'sales', label: 'Sales Data', description: 'Monthly or periodic sales figures across different categories', confidence: 0.9 };
    }
  }

  if (hasPercentages && numericHeaders.length <= 2) {
    return { type: 'survey', label: 'Survey Results', description: 'Percentages, ratings, and satisfaction scores', confidence: 0.8 };
  }

  const inventoryKeywords = ['quantity', 'stock', 'inventory', 'units', 'products', 'items', 'sku', 'warehouse'];
  const hasInventoryKeywords = headers.some(h => inventoryKeywords.some(kw => h.toLowerCase().includes(kw)));
  if (hasInventoryKeywords) {
    return { type: 'inventory', label: 'Inventory Data', description: 'Stock levels, quantities, and product information', confidence: 0.85 };
  }

  const userKeywords = ['users', 'visitors', 'sessions', 'views', 'clicks', 'engagement', 'activity'];
  const hasUserKeywords = headers.some(h => userKeywords.some(kw => h.toLowerCase().includes(kw)));
  if (hasUserKeywords) {
    return { type: 'user_analytics', label: 'User Analytics', description: 'User activity, engagement, and behavioral metrics', confidence: 0.8 };
  }

  if (hasManyColumns) {
    return { type: 'sales', label: 'Sales Data', description: 'Multiple numeric columns suggesting sales or performance metrics', confidence: 0.7 };
  }

  return { type: 'general', label: 'General Data', description: 'Numeric data for analysis', confidence: 0.6 };
}

export function calculateBasicStats(data, headers) {
  return headers.map(header => {
    const values = data.map(row => parseFloat(row[header])).filter(v => !isNaN(v));
    
    if (values.length === 0) {
      return { column: header, stats: null };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const range = max - min;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const count = values.length;

    return {
      column: header,
      stats: {
        sum,
        average: avg,
        median,
        min,
        max,
        range,
        stdDev,
        count,
        coefficientOfVariation: avg !== 0 ? (stdDev / avg) * 100 : 0
      }
    };
  });
}

export function calculateTrend(values) {
  if (values.length < 2) return { direction: 'unknown', strength: 0, change: 0 };

  const n = values.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = i - xMean;
    const yDiff = values[i] - yMean;
    numerator += xDiff * yDiff;
    denominator += xDiff * xDiff;
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const percentChange = values[0] !== 0 ? ((values[n - 1] - values[0]) / Math.abs(values[0])) * 100 : 0;

  const absSlope = Math.abs(slope);
  let strength;
  const yRange = Math.max(...values) - Math.min(...values);
  if (yRange === 0) {
    strength = 0;
  } else {
    strength = Math.min(1, absSlope / (yRange / (n - 1)));
  }

  let direction;
  if (strength < 0.1) {
    direction = 'stable';
  } else if (slope > 0) {
    direction = 'increasing';
  } else {
    direction = 'decreasing';
  }

  return {
    direction,
    strength: Math.round(strength * 100) / 100,
    slope,
    percentChange: Math.round(percentChange * 10) / 10,
    startValue: values[0],
    endValue: values[n - 1]
  };
}

export function calculateVolatility(values) {
  if (values.length < 3) return { volatility: 0, rating: 'Low', swings: [] };

  const returns = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] !== 0) {
      returns.push((values[i] - values[i - 1]) / Math.abs(values[i - 1]));
    }
  }

  if (returns.length === 0) return { volatility: 0, rating: 'Low', swings: [] };

  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((acc, r) => acc + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const volatility = stdDev * 100;

  let rating;
  if (volatility < 5) rating = 'Low';
  else if (volatility < 15) rating = 'Moderate';
  else if (volatility < 30) rating = 'High';
  else rating = 'Very High';

  const swings = returns.map((r, i) => ({
    period: i + 1,
    change: r * 100,
    direction: r > 0 ? 'up' : r < 0 ? 'down' : 'stable'
  }));

  return { volatility: Math.round(volatility * 10) / 10, rating, swings };
}

export function detectAnomalies(data, headers) {
  const anomalies = [];

  headers.forEach(header => {
    const values = data.map((row, idx) => ({
      value: parseFloat(row[header]),
      row: idx + 1
    })).filter(v => !isNaN(v.value));

    if (values.length < 10) return;

    const numericValues = values.map(v => v.value);
    const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
    const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericValues.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return;

    values.forEach(({ value, row }) => {
      const zScore = (value - mean) / stdDev;
      if (Math.abs(zScore) >= 2) {
        anomalies.push({
          column: header,
          row,
          value,
          zScore: Math.round(zScore * 100) / 100,
          type: value > mean ? 'high' : 'low',
          deviation: Math.abs(zScore).toFixed(1) + ' standard deviations'
        });
      }
    });
  });

  return anomalies.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));
}

export function detectTrends(data, headers) {
  const trends = [];

  headers.forEach(header => {
    const values = data.map(row => parseFloat(row[header])).filter(v => !isNaN(v));
    if (values.length < 3) return;

    const trend = calculateTrend(values);
    const volatility = calculateVolatility(values);

    trends.push({
      column: header,
      trend,
      volatility,
      dataPoints: values.length,
      startValue: values[0],
      endValue: values[values.length - 1],
      avgValue: values.reduce((a, b) => a + b, 0) / values.length
    });
  });

  return trends.sort((a, b) => Math.abs(b.trend.percentChange) - Math.abs(a.trend.percentChange));
}

export function generateSummary(data, headers, dataType, stats) {
  const rowCount = data.length;
  const colCount = headers.length;
  
  const numericStats = stats.filter(s => s.stats !== null);
  const totalSum = numericStats.reduce((acc, s) => acc + s.stats.sum, 0);
  const avgValues = numericStats.map(s => ({
    column: s.column,
    avg: Math.round(s.stats.average * 100) / 100
  })).sort((a, b) => b.avg - a.avg);

  const topMetrics = avgValues.slice(0, 3).map(a => `"${a.column}" (avg: ${a.avg.toLocaleString()})`).join(', ');
  
  let summary = `This is a ${dataType.label.toLowerCase()} dataset containing ${rowCount.toLocaleString()} records across ${colCount} columns. `;
  
  if (numericStats.length > 0) {
    const maxCol = avgValues[0]?.column || 'N/A';
    const maxAvg = avgValues[0]?.avg || 0;
    const minCol = avgValues[avgValues.length - 1]?.column || 'N/A';
    const minAvg = avgValues[avgValues.length - 1]?.avg || 0;
    
    summary += `The highest average values are in ${topMetrics}. `;
    summary += `Overall, the "${maxCol}" metric has the highest average at ${maxAvg.toLocaleString()}, `;
    summary += `while "${minCol}" has the lowest average at ${minAvg.toLocaleString()}. `;
    summary += `The total sum across all numeric columns is ${totalSum.toLocaleString()}.`;
  } else {
    summary += `This dataset contains categorical information without numeric values for statistical analysis.`;
  }

  return summary;
}

export function generateKeyFindings(data, headers, stats, trends, anomalies, dataType) {
  const findings = [];

  if (trends.length > 0) {
    const significantTrends = trends.filter(t => Math.abs(t.trend.percentChange) > 10 && t.trend.strength > 0.2);
    if (significantTrends.length > 0) {
      const topTrend = significantTrends[0];
      const direction = topTrend.trend.direction === 'increasing' ? 'grown significantly' : 'declined substantially';
      findings.push({
        title: 'Strong Trend Detected',
        description: `The "${topTrend.column}" metric has ${direction} by ${Math.abs(topTrend.trend.percentChange).toFixed(1)}% over the observed period.`,
        type: topTrend.trend.direction === 'increasing' ? 'positive' : 'negative',
        icon: topTrend.trend.direction === 'increasing' ? 'TrendingUp' : 'TrendingDown'
      });
    }
  }

  const topStats = [...stats].filter(s => s.stats !== null).sort((a, b) => b.stats.sum - a.stats.sum);
  if (topStats.length > 0) {
    findings.push({
      title: 'Highest Volume Metric',
      description: `"${topStats[0].column}" shows the highest cumulative total at ${topStats[0].stats.sum.toLocaleString()}, representing ${(topStats[0].stats.sum / topStats.reduce((acc, s) => acc + (s.stats?.sum || 0), 0) * 100).toFixed(1)}% of all numeric data.`,
      type: 'neutral',
      icon: 'BarChart'
    });
  }

  if (anomalies.length > 0) {
    const highAnomalies = anomalies.filter(a => a.type === 'high').slice(0, 2);
    if (highAnomalies.length > 0) {
      findings.push({
        title: 'Unusual High Values',
        description: `Found ${highAnomalies.length} unusually high values, including ${highAnomalies[0].value.toLocaleString()} in "${highAnomalies[0].column}" (row ${highAnomalies[0].row}), which is ${highAnomalies[0].deviation} above average.`,
        type: 'warning',
        icon: 'AlertTriangle'
      });
    }
  }

  const volatileMetrics = trends.filter(t => t.volatility.rating === 'High' || t.volatility.rating === 'Very High');
  if (volatileMetrics.length > 0) {
    findings.push({
      title: 'High Volatility Detected',
      description: `"${volatileMetrics[0].column}" shows ${volatileMetrics[0].volatility.rating.toLowerCase()} volatility with ${volatileMetrics[0].volatility.volatility}% fluctuation between periods.`,
      type: 'warning',
      icon: 'Activity'
    });
  }

  const stableTrends = trends.filter(t => t.trend.direction === 'stable' && t.trend.strength < 0.1);
  if (stableTrends.length > 0) {
    findings.push({
      title: 'Stable Performance',
      description: `"${stableTrends[0].column}" maintains consistent levels with minimal variation (${stableTrends[0].trend.percentChange.toFixed(1)}% change), indicating reliable, predictable patterns.`,
      type: 'positive',
      icon: 'CheckCircle'
    });
  }

  return findings.slice(0, 5);
}

export function generateWhatToWatch(stats, trends, anomalies, dataType) {
  const warnings = [];

  const highAnomalies = anomalies.filter(a => a.zScore > 2.5);
  if (highAnomalies.length > 0) {
    warnings.push({
      title: 'Significant Outliers Detected',
      description: `${highAnomalies.length} values exceed 2.5 standard deviations from the mean, which may indicate data entry errors, special causes, or important exceptional events requiring investigation.`,
      severity: 'high',
      action: 'Review outlier rows for accuracy and context'
    });
  }

  const decliningTrends = trends.filter(t => t.trend.direction === 'decreasing' && Math.abs(t.trend.percentChange) > 20);
  if (decliningTrends.length > 0) {
    warnings.push({
      title: 'Declining Metrics Require Attention',
      description: `"${decliningTrends[0].column}" has declined by ${Math.abs(decliningTrends[0].trend.percentChange).toFixed(1)}%. This sustained decrease warrants investigation into root causes and potential remediation.`,
      severity: decliningTrends[0].trend.percentChange < -50 ? 'high' : 'medium',
      action: `Investigate factors causing decline in "${decliningTrends[0].column}"`
    });
  }

  const highVolatility = trends.filter(t => t.volatility.rating === 'Very High');
  if (highVolatility.length > 0) {
    warnings.push({
      title: 'Extreme Volatility Pattern',
      description: `"${highVolatility[0].column}" exhibits ${highVolatility[0].volatility.rating.toLowerCase()} volatility (${highVolatility[0].volatility.volatility}%), suggesting unpredictable fluctuations that could indicate instability or external factors.`,
      severity: 'medium',
      action: 'Identify external factors causing volatility'
    });
  }

  const zeroColumns = stats.filter(s => s.stats !== null && s.stats.sum === 0);
  if (zeroColumns.length > 0) {
    warnings.push({
      title: 'Inactive Metrics Found',
      description: `${zeroColumns.length} column(s) contain only zero values: ${zeroColumns.slice(0, 3).map(c => `"${c.column}"`).join(', ')}. These columns may be placeholders or inactive metrics.`,
      severity: 'low',
      action: 'Verify if these columns should contain data'
    });
  }

  return warnings;
}

export function generateContext(stats, trends, dataType) {
  const context = [];

  const benchmarks = {
    financial: { growthRate: 15, volatility: 15, margin: 20 },
    sales: { growthRate: 10, volatility: 20 },
    survey: { responseRate: 40, satisfaction: 70 },
    inventory: { turnoverRatio: 6, stockoutRate: 5 },
    user_analytics: { growthRate: 20, retentionRate: 70, engagementRate: 30 },
    general: { growthRate: 10, volatility: 15 }
  };

  const benchmark = benchmarks[dataType.type] || benchmarks.general;

  if (trends.length > 0) {
    const avgGrowth = trends.reduce((acc, t) => acc + Math.abs(t.trend.percentChange), 0) / trends.length;
    let assessment;
    if (avgGrowth > benchmark.growthRate * 2) {
      assessment = 'exceptional';
    } else if (avgGrowth > benchmark.growthRate) {
      assessment = 'strong';
    } else if (avgGrowth > benchmark.growthRate / 2) {
      assessment = 'moderate';
    } else {
      assessment = 'subdued';
    }

    context.push({
      title: 'Growth Performance',
      description: `Average change across all metrics is ${avgGrowth.toFixed(1)}%, which is ${assessment} compared to typical ${dataType.label.toLowerCase()} benchmarks of ${benchmark.growthRate}%.`,
      benchmark: `${benchmark.growthRate}%`,
      status: avgGrowth > benchmark.growthRate ? 'above' : avgGrowth < benchmark.growthRate / 2 ? 'below' : 'at'
    });
  }

  const avgVolatility = trends.length > 0 
    ? trends.reduce((acc, t) => acc + t.volatility.volatility, 0) / trends.length 
    : 0;

  if (avgVolatility > 0) {
    context.push({
      title: 'Stability Assessment',
      description: `Average volatility across metrics is ${avgVolatility.toFixed(1)}%, ${avgVolatility < benchmark.volatility ? 'indicating more stable performance than typical benchmarks.' : 'suggesting higher fluctuation than typical benchmarks.'}`,
      benchmark: `${benchmark.volatility}%`,
      status: avgVolatility < benchmark.volatility ? 'above' : 'below'
    });
  }

  if (dataType.type === 'user_analytics') {
    context.push({
      title: 'User Engagement Context',
      description: 'User engagement metrics should be evaluated against industry standards for your specific sector.',
      benchmark: 'Varies by industry',
      status: 'info'
    });
  }

  return context;
}

export function answerQuestion(question, data, headers, stats, trends, anomalies) {
  const questionLower = question.toLowerCase();

  function findRelevantColumn(keywords) {
    return headers.find(header => {
      const headerLower = header.toLowerCase();
      return keywords.some(keyword => headerLower.includes(keyword));
    });
  }

  function getColumnStats(columnName) {
    return stats.find(s => s.column === columnName);
  }

  function getColumnValues(columnName) {
    return data.map(row => parseFloat(row[columnName])).filter(v => !isNaN(v));
  }

  function getAnomalyDetails(columnName) {
    return anomalies.filter(a => a.column === columnName);
  }

  function getTrendDetails(columnName) {
    return trends.find(t => t.column === columnName);
  }

  function findExtremeValue(columnName, type = 'max') {
    const values = getColumnValues(columnName);
    if (values.length === 0) return null;
    
    const indexedValues = values.map((val, idx) => ({ val, idx }));
    const sorted = type === 'max' 
      ? indexedValues.sort((a, b) => b.val - a.val)
      : indexedValues.sort((a, b) => a.val - b.val);
    
    return {
      value: sorted[0].val,
      row: sorted[0].idx + 1,
      allValues: values
    };
  }

  function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return num.toLocaleString();
  }

  function formatPercent(num) {
    if (num === null || num === undefined || isNaN(num)) return '0%';
    return num.toFixed(1) + '%';
  }

  const numericHeaders = headers.filter(header => {
    const values = data.slice(0, 10).map(row => row[header]);
    const numericCount = values.filter(v => !isNaN(parseFloat(v)) && v !== "").length;
    return numericCount / values.length > 0.8;
  });

  if (questionLower.includes('highest') || questionLower.includes('largest') || questionLower.includes('biggest') || questionLower.includes('max')) {
    const numericColumns = numericHeaders.filter(h => {
      const columnStats = getColumnStats(h);
      return columnStats && columnStats.stats && columnStats.stats.max > 0;
    });
    
    if (numericColumns.length > 0) {
      const highest = numericColumns.reduce((max, col) => {
        const maxStats = getColumnStats(col)?.stats?.max || 0;
        const currentMax = getColumnStats(max)?.stats?.max || 0;
        return maxStats > currentMax ? col : max;
      });
      
      const columnStats = getColumnStats(highest);
      const extreme = findExtremeValue(highest, 'max');
      
      return {
        answer: `The highest value in your data is ${formatNumber(extreme.value)} in the "${highest}" column, found in row ${extreme.row}. This column has an average value of ${formatNumber(columnStats?.stats?.average)}, ranging from ${formatNumber(columnStats?.stats?.min)} to ${formatNumber(columnStats?.stats?.max)}. This represents the peak performance or maximum measurement for this metric in your dataset.`,
        followUp: [
          `What caused the high ${highest} in row ${extreme.row}?`,
          `How does this compare to the average ${highest}?`,
          `Are there other high values in ${highest}?`
        ]
      };
    }
  }

  if (questionLower.includes('lowest') || questionLower.includes('smallest') || questionLower.includes('min')) {
    const numericColumns = numericHeaders.filter(h => {
      const columnStats = getColumnStats(h);
      return columnStats && columnStats.stats && columnStats.stats.min >= 0;
    });
    
    if (numericColumns.length > 0) {
      const lowest = numericColumns.reduce((min, col) => {
        const minStats = getColumnStats(col)?.stats?.min || Infinity;
        const currentMin = getColumnStats(min)?.stats?.min || Infinity;
        return minStats < currentMin ? col : min;
      });
      
      const columnStats = getColumnStats(lowest);
      const extreme = findExtremeValue(lowest, 'min');
      
      return {
        answer: `The lowest value in your data is ${formatNumber(extreme.value)} in the "${lowest}" column, found in row ${extreme.row}. This column has an average value of ${formatNumber(columnStats?.stats?.average)}. This could indicate a data entry error, a special case or exception, the natural bottom of a cycle, or a period of underperformance that warrants investigation.`,
        followUp: [
          `Why is ${lowest} so low in row ${extreme.row}?`,
          `Is this a data error or real value?`,
          `What should the minimum ${lowest} be?`
        ]
      };
    }
  }

  if (questionLower.includes('average') || questionLower.includes('mean')) {
    const relevantColumn = findRelevantColumn(['total', 'sum', 'revenue', 'sales']) || 
                           numericHeaders.find(h => {
                             const s = getColumnStats(h);
                             return s?.stats?.average > 0;
                           });
    
    if (relevantColumn) {
      const columnStats = getColumnStats(relevantColumn);
      
      return {
        answer: `The average (mean) for "${relevantColumn}" is ${formatNumber(columnStats?.stats?.average)}. This means if you spread all the values equally across all records, each one would have this amount. The median (middle value) is ${formatNumber(columnStats?.stats?.median)}, and the values range from ${formatNumber(columnStats?.stats?.min)} to ${formatNumber(columnStats?.stats?.max)}. The standard deviation of ${formatNumber(columnStats?.stats?.stdDev)} indicates how spread out the values are from this average.`,
        followUp: [
          `Is this average higher or lower than expected?`,
          `What affects the ${relevantColumn} average?`,
          `How has this average changed over time?`
        ]
      };
    }
  }

  if ((questionLower.includes('why') || questionLower.includes('reason')) && 
      (questionLower.includes('high') || questionLower.includes('low') || questionLower.includes('increase') || questionLower.includes('decrease') || questionLower.includes('unusual') || questionLower.includes('anomaly'))) {
    
    const relevantColumn = findRelevantColumn(numericHeaders.map(h => h.toLowerCase()));
    
    if (relevantColumn) {
      const trend = getTrendDetails(relevantColumn);
      const columnAnomalies = getAnomalyDetails(relevantColumn);
      const extreme = questionLower.includes('high') || questionLower.includes('increase') 
        ? findExtremeValue(relevantColumn, 'max')
        : findExtremeValue(relevantColumn, 'min');
      const columnStats = getColumnStats(relevantColumn);
      
      let explanation = `The "${relevantColumn}" shows ${trend?.direction || 'stable'} behavior with a ${trend?.change ? formatPercent(Math.abs(trend.change)) : 'stable'} change. `;
      
      if (extreme?.value) {
        const deviation = extreme.row && columnStats?.stats?.average 
          ? Math.abs(((extreme.value - columnStats.stats.average) / columnStats.stats.average * 100)).toFixed(1)
          : null;
        
        explanation += `The most extreme value is ${formatNumber(extreme.value)} in row ${extreme.row}`;
        if (deviation) {
          explanation += `, which is ${deviation}% ${parseFloat(deviation) > 0 ? 'above' : 'below'} the average.`;
        } else {
          explanation += '.';
        }
      }
      
      if (columnAnomalies.length > 0) {
        explanation += ` Found ${columnAnomalies.length} unusual data point(s) in this column.`;
      }
      
      explanation += ` Common reasons for this pattern include seasonal variations, marketing campaigns, economic factors, operational changes, or data collection timing.`;
      
      return {
        answer: explanation,
        followUp: [
          `What business event caused the ${relevantColumn} to peak or dip?`,
          `Is this a trend or one-time event?`,
          `Should I investigate row ${extreme?.row} specifically?`
        ]
      };
    }
  }

  if (questionLower.includes('total') || questionLower.includes('sum') || questionLower.includes('overall')) {
    const numericColumns = numericHeaders.filter(h => {
      const s = getColumnStats(h);
      return s?.stats?.sum > 0;
    });
    
    if (numericColumns.length > 0) {
      const totals = numericColumns.map(col => {
        const columnStats = getColumnStats(col);
        return {
          column: col,
          total: columnStats?.stats?.sum || 0
        };
      });
      
      const grandTotal = totals.reduce((sum, t) => sum + t.total, 0);
      const topTotals = totals.sort((a, b) => b.total - a.total).slice(0, 3);
      
      let answer = `Here's a summary of your data totals:\n\nGrand Total: ${formatNumber(grandTotal)}\n\nTop contributors:\n`;
      topTotals.forEach(t => {
        answer += `• ${t.column}: ${formatNumber(t.total)}\n`;
      });
      answer += `\nThis represents the sum of all values across your ${data.length} records.`;
      
      return {
        answer: answer,
        followUp: [
          `What period does this total cover?`,
          `How does this total compare to previous periods?`,
          `Which ${topTotals[0]?.column} contributes most to the total?`
        ]
      };
    }
  }

  if (questionLower.includes('trend') || questionLower.includes('changing') || questionLower.includes('over time')) {
    if (trends.length > 0) {
      const sortedTrends = [...trends].sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
      const strongest = sortedTrends[0];
      const increasing = trends.filter(t => t.direction === 'increasing');
      const decreasing = trends.filter(t => t.direction === 'decreasing');
      
      let answer = `Your data shows ${trends.length} significant trends:\n\n`;
      answer += `Strongest Trend: "${strongest.column}" is ${strongest.direction} by ${formatPercent(Math.abs(strongest.change))} (${strongest.strength} strength)\n\n`;
      answer += `Overall Direction: ${increasing.length} metrics increasing, ${decreasing.length} metrics decreasing\n\n`;
      
      if (strongest.direction === 'increasing') {
        answer += `This indicates growth or improvement in this metric.\n`;
      } else {
        answer += `This indicates decline that may need attention.\n`;
      }
      
      if (strongest.volatility > 20) {
        answer += `Note: This metric shows ${strongest.volatility}% volatility, suggesting fluctuations.`;
      }
      
      return {
        answer: answer,
        followUp: [
          `What caused the ${strongest.direction} in ${strongest.column}?`,
          `Is this trend sustainable?`,
          `Should I be concerned about the decreasing metrics?`
        ]
      };
    }
  }

  if (questionLower.includes('anomaly') || questionLower.includes('unusual') || questionLower.includes('outlier') || questionLower.includes('strange')) {
    if (anomalies.length > 0) {
      const sortedAnomalies = [...anomalies].sort((a, b) => a.deviation - b.deviation);
      const mostSignificant = sortedAnomalies[sortedAnomalies.length - 1];
      const columnStats = getColumnStats(mostSignificant.column);
      
      let answer = `Found ${anomalies.length} unusual data point(s) in your data:\n\n`;
      answer += `Most Significant Anomaly:\n`;
      answer += `• Column: ${mostSignificant.column}\n`;
      answer += `• Row: ${mostSignificant.row}\n`;
      answer += `• Value: ${formatNumber(mostSignificant.value)}\n`;
      answer += `• Expected Range: ${formatNumber(mostSignificant.expectedRange?.min)} to ${formatNumber(mostSignificant.expectedRange?.max)}\n`;
      answer += `• Deviation: ${mostSignificant.deviation} standard deviations from average\n\n`;
      answer += `This means the value in row ${mostSignificant.row} is unusually ${mostSignificant.type} compared to typical values in this column (average: ${formatNumber(columnStats?.stats?.average)}). This could be a data entry error, a special event, fraud, equipment malfunction, or a genuine breakthrough.`;
      
      return {
        answer: answer,
        followUp: [
          `Should I investigate row ${mostSignificant.row}?`,
          `Is this a data error or real value?`,
          `How should I handle these anomalies?`
        ]
      };
    } else {
      return {
        answer: `Great news! No significant anomalies were detected in your data. All values fall within expected ranges based on statistical analysis. This suggests your data is consistent and reliable.`,
        followUp: [
          `How are anomalies detected?`,
          `What if I expect unusual values?`,
          `Can I set custom thresholds?`
        ]
      };
    }
  }

  if (questionLower.includes('growth') || questionLower.includes('growth rate') || questionLower.includes('increasing') || questionLower.includes('decreasing')) {
    const growing = trends.filter(t => t.direction === 'increasing');
    const declining = trends.filter(t => t.direction === 'decreasing');
    
    if (growing.length > 0 || declining.length > 0) {
      const fastestGrowing = growing.length > 0 ? growing.reduce((max, t) => t.change > max.change ? t : max, growing[0]) : null;
      const fastestDeclining = declining.length > 0 ? declining.reduce((min, t) => t.change < min.change ? t : min, declining[0]) : null;
      
      let answer = `Growth Analysis:\n\n`;
      
      if (growing.length > 0) {
        answer += `Growing Metrics (${growing.length}):\n`;
        growing.slice(0, 3).forEach(g => {
          answer += `• ${g.column}: +${formatPercent(g.change)} (${g.strength})\n`;
        });
      }
      
      if (declining.length > 0) {
        answer += `\nDeclining Metrics (${declining.length}):\n`;
        declining.slice(0, 3).forEach(d => {
          answer += `• ${d.column}: ${formatPercent(d.change)} (${d.strength})\n`;
        });
      }
      
      answer += `\n`;
      
      if (fastestGrowing) {
        answer += `Fastest Growing: "${fastestGrowing.column}" at +${formatPercent(fastestGrowing.change)}\n`;
      }
      if (fastestDeclining) {
        answer += `Fastest Declining: "${fastestDeclining.column}" at ${formatPercent(fastestDeclining.change)}\n`;
      }
      
      answer += `\n`;
      
      if (declining.length > growing.length) {
        answer += `More metrics are declining than growing, which may need attention.`;
      } else {
        answer += `More metrics are showing positive growth.`;
      }
      
      return {
        answer: answer,
        followUp: [
          `What caused ${fastestGrowing?.column} to grow so fast?`,
          `Why is ${fastestDeclining?.column} declining?`,
          `How can I improve the declining metrics?`
        ]
      };
    }
  }

  if (questionLower.includes('compare') || questionLower.includes('comparison') || questionLower.includes('vs') || questionLower.includes('versus')) {
    const parts = questionLower.split(/\s+(?:vs|versus|compared?|and)\s+/i);
    const column1 = findRelevantColumn(parts[0]?.split(/\s+/) || []);
    const column2 = findRelevantColumn(parts[1]?.split(/\s+/) || []);
    
    if (column1 && column2) {
      const stats1 = getColumnStats(column1)?.stats;
      const stats2 = getColumnStats(column2)?.stats;
      
      let answer = `Comparison: "${column1}" vs "${column2}"\n\n`;
      answer += `"${column1}":\n`;
      answer += `• Average: ${formatNumber(stats1?.average)}\n`;
      answer += `• Total: ${formatNumber(stats1?.sum)}\n`;
      answer += `• Range: ${formatNumber(stats1?.min)} - ${formatNumber(stats1?.max)}\n\n`;
      answer += `"${column2}":\n`;
      answer += `• Average: ${formatNumber(stats2?.average)}\n`;
      answer += `• Total: ${formatNumber(stats2?.sum)}\n`;
      answer += `• Range: ${formatNumber(stats2?.min)} - ${formatNumber(stats2?.max)}\n\n`;
      
      if (stats1?.average && stats2?.average) {
        const ratio = (stats1.average / stats2.average).toFixed(2);
        answer += `"${column1}" is ${ratio}x "${column2}" on average.`;
      }
      
      return {
        answer: answer,
        followUp: [
          `Why is ${column1} higher than ${column2}?`,
          `Should these metrics be related?`,
          `What factors affect both metrics?`
        ]
      };
    } else {
      const allStats = numericHeaders.slice(0, 5).map(h => ({
        column: h,
        stats: getColumnStats(h)?.stats
      })).filter(s => s.stats);
      
      let answer = `Here's a quick comparison of your key metrics:\n\n`;
      allStats.forEach(s => {
        answer += `"${s.column}":\n`;
        answer += `• Average: ${formatNumber(s.stats?.average)}\n`;
        answer += `• Total: ${formatNumber(s.stats?.sum)}\n`;
        answer += `• Range: ${formatNumber(s.stats?.min)} - ${formatNumber(s.stats?.max)}\n\n`;
      });
      
      return {
        answer: answer,
        followUp: [
          `Which metric is most important?`,
          `How do these relate to each other?`,
          `What benchmarks should I use?`
        ]
      };
    }
  }

  if (questionLower.includes('what is') || questionLower.includes('what are') || questionLower.includes('tell me about')) {
    const relevantColumn = findRelevantColumn(numericHeaders.map(h => h.toLowerCase()));
    
    if (relevantColumn) {
      const columnStats = getColumnStats(relevantColumn);
      const trend = getTrendDetails(relevantColumn);
      const columnAnomalies = getAnomalyDetails(relevantColumn);
      const values = getColumnValues(relevantColumn);
      
      let answer = `"${relevantColumn}" Analysis:\n\n`;
      answer += `Statistics:\n`;
      answer += `• Total: ${formatNumber(columnStats?.stats?.sum)}\n`;
      answer += `• Average: ${formatNumber(columnStats?.stats?.average)}\n`;
      answer += `• Median: ${formatNumber(columnStats?.stats?.median)}\n`;
      answer += `• Minimum: ${formatNumber(columnStats?.stats?.min)}\n`;
      answer += `• Maximum: ${formatNumber(columnStats?.stats?.max)}\n\n`;
      
      answer += `Trend: `;
      if (trend) {
        answer += `${trend.direction} by ${formatPercent(Math.abs(trend.change))} (${trend.strength} strength)\n`;
      } else {
        answer += `Stable - no significant trend detected\n`;
      }
      
      answer += `\nAnomalies: ${columnAnomalies.length} unusual data point(s) found\n`;
      answer += `\nData Points: ${values.length} records across ${data.length} rows`;
      
      return {
        answer: answer,
        followUp: [
          `How has ${relevantColumn} changed over time?`,
          `What affects ${relevantColumn}?`,
          `Is this a good or bad ${relevantColumn}?`
        ]
      };
    }
  }

  if (questionLower.includes('recommend') || questionLower.includes('suggest') || questionLower.includes('should i') || questionLower.includes('action') || questionLower.includes('what to do')) {
    const warnings = generateWhatToWatch(data, headers, stats, trends, anomalies);
    const findings = generateKeyFindings(data, headers, stats, trends, anomalies);
    
    const recommendations = [];
    
    const declining = trends.filter(t => t.direction === 'decreasing');
    if (declining.length > 0) {
      recommendations.push(`Address Declining Metrics: ${declining.length} metric(s) are showing decline, including "${declining[0].column}" (${formatPercent(declining[0].change)}). Investigate root causes.`);
    }
    
    const volatile = trends.filter(t => t.volatility > 20);
    if (volatile.length > 0) {
      recommendations.push(`Reduce Volatility: "${volatile[0].column}" shows ${volatile[0].volatility}% volatility. Consider smoothing techniques or identify causes of fluctuation.`);
    }
    
    if (anomalies.length > 0) {
      const anomalyRows = anomalies.slice(0, 3).map(a => a.row).join(', ');
      recommendations.push(`Investigate Anomalies: ${anomalies.length} unusual data point(s) detected. Review rows ${anomalyRows} for data quality or special events.`);
    }
    
    const positive = findings.filter(f => f.color === 'green');
    if (positive.length > 0) {
      recommendations.push(`Leverage Success: ${positive[0].title}. Build on this momentum.`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push(`Data Looks Good: No critical issues detected. Continue monitoring trends.`);
    }
    
    let answer = `Recommendations Based on Your Data:\n\n`;
    recommendations.forEach(rec => {
      answer += `• ${rec}\n\n`;
    });
    
    return {
      answer: answer,
      followUp: [
        `How can I improve the declining metrics?`,
        `What tools can help me monitor this?`,
        `How often should I review this data?`
      ]
    };
  }

  let answer = `I'd be happy to help you understand your data better! Based on your ${data.length} records and ${headers.length} columns, here are some things I can analyze:\n\n`;
  answer += `Available Metrics:\n`;
  numericHeaders.slice(0, 5).forEach((h, i) => {
    answer += `${i + 1}. ${h}\n`;
  });
  answer += `\nWhat I Can Answer:\n`;
  answer += `• Questions about specific values, averages, totals\n`;
  answer += `• Trend analysis and growth rates\n`;
  answer += `• Anomaly detection and unusual data points\n`;
  answer += `• Comparisons between metrics\n`;
  answer += `• Recommendations based on your data\n\n`;
  answer += `Try asking:\n`;
  answer += `• "What is the total [metric]?"\n`;
  answer += `• "Why is [column] so high/low?"\n`;
  answer += `• "What trends exist in my data?"\n`;
  answer += `• "Are there any anomalies?"\n`;
  answer += `• "Compare [metric1] and [metric2]"\n`;
  answer += `• "What should I do about my data?"`;

  return {
    answer: answer,
    followUp: [
      "What is the total revenue/sales?",
      "Why is this number so high?",
      "What trends exist in my data?",
      "Are there any anomalies I should know about?"
    ]
  };
}
