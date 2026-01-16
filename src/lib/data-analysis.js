export function analyzeDataType(data, headers) {
  const headerText = headers.join(' ').toLowerCase();
  const sampleData = data.slice(0, 10);
  const numericHeaders = headers.filter(header => {
    const values = sampleData.map(row => row[header]);
    const numericCount = values.filter(v => !isNaN(parseFloat(v)) && v !== '').length;
    return numericCount / values.length > 0.7;
  });

  const patterns = {
    sales: [
      ['sales', 'revenue', 'income'],
      ['order', 'quantity', 'units sold'],
      ['customer', 'purchase', 'transaction'],
      ['region', 'territory', 'area']
    ],
    jobs: [
      ['job', 'position', 'role', 'title'],
      ['salary', 'wage', 'compensation', 'pay'],
      ['employee', 'hire', 'hiring', 'recruitment'],
      ['department', 'team', 'manager'],
      ['experience', 'skill', 'qualification'],
      ['application', 'applicant', 'interview']
    ],
    marketing: [
      ['campaign', 'ad', 'advertisement'],
      ['impression', 'click', 'ctr', 'conversion'],
      ['lead', 'prospect', 'opportunity'],
      ['audience', 'segment', 'target'],
      ['engagement', 'reach', 'follower']
    ],
    financial: [
      ['profit', 'loss', 'ebitda'],
      ['budget', 'expense', 'cost'],
      ['investment', 'roi', 'return'],
      ['asset', 'liability', 'equity'],
      ['cash', 'flow', 'balance']
    ],
    inventory: [
      ['stock', 'inventory', 'warehouse'],
      ['sku', 'product', 'item'],
      ['supplier', 'vendor', 'po'],
      ['reorder', 'lead time'],
      ['quantity', 'on hand']
    ],
    healthcare: [
      ['patient', 'diagnosis', 'treatment'],
      ['admission', 'discharge', 'length of stay'],
      ['procedure', 'surgery', 'medication'],
      ['department', 'ward', 'room'],
      ['insurance', 'billing', 'claim']
    ],
    education: [
      ['student', 'grade', 'gpa'],
      ['course', 'class', 'subject'],
      ['enrollment', 'admission'],
      ['teacher', 'professor', 'instructor'],
      ['score', 'assessment', 'exam']
    ],
    ecommerce: [
      ['cart', 'checkout', 'abandonment'],
      ['product', 'category', 'sku'],
      ['review', 'rating', 'feedback'],
      ['shipping', 'delivery', 'return']
    ],
    hr: [
      ['performance', 'review', 'rating'],
      ['benefit', 'leave', 'vacation'],
      ['turnover', 'retention', 'attrition'],
      ['training', 'development', 'certification']
    ],
    logistics: [
      ['shipment', 'delivery', 'route'],
      ['driver', 'vehicle', 'fleet'],
      ['distance', 'mileage', 'fuel'],
      ['eta', 'dispatch', 'schedule']
    ],
    manufacturing: [
      ['production', 'output', 'yield'],
      ['defect', 'quality', 'scrap'],
      ['machine', 'equipment', 'maintenance'],
      ['shift', 'worker', 'operator']
    ],
    realestate: [
      ['property', 'listing', 'sale'],
      ['price', 'sqft', 'acre'],
      ['agent', 'broker', 'buyer'],
      ['mortgage', 'interest', 'loan']
    ],
    customerService: [
      ['ticket', 'case', 'resolution'],
      ['response time', 'wait time', 'sla'],
      ['complaint', 'satisfaction', 'nps'],
      ['agent', 'representative', 'support']
    ],
    websiteAnalytics: [
      ['pageview', 'session', 'user'],
      ['bounce', 'exit', 'duration'],
      ['source', 'referral', 'utm'],
      ['device', 'browser', 'location']
    ],
    socialMedia: [
      ['post', 'share', 'retweet'],
      ['like', 'comment', 'reaction'],
      ['follower', 'unfollower', 'growth'],
      ['engagement', 'reach', 'impression']
    ]
  };

  const patternScores = {};
  const patternKeys = Object.keys(patterns);
  
  for (let i = 0; i < patternKeys.length; i++) {
    const type = patternKeys[i];
    let score = 0;
    const patternGroups = patterns[type];
    for (let j = 0; j < patternGroups.length; j++) {
      const patternGroup = patternGroups[j];
      for (let k = 0; k < patternGroup.length; k++) {
        if (headerText.includes(patternGroup[k])) {
          score += patternGroup.length;
        }
      }
    }
    patternScores[type] = score;
  }

  const sortedTypes = Object.entries(patternScores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a);

  if (sortedTypes.length > 0) {
    const topType = sortedTypes[0];
    const confidence = Math.min(0.95, 0.5 + (topType[1] * 0.1));
    
    const typeInfo = {
      sales: {
        label: 'Sales Data',
        description: 'Transaction records, customer purchases, revenue metrics, and sales performance indicators',
        metrics: ['Revenue', 'Units Sold', 'Average Order Value', 'Customer Count'],
        verbs: ['generated', 'sold', 'purchased', 'earned'],
        context: 'sales periods, customer segments, and product performance'
      },
      jobs: {
        label: 'Employment Data',
        description: 'Job listings, salary information, hiring records, and workforce metrics',
        metrics: ['Salary Range', 'Positions Available', 'Applications per Role', 'Hiring Rate'],
        verbs: ['paying', 'offering', 'hiring for', 'recruiting'],
        context: 'job market, salary benchmarks, and talent acquisition'
      },
      marketing: {
        label: 'Marketing Data',
        description: 'Campaign performance, audience engagement, lead generation, and conversion metrics',
        metrics: ['Impressions', 'Click-through Rate', 'Conversions', 'Cost per Lead'],
        verbs: ['converted', 'engaged', 'clicked', 'responded'],
        context: 'campaign effectiveness, audience reach, and ROI'
      },
      financial: {
        label: 'Financial Data',
        description: 'Revenue, expenses, profits, investments, and other monetary metrics',
        metrics: ['Total Revenue', 'Net Profit', 'Operating Costs', 'Cash Flow'],
        verbs: ['earned', 'spent', 'invested', 'generated'],
        context: 'fiscal performance, profitability, and financial health'
      },
      inventory: {
        label: 'Inventory Data',
        description: 'Stock levels, product quantities, supply chain, and warehouse metrics',
        metrics: ['Stock Level', 'Reorder Point', 'Turnover Rate', 'Lead Time'],
        verbs: ['stocked', 'ordered', 'shipped', 'reordered'],
        context: 'stock availability, supply chain efficiency, and reorder needs'
      },
      healthcare: {
        label: 'Healthcare Data',
        description: 'Patient information, treatment outcomes, hospital operations, and medical metrics',
        metrics: ['Patient Count', 'Treatment Duration', 'Admission Rate', 'Success Rate'],
        verbs: ['treated', 'admitted', 'discharged', 'diagnosed'],
        context: 'patient care quality, operational efficiency, and health outcomes'
      },
      education: {
        label: 'Education Data',
        description: 'Student performance, enrollment figures, course metrics, and educational outcomes',
        metrics: ['Enrollment', 'Average Grade', 'Completion Rate', 'Attendance'],
        verbs: ['enrolled', 'completed', 'graduated', 'scored'],
        context: 'academic performance, student success, and institutional effectiveness'
      },
      ecommerce: {
        label: 'E-Commerce Data',
        description: 'Online shopping behavior, product performance, customer purchasing patterns',
        metrics: ['Cart Abandonment', 'Conversion Rate', 'Average Order Value', 'Product Views'],
        verbs: ['bought', 'added to cart', 'reviewed', 'purchased'],
        context: 'shopping behavior, conversion funnels, and customer preferences'
      },
      hr: {
        label: 'HR Data',
        description: 'Employee information, performance metrics, benefits usage, and workforce analytics',
        metrics: ['Retention Rate', 'Performance Score', 'Training Hours', 'Leave Balance'],
        verbs: ['performed', 'received', 'utilized', 'completed'],
        context: 'employee productivity, satisfaction, and organizational health'
      },
      logistics: {
        label: 'Logistics Data',
        description: 'Shipping schedules, delivery performance, fleet management, and transportation metrics',
        metrics: ['Delivery Time', 'On-time Rate', 'Distance Covered', 'Fuel Efficiency'],
        verbs: ['delivered', 'shipped', 'dispatched', 'transported'],
        context: 'delivery efficiency, route optimization, and service levels'
      },
      manufacturing: {
        label: 'Manufacturing Data',
        description: 'Production output, quality control, equipment performance, and operational metrics',
        metrics: ['Units Produced', 'Defect Rate', 'Machine Uptime', 'Worker Productivity'],
        verbs: ['produced', 'manufactured', 'assembled', 'fabricated'],
        context: 'production efficiency, quality standards, and operational capacity'
      },
      realestate: {
        label: 'Real Estate Data',
        description: 'Property listings, sales records, pricing trends, and market analytics',
        metrics: ['Property Price', 'Days on Market', 'Square Footage', 'Commission'],
        verbs: ['sold', 'listed', 'valued', 'appraised'],
        context: 'market conditions, property values, and sales performance'
      },
      customerService: {
        label: 'Customer Service Data',
        description: 'Support tickets, resolution times, customer satisfaction, and service metrics',
        metrics: ['Resolution Time', 'Satisfaction Score', 'Ticket Volume', 'First Contact Resolution'],
        verbs: ['resolved', 'responded to', 'escalated', 'addressed'],
        context: 'service quality, response efficiency, and customer satisfaction'
      },
      websiteAnalytics: {
        label: 'Website Analytics',
        description: 'Web traffic, user behavior, page performance, and visitor metrics',
        metrics: ['Page Views', 'Session Duration', 'Bounce Rate', 'Traffic Sources'],
        verbs: ['visited', 'browsed', 'navigated', 'engaged with'],
        context: 'user engagement, site performance, and traffic patterns'
      },
      socialMedia: {
        label: 'Social Media Data',
        description: 'Post performance, audience growth, engagement metrics, and content analytics',
        metrics: ['Engagement Rate', 'Follower Growth', 'Post Reach', 'Share of Voice'],
        verbs: ['liked', 'shared', 'commented on', 'engaged with'],
        context: 'audience growth, content performance, and brand engagement'
      }
    };

    const info = typeInfo[topType[0]] || {
      label: 'General Data',
      description: 'Numeric data for analysis',
      metrics: ['Values', 'Totals', 'Averages', 'Trends'],
      verbs: ['measured', 'calculated', 'aggregated', 'compared'],
      context: 'statistical patterns and data distributions'
    };

    return {
      type: topType[0],
      ...info,
      confidence,
      keywords: patterns[topType[0]].filter(p => p.some(k => headerText.includes(k)))
    };
  }

  if (numericHeaders.length > 3) {
    const hasDateColumn = headers.some(h => 
      h.toLowerCase().includes('date') || 
      h.toLowerCase().includes('month') ||
      h.toLowerCase().includes('year')
    );
    
    if (hasDateColumn) {
      return {
        type: 'timeSeries',
        label: 'Time Series Data',
        description: 'Temporal data with measurements across different time periods',
        metrics: ['Period Values', 'Growth Rate', 'Seasonal Patterns', 'Trends'],
        verbs: ['measured', 'recorded', 'tracked', 'observed'],
        context: 'temporal patterns, seasonal variations, and historical trends'
      };
    }
    
    return {
      type: 'general',
      label: 'General Numeric Data',
      description: 'Multi-dimensional numeric dataset for analysis',
      metrics: ['Averages', 'Totals', 'Ranges', 'Distributions'],
      verbs: ['measured', 'calculated', 'aggregated', 'compared'],
      context: 'statistical patterns and data distributions'
    };
  }

  if (numericHeaders.length > 0) {
    const avgValues = sampleData
      .map(row => parseFloat(Object.values(row)[0]))
      .filter(v => !isNaN(v));
    
    if (avgValues.length > 0 && avgValues[0] > 100) {
      return {
        type: 'survey',
        label: 'Survey/Metrics Data',
        description: 'Survey responses, ratings, or metric measurements',
        metrics: ['Average Score', 'Response Distribution', 'Satisfaction Rate'],
        verbs: ['rated', 'scored', 'responded', 'evaluated'],
        context: 'respondent feedback, satisfaction levels, and opinion distributions'
      };
    }
  }

  return {
    type: 'categorical',
    label: 'Categorical Data',
    description: 'Text-based or categorical information without numeric analysis',
    metrics: ['Categories', 'Counts', 'Distributions'],
    verbs: ['categorized', 'grouped', 'classified', 'organized'],
    context: 'category distributions and groupings'
  };
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

  const topMetrics = avgValues.slice(0, 3).map(a => '"' + a.column + '" (avg: ' + a.avg.toLocaleString() + ')').join(', ');
  
  let summary = 'This ' + dataType.label.toLowerCase() + ' dataset contains ' + rowCount.toLocaleString() + ' records across ' + colCount + ' columns, focusing on ' + dataType.context + '. ';
  
  if (numericStats.length > 0) {
    const maxCol = avgValues[0] ? avgValues[0].column : 'N/A';
    const maxAvg = avgValues[0] ? avgValues[0].avg : 0;
    const minCol = avgValues[avgValues.length - 1] ? avgValues[avgValues.length - 1].column : 'N/A';
    const minAvg = avgValues[avgValues.length - 1] ? avgValues[avgValues.length - 1].avg : 0;
    
    const metricsLower = dataType.metrics.slice(0, 3).join(', ').toLowerCase();
    summary += 'Key ' + metricsLower + ' show that ' + topMetrics + '. ';
    summary += '"' + maxCol + '" has the highest average at ' + maxAvg.toLocaleString() + ', while "' + minCol + '" averages ' + minAvg.toLocaleString() + '. ';
    summary += 'The total across all metrics is ' + totalSum.toLocaleString() + '.';
  } else {
    summary += 'This dataset contains categorical information organized across ' + colCount + ' columns.';
  }

  return summary;
}

