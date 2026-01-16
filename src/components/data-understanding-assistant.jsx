"use client";

import { useState, useEffect, useCallback } from "react";
import {
  analyzeDataType,
  calculateBasicStats,
  detectAnomalies,
  detectTrends,
  generateSummary,
  generateKeyFindings,
  generateWhatToWatch,
  generateContext,
  answerQuestion,
} from "@/lib/data-analysis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Eye,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export function DataUnderstandingAssistant({ data, headers, reportId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dataType, setDataType] = useState(null);
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState([]);
  const [trends, setTrends] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [findings, setFindings] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [context, setContext] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    if (data && headers && headers.length > 0) {
      analyzeData();
    }
  }, [data, headers]);

  const analyzeData = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      const detectedType = analyzeDataType(data, headers);
      setDataType(detectedType);

      const calculatedStats = calculateBasicStats(data, headers);
      setStats(calculatedStats);

      const detectedTrends = detectTrends(data, headers);
      setTrends(detectedTrends);

      const detectedAnomalies = detectAnomalies(data, headers);
      setAnomalies(detectedAnomalies);

      const dataSummary = generateSummary(data, headers, detectedType, calculatedStats);
      setSummary(dataSummary);

      const keyFindings = generateKeyFindings(
        data,
        headers,
        calculatedStats,
        detectedTrends,
        detectedAnomalies,
        detectedType
      );
      setFindings(keyFindings);

      const watchItems = generateWhatToWatch(
        calculatedStats,
        detectedTrends,
        detectedAnomalies,
        detectedType
      );
      setWarnings(watchItems);

      const dataContext = generateContext(calculatedStats, detectedTrends, detectedType);
      setContext(dataContext);
    } catch (error) {
      console.error("Error analyzing data:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [data, headers]);

  const handleAskQuestion = useCallback(async () => {
    if (!question.trim()) return;

    setIsAsking(true);

    try {
      const response = answerQuestion(question, data, headers, stats, trends, anomalies, dataType);
      setAnswer(response);
    } catch (error) {
      console.error("Error answering question:", error);
      setAnswer({
        answer: "I'm having trouble answering that question right now. Please try asking about trends, averages, totals, or specific values in your data.",
        followUp: [
          "What is the total?",
          "What trends exist?",
          "Are there any anomalies?"
        ]
      });
    } finally {
      setIsAsking(false);
    }
  }, [question, data, headers, stats, trends, anomalies, dataType]);

  const getTrendIcon = (direction) => {
    switch (direction) {
      case "increasing":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "decreasing":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "volatile":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFindingColor = (type) => {
    switch (type) {
      case "positive":
        return "green";
      case "negative":
        return "red";
      case "warning":
        return "orange";
      default:
        return "blue";
    }
  };

  const getColorClass = (color) => {
    switch (color) {
      case "green":
        return "text-green-600 bg-green-50 border-green-200";
      case "red":
        return "text-red-600 bg-red-50 border-red-200";
      case "orange":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "blue":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getContextStatusColor = (status) => {
    switch (status) {
      case "above":
        return "text-green-600";
      case "below":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (isAnalyzing) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8">
        <div className="flex items-center justify-center space-x-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <div>
            <p className="text-lg font-semibold text-blue-900">Analyzing your data...</p>
            <p className="text-sm text-blue-700">This may take a few moments</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Data Understanding Assistant</h2>
                <p className="text-blue-100 text-sm">
                  AI-powered insights to help you understand your data
                </p>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-white/20">
                {isOpen ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show Details
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <div className="mt-6 space-y-6">
            {dataType && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data Type Detected</p>
                    <p className="font-semibold text-gray-900">{dataType.label}</p>
                  </div>
                </div>
                <p className="text-gray-600">{dataType.description}</p>
              </div>
            )}

            {summary && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      What This Means
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{summary}</p>
                  </div>
                </div>
              </div>
            )}

            {findings.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Key Findings
                    </h3>
                    <div className="space-y-3">
                      {findings.map((finding, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${getColorClass(
                            getFindingColor(finding.type)
                          )}`}
                        >
                          <div className="flex items-start space-x-3">
                            {finding.icon === "TrendingUp" && (
                              <TrendingUp className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            )}
                            {finding.icon === "TrendingDown" && (
                              <TrendingDown className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            )}
                            {finding.icon === "AlertTriangle" && (
                              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            )}
                            {finding.icon === "CheckCircle" && (
                              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            )}
                            {(finding.icon === "BarChart" || finding.icon === "Activity") && (
                              <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-medium">{finding.title}</p>
                              <p className="text-sm opacity-90 mt-1">
                                {finding.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      What to Watch
                    </h3>
                    <div className="space-y-4">
                      {warnings.map((warning, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-orange-400 pl-4 py-2"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                warning.severity === "high"
                                  ? "bg-red-100 text-red-700"
                                  : warning.severity === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {warning.severity.toUpperCase()}
                            </span>
                            <span className="font-medium text-gray-900">
                              {warning.title}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{warning.description}</p>
                          <p className="text-gray-500 text-sm mt-2 italic">
                            {warning.action}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {context.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Context & Benchmarks
                    </h3>
                    <div className="space-y-4">
                      {context.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${getContextStatusColor(item.status)}`}>
                              {item.benchmark}
                            </p>
                            <p className="text-xs text-gray-500 capitalize mt-1">
                              {item.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {trends.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Trend Analysis
                    </h3>
                    <div className="grid gap-3">
                      {trends.slice(0, 5).map((trend, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {getTrendIcon(trend.trend.direction)}
                            <span className="font-medium text-gray-900">
                              {trend.column}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span
                              className={`text-sm font-medium ${
                                trend.trend.direction === "increasing"
                                  ? "text-green-600"
                                  : trend.trend.direction === "decreasing"
                                  ? "text-red-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {trend.trend.direction === "increasing" ? "+" : ""}
                              {trend.trend.percentChange}%
                            </span>
                            <span className="text-xs text-gray-500 capitalize bg-gray-200 px-2 py-1 rounded">
                              {trend.volatility.rating}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {anomalies.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Anomalies Detected ({anomalies.length})
                    </h3>
                    <div className="space-y-3">
                      {anomalies.slice(0, 5).map((anomaly, index) => (
                        <div
                          key={index}
                          className="p-3 bg-red-50 rounded-lg border border-red-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {anomaly.column} (Row {anomaly.row})
                              </p>
                              <p className="text-sm text-gray-600">
                                Value: {anomaly.value.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                anomaly.type === "high"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}>
                                {anomaly.type === "high" ? "High" : "Low"}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {anomaly.deviation}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ask Questions About Your Data
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Type a question like "What is the total?", "What trends exist?", or "Are there any anomalies?"
                  </p>

                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ask a question..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAskQuestion()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAskQuestion}
                      disabled={isAsking || !question.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isAsking ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Ask
                        </>
                      )}
                    </Button>
                  </div>

                  {answer && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-indigo-200">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{answer.answer}</p>
                      {answer.followUp && answer.followUp.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-500 mb-2">
                            Suggested questions:
                          </p>
                          <div className="space-y-2">
                            {answer.followUp.map((q, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setQuestion(q);
                                  handleAskQuestion();
                                }}
                                className="block w-full text-left text-sm text-indigo-600 hover:text-indigo-700 py-2 px-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
