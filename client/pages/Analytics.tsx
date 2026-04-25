import { useState, useEffect } from "react";
import { mockApi } from "@/lib/mock-api";
import { Quotation, QuotationStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/auth-utils";
import { TopBar } from "@/components/TopBar";
import { BarChart, LineChart, PieChart } from "@/components/AnalyticsChart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Users,
  ArrowUpRight,
  Download,
} from "lucide-react";

interface MetricCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  color: string;
}

export default function Analytics() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await mockApi.getQuotations("", "", 1, 100);
        setQuotations(result.data);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculate metrics
  const totalQuotations = quotations.length;
  const totalAmount = quotations.reduce((sum, q) => sum + q.amount, 0);
  const approved = quotations.filter((q) => q.status === "Approved").length;
  const pending = quotations.filter((q) => q.status === "Pending").length;
  const rejected = quotations.filter((q) => q.status === "Rejected").length;

  const approvalRate =
    totalQuotations > 0 ? ((approved / totalQuotations) * 100).toFixed(1) : 0;
  const avgAmount =
    totalQuotations > 0 ? (totalAmount / totalQuotations).toFixed(0) : 0;

  // Chart data
  const statusChartData = [
    { label: "Approved", value: approved, color: "#588C3D" },
    { label: "Pending", value: pending, color: "#FFA726" },
    { label: "Rejected", value: rejected, color: "#EF5350" },
  ];

  const amountByStatus = [
    {
      label: "Approved",
      value: quotations
        .filter((q) => q.status === "Approved")
        .reduce((sum, q) => sum + q.amount, 0),
      color: "#588C3D",
    },
    {
      label: "Pending",
      value: quotations
        .filter((q) => q.status === "Pending")
        .reduce((sum, q) => sum + q.amount, 0),
      color: "#FFA726",
    },
    {
      label: "Rejected",
      value: quotations
        .filter((q) => q.status === "Rejected")
        .reduce((sum, q) => sum + q.amount, 0),
      color: "#EF5350",
    },
  ];

  // Trend data (simulated weekly data)
  const weeklyTrendData = [
    { label: "Week 1", value: 15 },
    { label: "Week 2", value: 22 },
    { label: "Week 3", value: 18 },
    { label: "Week 4", value: 25 },
    { label: "Week 5", value: 20 },
    { label: "Week 6", value: 28 },
  ];

  const metrics: MetricCard[] = [
    {
      label: "Total Quotations",
      value: totalQuotations,
      icon: <DollarSign className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      trend: { value: 12, direction: "up" },
    },
    {
      label: "Total Value",
      value: formatCurrency(totalAmount),
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      trend: { value: 8, direction: "up" },
    },
    {
      label: "Approval Rate",
      value: `${approvalRate}%`,
      icon: <CheckCircle className="w-6 h-6" />,
      color: "from-emerald-500 to-emerald-600",
      trend: { value: 5, direction: "up" },
    },
    {
      label: "Pending Items",
      value: pending,
      icon: <Clock className="w-6 h-6" />,
      color: "from-amber-500 to-amber-600",
      trend: { value: 3, direction: "down" },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[hsl(88,30%,40%)] opacity-90">
      <TopBar />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Real-time insights into your quotation pipeline
            </p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <Card
              key={index}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div
                className={`bg-gradient-to-br ${metric.color} p-6 text-white relative overflow-hidden`}
              >
                {/* Animated background element */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
                <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg backdrop-blur">
                      {metric.icon}
                    </div>
                    {metric.trend && (
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold ${
                          metric.trend.direction === "up"
                            ? "bg-green-500 bg-opacity-30 text-green-100"
                            : "bg-red-500 bg-opacity-30 text-red-100"
                        }`}
                      >
                        <ArrowUpRight
                          className={`w-3 h-3 ${
                            metric.trend.direction === "down"
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                        {metric.trend.value}%
                      </div>
                    )}
                  </div>
                  <p className="text-white text-opacity-90 text-sm font-medium mb-1">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <BarChart
              title="Quotations by Status"
              data={statusChartData}
              height={280}
              showValues
            />
          </Card>

          {/* Amount by Status */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <PieChart title="Total Value by Status" data={amountByStatus} />
          </Card>
        </div>

        {/* Weekly Trend */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <LineChart
            title="Weekly Quotation Trend"
            data={weeklyTrendData}
            height={300}
            showValues
          />
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">{approved}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatCurrency(amountByStatus[0].value)}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-3xl font-bold text-amber-600">{pending}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatCurrency(amountByStatus[1].value)}
                </p>
              </div>
              <Clock className="w-12 h-12 text-amber-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{rejected}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatCurrency(amountByStatus[2].value)}
                </p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Footer Stats */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Average Amount
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(parseInt(avgAmount as string))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Conversion Rate
              </p>
              <p className="text-2xl font-bold text-foreground">
                {approvalRate}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Total Clients
              </p>
              <p className="text-2xl font-bold text-foreground">
                {new Set(quotations.map((q) => q.client)).size}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
              <p className="text-2xl font-bold text-foreground">
                {((approved / Math.max(approved + rejected, 1)) * 100).toFixed(
                  1,
                )}
                %
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