export function generateKeyFindings(data, headers, stats, trends, anomalies, dataType) {
  const findings = [];
  const verbs = dataType.verbs || ['measured', 'recorded', 'observed', 'calculated'];

  if (trends.length > 0) {
    const significantTrends = trends.filter(t => Math.abs(t.trend.percentChange) > 10 && t.trend.strength > 0.2);
    if (significantTrends.length > 0) {
      const topTrend = significantTrends[0];
      const direction = topTrend.trend.direction === 'increasing' ? 'grown significantly' : 'declined substantially';
      const verb = topTrend.trend.direction === 'increasing' ? verbs[0] || 'increased' : verbs[2] || 'decreased';
      
      findings.push({
        title: 'Strong Trend Detected',
        description: 'The "' + topTrend.column + '" has ' + direction + ' by ' + Math.abs(topTrend.trend.percentChange).toFixed(1) + '% over the observed period, indicating notable ' + (topTrend.trend.direction === 'increasing' ? 'growth' : 'decline') + ' in this metric.',
        type: topTrend.trend.direction === 'increasing' ? 'positive' : 'negative',
        icon: topTrend.trend.direction === 'increasing' ? 'TrendingUp' : 'TrendingDown'
      });
    }
  }

  const topStats = [...stats].filter(s => s.stats !== null).sort((a, b) => b.stats.sum - a.stats.sum);
  if (topStats.length > 0) {
    const metric = dataType.metrics[0] || 'metric';
    findings.push({
      title: 'Highest Volume Identified',
      description: '"' + topStats[0].column + '" shows the highest cumulative total at ' + topStats[0].stats.sum.toLocaleString() + ', representing ' + (topStats[0].stats.sum / topStats.reduce((acc, s) => acc + (s.stats ? s.stats.sum : 0), 0) * 100).toFixed(1) + '% of all activity in this dataset.',
      type: 'neutral',
      icon: 'BarChart'
    });
  }

  if (anomalies.length > 0) {
    const highAnomalies = anomalies.filter(a => a.type === 'high').slice(0, 2);
    if (highAnomalies.length > 0) {
      findings.push({
        title: 'Exceptional Values Detected',
        description: 'Found ' + highAnomalies.length + ' unusually high values, including ' + highAnomalies[0].value.toLocaleString() + ' in "' + highAnomalies[0].column + '" (row ' + highAnomalies[0].row + '), which is ' + highAnomalies[0].deviation + ' above the norm and warrants investigation.',
        type: 'warning',
        icon: 'AlertTriangle'
      });
    }
  }

  const volatileMetrics = trends.filter(t => t.volatility.rating === 'High' || t.volatility.rating === 'Very High');
  if (volatileMetrics.length > 0) {
    findings.push({
      title: 'High Variability Detected',
      description: '"' + volatileMetrics[0].column + '" shows ' + volatileMetrics[0].volatility.rating.toLowerCase() + ' volatility (' + volatileMetrics[0].volatility.volatility + '%), indicating significant fluctuations that may require attention.',
      type: 'warning',
      icon: 'Activity'
    });
  }

  const stableTrends = trends.filter(t => t.trend.direction === 'stable' && t.trend.strength < 0.1);
  if (stableTrends.length > 0) {
    findings.push({
      title: 'Consistent Performance Observed',
      description: '"' + stableTrends[0].column + '" maintains steady levels with minimal variation (' + stableTrends[0].trend.percentChange.toFixed(1) + '% change), suggesting reliable and predictable patterns in this area.',
      type: 'positive',
      icon: 'CheckCircle'
    });
  }

  return findings.slice(0, 5);
}

