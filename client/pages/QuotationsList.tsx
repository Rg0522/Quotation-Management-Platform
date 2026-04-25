import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { mockApi } from "@/lib/mock-api";
import { Quotation, QuotationStatus, OptimisticUpdateState } from "@/lib/types";
import { permissions, formatCurrency, formatDate } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { TopBar } from "@/components/TopBar";
import { Loader2, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

const STATUS_COLORS: Record<QuotationStatus, string> = {
  Pending: "bg-[hsl(var(--status-pending))] text-white",
  Approved: "bg-[hsl(var(--status-approved))] text-white",
  Rejected: "bg-[hsl(var(--status-rejected))] text-white",
};

export default function QuotationsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const scrollPositionRef = useRef(0);

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Record<string, OptimisticUpdateState>
  >({});

  const search = searchParams.get("search") || "";
  const status = (searchParams.get("status") || "") as QuotationStatus | "";
  const page = parseInt(searchParams.get("page") || "1");
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    "/": () => {
      searchInputRef.current?.focus();
    },
  });

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        setSearchParams({ search: value, status: status || "", page: "1" });
      }, 300);
    },
    [status, setSearchParams],
  );

  // Load quotations
  useEffect(() => {
    const loadQuotations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await mockApi.getQuotations(
          search,
          status,
          page,
          pageSize,
        );
        setQuotations(result.data);
        setTotal(result.total);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load quotations",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadQuotations();
  }, [search, status, page]);

  // Preserve scroll position
  useEffect(() => {
    window.scrollTo(0, scrollPositionRef.current);
  }, [quotations]);

  const handleRowClick = (id: string) => {
    scrollPositionRef.current = window.scrollY;
    navigate(`/quotations/${id}`);
  };

  const handleStatusUpdate = async (
    quotationId: string,
    newStatus: QuotationStatus,
  ) => {
    const quotation = quotations.find((q) => q.id === quotationId);
    if (!quotation) return;

    const oldStatus = quotation.status;
    const updateId = `${quotationId}-${Date.now()}`;

    // Optimistic update
    setOptimisticUpdates((prev) => ({
      ...prev,
      [updateId]: { id: updateId, status: "pending", previousValue: oldStatus },
    }));

    setQuotations((prev) =>
      prev.map((q) => (q.id === quotationId ? { ...q, status: newStatus } : q)),
    );

    try {
      await mockApi.updateQuotationStatus(quotationId, newStatus);
      setOptimisticUpdates((prev) => ({
        ...prev,
        [updateId]: { id: updateId, status: "success" },
      }));
      toast({
        title: "Success",
        description: `Quotation ${newStatus.toLowerCase()}`,
      });
    } catch (err) {
      // Rollback
      setQuotations((prev) =>
        prev.map((q) =>
          q.id === quotationId ? { ...q, status: oldStatus } : q,
        ),
      );
      setOptimisticUpdates((prev) => ({
        ...prev,
        [updateId]: {
          id: updateId,
          status: "error",
          error: err instanceof Error ? err.message : "Failed to update",
        },
      }));
      toast({
        title: "Error",
        description: "Failed to update quotation status",
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[hsl(88,30%,40%)] opacity-90">
      <TopBar />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header with gradient background */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 p-8">
          {/* Animated background elements */}
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Quotations
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage and track all quotations in real-time
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 mb-6 space-y-4 shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Filters & Search
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <Input
                ref={searchInputRef}
                placeholder="Search by client or ID... (press / to focus)"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                value={status || "all"}
                onValueChange={(value) =>
                  setSearchParams({
                    search,
                    status: value === "all" ? "" : value,
                    page: "1",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchParams({ search: "", status: "", page: "1" });
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground mb-4">
          Showing {quotations.length > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
          {Math.min(page * pageSize, total)} of {total} quotations
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-900">Error</h3>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && quotations.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-muted rounded-lg p-12 inline-block">
              <p className="text-muted-foreground mb-2">No quotations found</p>
              <p className="text-sm text-muted-foreground">
                {search || status
                  ? "Try adjusting your filters"
                  : "Get started by creating your first quotation"}
              </p>
            </div>
          </div>
        )}

        {/* Table */}
        {!isLoading && quotations.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card shadow-md">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                  <th className="text-left py-4 px-6 font-bold text-foreground text-sm">
                    Client
                  </th>
                  <th className="text-left py-4 px-6 font-bold text-foreground text-sm">
                    Amount
                  </th>
                  <th className="text-left py-4 px-6 font-bold text-foreground text-sm">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-bold text-foreground text-sm">
                    Updated
                  </th>
                  {permissions.canApproveReject(user?.role || "viewer") && (
                    <th className="text-left py-4 px-6 font-bold text-foreground text-sm">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {quotations.map((quotation, idx) => (
                  <tr
                    key={quotation.id}
                    className="border-b border-border/30 hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent cursor-pointer transition-all group"
                    onClick={() => handleRowClick(quotation.id)}
                    style={{
                      animationDelay: `${idx * 50}ms`,
                    }}
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-primary transition">
                          {quotation.client}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {quotation.id}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-foreground font-bold text-lg">
                      {formatCurrency(quotation.amount)}
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        className={`${STATUS_COLORS[quotation.status]} shadow-md transition-transform group-hover:scale-105`}
                      >
                        {quotation.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">
                      {formatDate(quotation.last_updated)}
                    </td>
                    {permissions.canApproveReject(user?.role || "viewer") && (
                      <td
                        className="py-4 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex gap-2">
                          {quotation.status === "Pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  handleStatusUpdate(quotation.id, "Approved")
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleStatusUpdate(quotation.id, "Rejected")
                                }
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent border border-border/50">
            <div className="text-sm font-semibold text-foreground">
              Page <span className="text-primary font-bold">{page}</span> of{" "}
              <span className="text-primary font-bold">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!canGoPrevious}
                onClick={() =>
                  setSearchParams({ search, status, page: String(page - 1) })
                }
                className="hover:bg-primary hover:text-primary-foreground transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!canGoNext}
                onClick={() =>
                  setSearchParams({ search, status, page: String(page + 1) })
                }
                className="hover:bg-primary hover:text-primary-foreground transition"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
