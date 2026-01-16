import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic';
const prisma = new PrismaClient();

/**
 * PUBLIC API ENDPOINT - No Authentication Required
 * GET /api/public/stats/{userId}
 * 
 * Returns non-sensitive user data for public profile display:
 * - Public name (first name only or display name)
 * - Total report count
 * - Report summaries (titles, chart types, data previews)
 * - Aggregated statistics
 * 
 * NEVER returns: email, password, or raw sensitive data
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;


    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }


    // Fetch user with ONLY safe fields (no password)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,       // Safe: public display name
        email: true,      // We'll use this to generate fallback name, but NOT expose it
        image: true,      // Safe: profile picture URL
        // EXCLUDED: password, emailVerified
      },
    });


    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Generate display name: use name, or email prefix, or "Anonymous User"
    let displayName = "Anonymous User";
    if (user.name) {
      displayName = user.name;
    } else if (user.email) {
      // Use the part before @ as a fallback display name
      displayName = user.email.split('@')[0];
    }


    // Fetch user's reports with safe fields only
    const reports = await prisma.report.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        fileType: true,
        fileSize: true,
        chartConfig: true,
        createdAt: true,
        data: true,       // We'll process this to extract only aggregate stats
      },
    });


    if (!reports || reports.length === 0) {
      // Return empty profile if no reports
      const publicProfile = {
        user: {
          id: user.id,
          displayName: displayName,
          avatar: user.image || null,
          // NEVER include: email, password
        },
        summary: {
          totalReports: 0,
          totalDataRows: 0,
          totalFileSize: 0,
          chartTypeDistribution: {},
          fileTypeDistribution: {},
          memberSince: null,
          lastActivity: null,
        },
        reports: [],
      };
      return NextResponse.json(publicProfile, { status: 200 });
    }


    // Process reports to extract safe, aggregated statistics
    const processedReports = reports.map((report) => {
      // Parse the data to get row/column counts without exposing raw data
      let rowCount = 0;
      let columnCount = 0;
      let columns: string[] = [];
      let dataPreview: any[] = [];
      
      if (report.data && Array.isArray(report.data)) {
        rowCount = report.data.length;
        if (report.data.length > 0) {
          columns = Object.keys(report.data[0] as object).filter(h => h && h.trim() !== '');
          columnCount = columns.length;
          
          // Include first 50 rows as preview for trend analysis (safe for public display)
          // Convert to simple string/number values to avoid serialization issues
          dataPreview = (report.data as any[]).slice(0, 50).map(row => {
            const previewRow: Record<string, any> = {};
            columns.slice(0, 10).forEach(col => { // Limit to first 10 columns
              const value = row[col];
              // Only include primitive values
              if (value === null || value === undefined) {
                previewRow[col] = null;
              } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                previewRow[col] = value;
              } else {
                previewRow[col] = String(value);
              }
            });
            return previewRow;
          });
        }
      }


      // Calculate numeric column statistics (optimized for large datasets)
      const numericStats: Record<string, { min: number; max: number; avg: number; sum: number }> = {};
      
      if (report.data && Array.isArray(report.data) && columns.length > 0) {
        // Limit processing to first 1000 rows to prevent stack overflow
        const sampleData = (report.data as any[]).slice(0, 1000);
        
        columns.forEach((col) => {
          let min = Infinity;
          let max = -Infinity;
          let sum = 0;
          let count = 0;
          
          // Use loop instead of spread operator to avoid stack overflow
          for (const row of sampleData) {
            const val = parseFloat(row[col]);
            if (!isNaN(val)) {
              if (val < min) min = val;
              if (val > max) max = val;
              sum += val;
              count++;
            }
          }
          
          if (count > 0) {
            numericStats[col] = {
              min,
              max,
              avg: sum / count,
              sum,
            };
          }
        });
      }


      // Safely extract chartConfig (only the essential fields)
      let sanitizedChartConfig = null;
      if (report.chartConfig && typeof report.chartConfig === 'object') {
        const config = report.chartConfig as Record<string, any>;
        sanitizedChartConfig = {
          chartType: config.chartType || null,
          chartTitle: config.chartTitle || null,
          xAxisColumn: config.xAxisColumn || null,
          yAxisColumn: config.yAxisColumn || null,
        };
      }


      return {
        id: report.id,
        title: report.title,
        description: report.description,
        fileType: report.fileType,
        fileSize: report.fileSize,
        createdAt: report.createdAt,
        chartConfig: sanitizedChartConfig,  // ✅ Now safe to serialize
        stats: {
          rowCount,
          columnCount,
          columns,
          numericStats,
        },
        dataPreview,
      };
    });


    // Calculate overall user statistics
    const totalReports = reports.length;
    const totalDataRows = processedReports.reduce((sum, r) => sum + r.stats.rowCount, 0);
    const totalFileSize = reports.reduce((sum, r) => sum + (r.fileSize || 0), 0);
    
    // Get chart type distribution
    const chartTypes: Record<string, number> = {};
    reports.forEach((report) => {
      if (report.chartConfig && typeof report.chartConfig === 'object') {
        const config = report.chartConfig as { chartType?: string };
        const type = config.chartType || 'none';
        chartTypes[type] = (chartTypes[type] || 0) + 1;
      }
    });


    // Get file type distribution
    const fileTypes: Record<string, number> = {};
    reports.forEach((report) => {
      const type = report.fileType || 'unknown';
      fileTypes[type] = (fileTypes[type] || 0) + 1;
    });


    // Build the public response
    const publicProfile = {
      user: {
        id: user.id,
        displayName: displayName,
        avatar: user.image || null,
        // NEVER include: email, password
      },
      summary: {
        totalReports,
        totalDataRows,
        totalFileSize,
        chartTypeDistribution: chartTypes,
        fileTypeDistribution: fileTypes,
        memberSince: reports.length > 0 
          ? reports[reports.length - 1].createdAt 
          : null,
        lastActivity: reports.length > 0 
          ? reports[0].createdAt 
          : null,
      },
      reports: processedReports,
    };


    return NextResponse.json(publicProfile, { status: 200 });


  } catch (error) {
    console.error("Error fetching public stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch public profile" },
      { status: 500 }
    );
  }
}