export function generateWhatToWatch(stats, trends, anomalies, dataType) {
  const warnings = [];
  const domainContext = dataType.context || 'your dataset';

  const highAnomalies = anomalies.filter(a => a.zScore > 2.5);
  if (highAnomalies.length > 0) {
    warnings.push({
      title: 'Significant Outliers Detected',
      description: highAnomalies.length + ' values exceed 2.5 standard deviations from the mean, which may indicate data anomalies, exceptional events, or errors requiring investigation within ' + domainContext + '.',
      severity: 'high',
      action: 'Review outlier rows for accuracy and contextual validity'
    });
  }

  const decliningTrends = trends.filter(t => t.trend.direction === 'decreasing' && Math.abs(t.trend.percentChange) > 20);
  if (decliningTrends.length > 0) {
    warnings.push({
      title: 'Declining Metrics Need Attention',
      description: '"' + decliningTrends[0].column + '" has declined by ' + Math.abs(decliningTrends[0].trend.percentChange).toFixed(1) + '%. This sustained decrease warrants investigation into root causes within ' + domainContext + '.',
      severity: decliningTrends[0].trend.percentChange < -50 ? 'high' : 'medium',
      action: 'Investigate factors causing decline in "' + decliningTrends[0].column + '" within ' + domainContext
    });
  }

  const highVolatility = trends.filter(t => t.volatility.rating === 'Very High');
  if (highVolatility.length > 0) {
    warnings.push({
      title: 'Extreme Variability Pattern',
      description: '"' + highVolatility[0].column + '" exhibits ' + highVolatility[0].volatility.rating.toLowerCase() + ' volatility (' + highVolatility[0].volatility.volatility + '%), suggesting unpredictable fluctuations that could indicate instability in ' + domainContext + '.',
      severity: 'medium',
      action: 'Identify external factors causing volatility'
    });
  }

  const zeroColumns = stats.filter(s => s.stats !== null && s.stats.sum === 0);
  if (zeroColumns.length > 0) {
    const columnNames = zeroColumns.slice(0, 3).map(function(c) { return '"' + c.column + '"'; }).join(', ');
    warnings.push({
      title: 'Inactive Metrics Found',
      description: zeroColumns.length + ' column(s) contain only zero values: ' + columnNames + '. These may be placeholder metrics or data that needs attention.',
      severity: 'low',
      action: 'Verify if these columns should contain data for analysis'
    });
  }

  return warnings;
}

export function generateContext(stats, trends, dataType) {
  const context = [];
  const label = dataType.label || 'Data';
  const domainContext = dataType.context || 'your dataset';

  const benchmarks = {
    sales: { growthRate: 10, volatility: 20, topMetric: 'Revenue' },
    jobs: { growthRate: 5, volatility: 15, topMetric: 'Hiring Rate' },
    marketing: { growthRate: 15, volatility: 25, topMetric: 'Conversion Rate' },
    financial: { growthRate: 8, volatility: 15, topMetric: 'Profit Margin' },
    inventory: { growthRate: 5, volatility: 10, topMetric: 'Turnover Rate' },
    healthcare: { growthRate: 3, volatility: 8, topMetric: 'Patient Satisfaction' },
    education: { growthRate: 2, volatility: 10, topMetric: 'Graduation Rate' },
    ecommerce: { growthRate: 12, volatility: 20, topMetric: 'Conversion Rate' },
    hr: { growthRate: 5, volatility: 10, topMetric: 'Retention Rate' },
    logistics: { growthRate: 5, volatility: 15, topMetric: 'On-Time Delivery' },
    manufacturing: { growthRate: 4, volatility: 12, topMetric: 'Production Yield' },
    realestate: { growthRate: 6, volatility: 18, topMetric: 'Days on Market' },
    customerService: { growthRate: 4, volatility: 12, topMetric: 'Resolution Rate' },
    websiteAnalytics: { growthRate: 20, volatility: 30, topMetric: 'Bounce Rate' },
    socialMedia: { growthRate: 25, volatility: 35, topMetric: 'Engagement Rate' },
    timeSeries: { growthRate: 5, volatility: 15, topMetric: 'Period Change' },
    general: { growthRate: 5, volatility: 15, topMetric: 'Average Value' },
    survey: { growthRate: 0, volatility: 10, topMetric: 'Response Rate' },
    categorical: { growthRate: 0, volatility: 0, topMetric: 'Category Count' }
  };

  const benchmark = benchmarks[dataType.type] || benchmarks.general;

  if (trends.length > 0) {
    const avgGrowth = trends.reduce(function(acc, t) { return acc + Math.abs(t.trend.percentChange); }, 0) / trends.length;
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
      title: benchmark.topMetric + ' Performance',
      description: 'Average change across all ' + label.toLowerCase() + ' metrics is ' + avgGrowth.toFixed(1) + '%, which is ' + assessment + ' compared to typical ' + label.toLowerCase() + ' benchmarks of ' + benchmark.growthRate + '% in ' + domainContext + '.',
      benchmark: benchmark.growthRate + '%',
      status: avgGrowth > benchmark.growthRate ? 'above' : (avgGrowth < benchmark.growthRate / 2 ? 'below' : 'at')
    });
  }

  const avgVolatility = trends.length > 0 
    ? trends.reduce(function(acc, t) { return acc + t.volatility.volatility; }, 0) / trends.length 
    : 0;

  if (avgVolatility > 0) {
    context.push({
      title: 'Stability Assessment',
      description: 'Average volatility is ' + avgVolatility.toFixed(1) + '%, ' + (avgVolatility < benchmark.volatility ? 'indicating more stable performance than typical industry benchmarks.' : 'suggesting higher fluctuation than typical standards in this domain.'),
      benchmark: benchmark.volatility + '%',
      status: avgVolatility < benchmark.volatility ? 'above' : 'below'
    });
  }

  context.push({
    title: 'Domain Context',
    description: 'This ' + label.toLowerCase() + ' should be evaluated against industry standards for ' + domainContext + '.',
    benchmark: 'Industry Varies',
    status: 'info'
  });

  return context;
}

export function answerQuestion(question, data, headers, stats, trends, anomalies, dataType) {
  const questionLower = question.toLowerCase();
  const domainInfo = dataType || { 
    label: 'Data', 
    verbs: ['measured', 'recorded', 'observed', 'calculated'],
    metrics: ['values', 'totals', 'averages', 'trends'],
    context: 'your dataset'
  };

  function findRelevantColumn(keywords) {
    return headers.find(function(header) {
      const headerLower = header.toLowerCase();
      return keywords.some(function(keyword) { return headerLower.includes(keyword.toLowerCase()); });
    });
  }

  function getColumnStats(columnName) {
    return stats.find(function(s) { return s.column === columnName; });
  }

  function getColumnValues(columnName) {
    return data.map(function(row) { return parseFloat(row[columnName]); }).filter(function(v) { return !isNaN(v); });
  }

  function getAnomalyDetails(columnName) {
    return anomalies.filter(function(a) { return a.column === columnName; });
  }

  function getTrendDetails(columnName) {
    return trends.find(function(t) { return t.column === columnName; });
  }

  function findExtremeValue(columnName, type) {
    const values = getColumnValues(columnName);
    if (values.length === 0) return null;
    
    const indexedValues = values.map(function(val, idx) { return { val: val, idx: idx }; });
    const sorted = type === 'max' 
      ? indexedValues.sort(function(a, b) { return b.val - a.val; })
      : indexedValues.sort(function(a, b) { return a.val - b.val; });
    
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

  const numericHeaders = headers.filter(function(header) {
    const values = data.slice(0, 10).map(function(row) { return row[header]; });
    const numericCount = values.filter(function(v) { return !isNaN(parseFloat(v)) && v !== ''; }).length;
    return numericCount / values.length > 0.8;
  });

  if (questionLower.includes('highest') || questionLower.includes('largest') || questionLower.includes('biggest') || questionLower.includes('max') || questionLower.includes('peak')) {
    const numericColumns = numericHeaders.filter(function(h) {
      const columnStats = getColumnStats(h);
      return columnStats && columnStats.stats && columnStats.stats.max > 0;
    });
    
    if (numericColumns.length > 0) {
      const highest = numericColumns.reduce(function(max, col) {
        const maxStats = getColumnStats(col) ? getColumnStats(col).stats.max : 0;
        const currentMax = getColumnStats(max) ? getColumnStats(max).stats.max : 0;
        return maxStats > currentMax ? col : max;
      });
      
      const columnStats = getColumnStats(highest);
      const extreme = findExtremeValue(highest, 'max');
      const verb = domainInfo.verbs[0] || 'measured';
      
      return {
        answer: 'The peak ' + highest.toLowerCase() + ' in your ' + domainInfo.label.toLowerCase() + ' is ' + formatNumber(extreme.value) + ', found in row ' + extreme.row + '. This metric ' + verb + ' an average of ' + formatNumber(columnStats ? columnStats.stats.average : 0) + ', ranging from ' + formatNumber(columnStats ? columnStats.stats.min : 0) + ' to ' + formatNumber(columnStats ? columnStats.stats.max : 0) + '. This represents the highest performance or maximum measurement for this ' + (domainInfo.metrics[0] || 'metric') + ' in your dataset.',
        followUp: [
          'What caused the high ' + highest + ' in row ' + extreme.row + '?',
          'How does this compare to the average ' + highest + '?',
          'Are there other periods with high ' + highest + '?'
        ]
      };
    }
  }

  if (questionLower.includes('lowest') || questionLower.includes('smallest') || questionLower.includes('min') || questionLower.includes('bottom') || questionLower.includes('trough')) {
    const numericColumns = numericHeaders.filter(function(h) {
      const columnStats = getColumnStats(h);
      return columnStats && columnStats.stats && columnStats.stats.min >= 0;
    });
    
    if (numericColumns.length > 0) {
      const lowest = numericColumns.reduce(function(min, col) {
        const minStats = getColumnStats(col) ? getColumnStats(col).stats.min : Infinity;
        const currentMin = getColumnStats(min) ? getColumnStats(min).stats.min : Infinity;
        return minStats < currentMin ? col : min;
      });
      
      const columnStats = getColumnStats(lowest);
      const extreme = findExtremeValue(lowest, 'min');
      
      return {
        answer: 'The lowest ' + lowest.toLowerCase() + ' in your ' + domainInfo.label.toLowerCase() + ' is ' + formatNumber(extreme.value) + ', found in row ' + extreme.row + '. This metric ' + (domainInfo.verbs[1] || 'averaged') + ' ' + formatNumber(columnStats ? columnStats.stats.average : 0) + '. This could indicate a data anomaly, a seasonal low, a special case, or an area needing improvement within ' + domainInfo.context + '.',
        followUp: [
          'Why is ' + lowest + ' so low in row ' + extreme.row + '?',
          'Is this a data error or real value?',
          'What should the minimum ' + lowest + ' be?'
        ]
      };
    }
  }

  if (questionLower.includes('average') || questionLower.includes('mean') || questionLower.includes('typical')) {
    const relevantColumn = findRelevantColumn(['total', 'sum', 'revenue', 'sales']) || 
                           numericHeaders.find(function(h) {
                             const s = getColumnStats(h);
                             return s && s.stats && s.stats.average > 0;
                           });
    
    if (relevantColumn) {
      const columnStats = getColumnStats(relevantColumn);
      
      return {
        answer: 'The average (mean) ' + relevantColumn.toLowerCase() + ' in your ' + domainInfo.label.toLowerCase() + ' is ' + formatNumber(columnStats ? columnStats.stats.average : 0) + '. The median (middle value) is ' + formatNumber(columnStats ? columnStats.stats.median : 0) + ', with values ranging from ' + formatNumber(columnStats ? columnStats.stats.min : 0) + ' to ' + formatNumber(columnStats ? columnStats.stats.max : 0) + '. The standard deviation of ' + formatNumber(columnStats ? columnStats.stats.stdDev : 0) + ' indicates how spread out the ' + (domainInfo.metrics[0] || 'values') + ' are from this average.',
        followUp: [
          'Is this average higher or lower than expected for ' + domainInfo.context + '?',
          'What affects the ' + relevantColumn + ' average?',
          'How has this average changed over time?'
        ]
      };
    }
  }

  if ((questionLower.includes('why') || questionLower.includes('reason') || questionLower.includes('cause') || questionLower.includes('explain')) && 
      (questionLower.includes('high') || questionLower.includes('low') || questionLower.includes('increase') || questionLower.includes('decrease') || questionLower.includes('unusual') || questionLower.includes('anomaly') || questionLower.includes(' spike') || questionLower.includes('drop'))) {
    
    const relevantColumn = findRelevantColumn(numericHeaders.map(function(h) { return h.toLowerCase(); }));
    
    if (relevantColumn) {
      const trend = getTrendDetails(relevantColumn);
      const columnAnomalies = getAnomalyDetails(relevantColumn);
      const extreme = questionLower.includes('high') || questionLower.includes('increase') || questionLower.includes(' spike')
        ? findExtremeValue(relevantColumn, 'max')
        : findExtremeValue(relevantColumn, 'min');
      const columnStats = getColumnStats(relevantColumn);
      
      let explanation = 'The "' + relevantColumn + '" shows ' + (trend ? trend.direction : 'stable') + ' behavior with a ' + (trend && trend.change ? formatPercent(Math.abs(trend.change)) : 'stable') + ' change in your ' + domainInfo.label.toLowerCase() + '. ';
      
      if (extreme && extreme.value) {
        const deviation = extreme.row && columnStats && columnStats.stats && columnStats.stats.average 
          ? Math.abs(((extreme.value - columnStats.stats.average) / columnStats.stats.average * 100)).toFixed(1)
          : null;
        
        explanation += 'The most extreme value is ' + formatNumber(extreme.value) + ' in row ' + extreme.row;
        if (deviation) {
          explanation += ', which is ' + deviation + '% ' + (parseFloat(deviation) > 0 ? 'above' : 'below') + ' the typical ' + (domainInfo.metrics[0] || 'value') + '.';
        } else {
          explanation += '.';
        }
      }
      
      if (columnAnomalies.length > 0) {
        explanation += ' Found ' + columnAnomalies.length + ' unusual data point(s) in this ' + (domainInfo.metrics[0] || 'column') + '.';
      }
      
      explanation += ' Common factors that could explain this pattern within ' + domainInfo.context + ' include seasonal variations, external events, operational changes, or data collection timing.';
      
      return {
        answer: explanation,
        followUp: [
          'What business event caused the ' + relevantColumn + ' to peak or dip?',
          'Is this a trend or one-time event?',
          'Should I investigate row ' + (extreme ? extreme.row : 'unknown') + ' specifically?'
        ]
      };
    }
  }

  if (questionLower.includes('total') || questionLower.includes('sum') || questionLower.includes('overall') || questionLower.includes('aggregate')) {
    const numericColumns = numericHeaders.filter(function(h) {
      const s = getColumnStats(h);
      return s && s.stats && s.stats.sum > 0;
    });
    
    if (numericColumns.length > 0) {
      const totals = numericColumns.map(function(col) {
        const columnStats = getColumnStats(col);
        return {
          column: col,
          total: columnStats && columnStats.stats ? columnStats.stats.sum : 0
        };
      });
      
      const grandTotal = totals.reduce(function(sum, t) { return sum + t.total; }, 0);
      const topTotals = totals.sort(function(a, b) { return b.total - a.total; }).slice(0, 3);
      
      let answer = 'Summary of totals in your ' + domainInfo.label.toLowerCase() + ':\n\n';
      answer += 'Grand Total: ' + formatNumber(grandTotal) + '\n\n';
      answer += 'Top contributors:\n';
      topTotals.forEach(function(t) {
        answer += '• ' + t.column + ': ' + formatNumber(t.total) + '\n';
      });
      answer += '\nThis represents the sum of all ' + (domainInfo.metrics[0] || 'values') + ' across your ' + data.length + ' records in ' + domainInfo.context + '.';
      
      return {
        answer: answer,
        followUp: [
          'What period does this total cover?',
          'How does this total compare to previous periods?',
          'Which ' + (topTotals[0] ? topTotals[0].column : 'metric') + ' contributes most to the total?'
        ]
      };
    }
  }

  if (questionLower.includes('trend') || questionLower.includes('changing') || questionLower.includes('over time') || questionLower.includes('pattern')) {
    if (trends.length > 0) {
      const sortedTrends = [...trends].sort(function(a, b) { return Math.abs(b.change) - Math.abs(a.change); });
      const strongest = sortedTrends[0];
      const increasing = trends.filter(function(t) { return t.direction === 'increasing'; });
      const decreasing = trends.filter(function(t) { return t.direction === 'decreasing'; });
      const stable = trends.filter(function(t) { return t.direction === 'stable'; });
      
      let answer = 'Your ' + domainInfo.label.toLowerCase() + ' shows ' + trends.length + ' significant patterns:\n\n';
      answer += 'Strongest Pattern: "' + strongest.column + '" is ' + strongest.direction + ' by ' + formatPercent(Math.abs(strongest.change)) + ' (' + (strongest.strength * 100).toFixed(0) + '% confidence)\n\n';
      answer += 'Overall Direction: ' + increasing.length + ' metrics increasing, ' + decreasing.length + ' decreasing, ' + stable.length + ' stable\n\n';
      
      if (strongest.direction === 'increasing') {
        answer += 'This indicates positive growth or improvement in this ' + (domainInfo.metrics[0] || 'metric') + ' within ' + domainInfo.context + '.\n';
      } else if (strongest.direction === 'decreasing') {
        answer += 'This indicates decline that may need attention in your ' + domainInfo.label.toLowerCase() + '.\n';
      } else {
        answer += 'This indicates consistent, stable patterns in ' + domainInfo.context + '.\n';
      }
      
      if (strongest.volatility > 20) {
        answer += 'Note: This metric shows ' + strongest.volatility + '% volatility, suggesting fluctuations in the pattern.';
      }
      
      return {
        answer: answer,
        followUp: [
          'What caused the ' + strongest.direction + ' in ' + strongest.column + '?',
          'Is this trend sustainable?',
          'Should I be concerned about the decreasing metrics?'
        ]
      };
    }
  }

  if (questionLower.includes('anomaly') || questionLower.includes('unusual') || questionLower.includes('outlier') || questionLower.includes('strange') || questionLower.includes('abnormal') || questionLower.includes('exceptional')) {
    if (anomalies.length > 0) {
      const sortedAnomalies = [...anomalies].sort(function(a, b) { return parseFloat(a.deviation) - parseFloat(b.deviation); });
      const mostSignificant = sortedAnomalies[sortedAnomalies.length - 1];
      const columnStats = getColumnStats(mostSignificant.column);
      
      let answer = 'Found ' + anomalies.length + ' unusual data point(s) in your ' + domainInfo.label.toLowerCase() + ':\n\n';
      answer += 'Most Significant Anomaly:\n';
      answer += '• Column: ' + mostSignificant.column + '\n';
      answer += '• Row: ' + mostSignificant.row + '\n';
      answer += '• Value: ' + formatNumber(mostSignificant.value) + '\n';
      answer += '• Deviation: ' + mostSignificant.deviation + ' from average\n\n';
      answer += 'This means the value in row ' + mostSignificant.row + ' is unusually ' + mostSignificant.type + ' compared to typical ' + (domainInfo.metrics[0] || 'values') + ' in this ' + domainInfo.label.toLowerCase() + '. This could be a data entry issue, a special event, a genuine breakthrough, or an anomaly worth investigating within ' + domainInfo.context + '.';
      
      return {
        answer: answer,
        followUp: [
          'Should I investigate row ' + mostSignificant.row + '?',
          'Is this a data error or real value?',
          'How should I handle these anomalies?'
        ]
      };
    } else {
      return {
        answer: 'Great news! No significant anomalies were detected in your ' + domainInfo.label.toLowerCase() + '. All values fall within expected ranges based on statistical analysis. This suggests your data is consistent and reliable for ' + domainInfo.context + '.',
        followUp: [
          'How are anomalies detected?',
          'What if I expect unusual values?',
          'Can I set custom thresholds?'
        ]
      };
    }
  }

  if (questionLower.includes('growth') || questionLower.includes('growth rate') || questionLower.includes('increase') || questionLower.includes('decrease') || questionLower.includes('change') || questionLower.includes('change over')) {
    const growing = trends.filter(function(t) { return t.direction === 'increasing'; });
    const declining = trends.filter(function(t) { return t.direction === 'decreasing'; });
    
    if (growing.length > 0 || declining.length > 0) {
      const fastestGrowing = growing.length > 0 ? growing.reduce(function(max, t) { return t.change > max.change ? t : max; }, growing[0]) : null;
      const fastestDeclining = declining.length > 0 ? declining.reduce(function(min, t) { return t.change < min.change ? t : min; }, declining[0]) : null;
      
      let answer = 'Growth Analysis for your ' + domainInfo.label.toLowerCase() + ':\n\n';
      
      if (growing.length > 0) {
        answer += 'Growing ' + (domainInfo.metrics[0] || 'Metrics') + ' (' + growing.length + '):\n';
        growing.slice(0, 3).forEach(function(g) {
          answer += '• ' + g.column + ': +' + formatPercent(g.change) + ' (' + (g.strength * 100).toFixed(0) + '% confidence)\n';
        });
      }
      
      if (declining.length > 0) {
        answer += '\nDeclining ' + (domainInfo.metrics[0] || 'Metrics') + ' (' + declining.length + '):\n';
        declining.slice(0, 3).forEach(function(d) {
          answer += '• ' + d.column + ': ' + formatPercent(d.change) + ' (' + (d.strength * 100).toFixed(0) + '% confidence)\n';
        });
      }
      
      answer += '\n';
      
      if (fastestGrowing) {
        answer += 'Fastest Growing: "' + fastestGrowing.column + '" at +' + formatPercent(fastestGrowing.change) + '\n';
      }
      if (fastestDeclining) {
        answer += 'Fastest Declining: "' + fastestDeclining.column + '" at ' + formatPercent(fastestDeclining.change) + '\n';
      }
      
      answer += '\n';
      
      if (declining.length > growing.length) {
        answer += 'More ' + (domainInfo.metrics[0] || 'metrics') + ' are declining than growing, which may indicate challenges in ' + domainInfo.context + ' that need attention.';
      } else if (growing.length > declining.length) {
        answer += 'More ' + (domainInfo.metrics[0] || 'metrics') + ' are showing positive growth, indicating positive momentum in ' + domainInfo.context + '.';
      } else {
        answer += 'Growth and decline are balanced, suggesting stable patterns in ' + domainInfo.context + '.';
      }
      
      return {
        answer: answer,
        followUp: [
          'What caused ' + (fastestGrowing ? fastestGrowing.column : 'growth') + ' to grow so fast?',
          'Why is ' + (fastestDeclining ? fastestDeclining.column : 'decline') + ' declining?',
          'How can I improve the declining ' + (domainInfo.metrics[0] || 'metrics') + '?'
        ]
      };
    }
  }

  if (questionLower.includes('compare') || questionLower.includes('comparison') || questionLower.includes('vs') || questionLower.includes('versus') || questionLower.includes('difference between')) {
    const parts = questionLower.split(/\s+(?:vs|versus|compared?|and)\s+/i);
    const column1 = findRelevantColumn(parts[0] ? parts[0].split(/\s+/) : []);
    const column2 = findRelevantColumn(parts[1] ? parts[1].split(/\s+/) : []);
    
    if (column1 && column2) {
      const stats1 = getColumnStats(column1) ? getColumnStats(column1).stats : null;
      const stats2 = getColumnStats(column2) ? getColumnStats(column2).stats : null;
      
      let answer = 'Comparison: "' + column1 + '" vs "' + column2 + '" in your ' + domainInfo.label.toLowerCase() + '\n\n';
      answer += '"' + column1 + '":\n';
      answer += '• Average: ' + formatNumber(stats1 ? stats1.average : 0) + '\n';
      answer += '• Total: ' + formatNumber(stats1 ? stats1.sum : 0) + '\n';
      answer += '• Range: ' + formatNumber(stats1 ? stats1.min : 0) + ' - ' + formatNumber(stats1 ? stats1.max : 0) + '\n\n';
      answer += '"' + column2 + '":\n';
      answer += '• Average: ' + formatNumber(stats2 ? stats2.average : 0) + '\n';
      answer += '• Total: ' + formatNumber(stats2 ? stats2.sum : 0) + '\n';
      answer += '• Range: ' + formatNumber(stats2 ? stats2.min : 0) + ' - ' + formatNumber(stats2 ? stats2.max : 0) + '\n\n';
      
      if (stats1 && stats2 && stats1.average && stats2.average) {
        const ratio = (stats1.average / stats2.average).toFixed(2);
        answer += '"' + column1 + '" is ' + ratio + 'x "' + column2 + '" on average in ' + domainInfo.context + '.';
      }
      
      return {
        answer: answer,
        followUp: [
          'Why is ' + column1 + ' higher than ' + column2 + '?',
          'Should these metrics be related?',
          'What factors affect both metrics?'
        ]
      };
    } else {
      const allStats = numericHeaders.slice(0, 5).map(function(h) {
        return {
          column: h,
          stats: getColumnStats(h) ? getColumnStats(h).stats : null
        };
      }).filter(function(s) { return s.stats; });
      
      let answer = 'Quick comparison of your key ' + (domainInfo.metrics[0] || 'metrics') + ' in ' + domainInfo.label.toLowerCase() + ':\n\n';
      allStats.forEach(function(s) {
        answer += '"' + s.column + '":\n';
        answer += '• Average: ' + formatNumber(s.stats ? s.stats.average : 0) + '\n';
        answer += '• Total: ' + formatNumber(s.stats ? s.stats.sum : 0) + '\n';
        answer += '• Range: ' + formatNumber(s.stats ? s.stats.min : 0) + ' - ' + formatNumber(s.stats ? s.stats.max : 0) + '\n\n';
      });
      
      return {
        answer: answer,
        followUp: [
          'Which ' + (domainInfo.metrics[0] || 'metric') + ' is most important?',
          'How do these relate to each other?',
          'What benchmarks should I use?'
        ]
      };
    }
  }

  if (questionLower.includes('what is') || questionLower.includes('what are') || questionLower.includes('tell me about') || questionLower.includes('overview of') || questionLower.includes('summary of')) {
    const relevantColumn = findRelevantColumn(numericHeaders.map(function(h) { return h.toLowerCase(); }));
    
    if (relevantColumn) {
      const columnStats = getColumnStats(relevantColumn);
      const trend = getTrendDetails(relevantColumn);
      const columnAnomalies = getAnomalyDetails(relevantColumn);
      const values = getColumnValues(relevantColumn);
      
      let answer = '"' + relevantColumn + '" Analysis in your ' + domainInfo.label.toLowerCase() + ':\n\n';
      answer += 'Statistics:\n';
      answer += '• Total: ' + formatNumber(columnStats ? columnStats.stats.sum : 0) + '\n';
      answer += '• Average: ' + formatNumber(columnStats ? columnStats.stats.average : 0) + '\n';
      answer += '• Median: ' + formatNumber(columnStats ? columnStats.stats.median : 0) + '\n';
      answer += '• Minimum: ' + formatNumber(columnStats ? columnStats.stats.min : 0) + '\n';
      answer += '• Maximum: ' + formatNumber(columnStats ? columnStats.stats.max : 0) + '\n\n';
      
      answer += 'Trend: ';
      if (trend) {
        answer += trend.direction + ' by ' + formatPercent(Math.abs(trend.change)) + ' (' + (trend.strength * 100).toFixed(0) + '% confidence)\n';
      } else {
        answer += 'Stable - no significant trend detected\n';
      }
      
      answer += '\nAnomalies: ' + columnAnomalies.length + ' unusual data point(s) found\n';
      answer += '\nData Points: ' + values.length + ' records across ' + data.length + ' rows in ' + domainInfo.context;
      
      return {
        answer: answer,
        followUp: [
          'How has ' + relevantColumn + ' changed over time?',
          'What affects ' + relevantColumn + '?',
          'Is this a good or bad ' + relevantColumn + ' for ' + domainInfo.context + '?'
        ]
      };
    }
  }

  if (questionLower.includes('recommend') || questionLower.includes('suggest') || questionLower.includes('should i') || questionLower.includes('action') || questionLower.includes('what to do') || questionLower.includes('advice') || questionLower.includes('next step')) {
    const warnings = generateWhatToWatch(stats, trends, anomalies, domainInfo);
    const findings = generateKeyFindings(data, headers, stats, trends, anomalies, domainInfo);
    
    const recommendations = [];
    const verb = domainInfo.verbs[0] || 'measured';
    
    const declining = trends.filter(function(t) { return t.direction === 'decreasing'; });
    if (declining.length > 0) {
      recommendations.push('Address Declining ' + (domainInfo.metrics[0] || 'Metrics') + ': ' + declining.length + ' ' + (domainInfo.metrics[0] || 'metric') + '(s) are showing decline, including "' + declining[0].column + '" (' + formatPercent(declining[0].change) + '). Investigate root causes in ' + domainInfo.context + '.');
    }
    
    const volatile = trends.filter(function(t) { return t.volatility > 20; });
    if (volatile.length > 0) {
      recommendations.push('Reduce Volatility: "' + volatile[0].column + '" shows ' + volatile[0].volatility + '% volatility. Consider smoothing techniques or identify causes of fluctuation in ' + domainInfo.context + '.');
    }
    
    if (anomalies.length > 0) {
      const anomalyRows = anomalies.slice(0, 3).map(function(a) { return a.row; }).join(', ');
      recommendations.push('Investigate Anomalies: ' + anomalies.length + ' unusual data point(s) detected. Review rows ' + anomalyRows + ' for data quality or special events within ' + domainInfo.context + '.');
    }
    
    const positive = findings.filter(function(f) { return f.type === 'positive'; });
    if (positive.length > 0) {
      recommendations.push('Leverage Success: ' + positive[0].title + '. Build on this momentum in ' + domainInfo.context + '.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Data Looks Good: No critical issues detected in ' + domainInfo.context + '. Continue monitoring trends and ' + (domainInfo.metrics[0] || 'metrics') + '.');
    }
    
    let answer = 'Recommendations for your ' + domainInfo.label.toLowerCase() + ':\n\n';
    recommendations.forEach(function(rec) {
      answer += '• ' + rec + '\n\n';
    });
    
    return {
      answer: answer,
      followUp: [
        'How can I improve the declining ' + (domainInfo.metrics[0] || 'metrics') + '?',
        'What tools can help me monitor this?',
        'How often should I review this ' + domainInfo.label.toLowerCase() + '?'
      ]
    };
  }

  if (questionLower.includes('benchmark') || questionLower.includes('industry') || questionLower.includes('standard') || questionLower.includes('normal') || questionLower.includes('typical')) {
    const context = generateContext(stats, trends, dataType);
    
    let answer = 'Benchmarks and context for your ' + domainInfo.label.toLowerCase() + ':\n\n';
    context.forEach(function(c) {
      answer += c.title + ': ' + c.description + '\n\n';
    });
    
    return {
      answer: answer,
      followUp: [
        'How do I compare to industry standards?',
        'What are typical values for ' + domainInfo.context + '?',
        'How can I improve my benchmarks?'
      ]
    };
  }

  let answer = 'I\'d be happy to help you analyze your ' + domainInfo.label.toLowerCase() + '! Based on your ' + data.length + ' records and ' + headers.length + ' columns covering ' + domainInfo.context + ', here are some things I can help you understand:\n\n';
  answer += 'Key ' + (domainInfo.metrics[0] || 'Metrics') + ' Available:\n';
  numericHeaders.slice(0, 5).forEach(function(h, i) {
    answer += (i + 1) + '. ' + h + '\n';
  });
  answer += '\nWhat I Can Help You Understand:\n';
  answer += '• Questions about specific ' + (domainInfo.metrics[0] || 'values') + ', averages, and totals\n';
  answer += '• Trend analysis and growth patterns\n';
  answer += '• Anomaly detection and unusual data points\n';
  answer += '• Comparisons between different ' + (domainInfo.metrics[0] || 'metrics') + '\n';
  answer += '• Recommendations based on your ' + domainInfo.label.toLowerCase() + '\n\n';
  answer += 'Try asking:\n';
  answer += '• "What is the total [metric]?"\n';
  answer += '• "Why is [column] so high/low?"\n';
  answer += '• "What trends exist in my data?"\n';
  answer += '• "Are there any anomalies?"\n';
  answer += '• "Compare [metric1] and [metric2]"\n';
  answer += '• "What should I do about my data?"\n';
  answer += '• "How does this compare to industry standards?"';

  return {
    answer: answer,
    followUp: [
      'What is the total across all metrics?',
      'What trends exist in my ' + domainInfo.label.toLowerCase() + '?',
      'Are there any anomalies I should know about?',
      'What recommendations do you have for ' + domainInfo.context + '?'
    ]
  };
}
