import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { mockApi } from "@/lib/mock-api";
import { Quotation, QuotationStatus, Comment } from "@/lib/types";
import {
  permissions,
  formatCurrency,
  formatDate,
  formatTime,
} from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TopBar } from "@/components/TopBar";
import { CommentThread } from "@/components/CommentThread";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";

const STATUS_COLORS: Record<QuotationStatus, string> = {
  Pending: "bg-[hsl(var(--status-pending))] text-white",
  Approved: "bg-[hsl(var(--status-approved))] text-white",
  Rejected: "bg-[hsl(var(--status-rejected))] text-white",
};

export default function QuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState("");
  const [editedAmount, setEditedAmount] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const loadQuotation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await mockApi.getQuotationById(id!);
        setQuotation(data);
        setEditedClient(data.client);
        setEditedAmount(data.amount.toString());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load quotation",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadQuotation();
  }, [id]);

  const handleSaveEdit = async () => {
    if (!quotation) return;

    try {
      const updated = await mockApi.updateQuotation(quotation.id, {
        client: editedClient,
        amount: parseFloat(editedAmount),
      });
      setQuotation(updated);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Quotation updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (newStatus: QuotationStatus) => {
    if (!quotation) return;

    try {
      const updated = await mockApi.updateQuotationStatus(
        quotation.id,
        newStatus,
      );
      setQuotation(updated);
      toast({
        title: "Success",
        description: `Quotation ${newStatus.toLowerCase()}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async () => {
    if (!quotation || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const comment = await mockApi.addComment(
        quotation.id,
        user!.name,
        user!.role,
        newComment,
      );
      setQuotation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [...prev.comments, comment],
        };
      });
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added",
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Error</h3>
              <p className="text-red-800 text-sm">
                {error || "Quotation not found"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canEdit = permissions.canEditFields(user?.role || "viewer");
  const canApproveReject = permissions.canApproveReject(user?.role || "viewer");
  const canComment = permissions.canAddComment(user?.role || "viewer");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[hsl(88,30%,40%)] opacity-90">
      <TopBar />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4 gap-2 hover:bg-primary/10 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quotations
        </Button>

        {/* Header */}
        <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl border border-border/50 p-8 mb-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {quotation.client}
              </h1>
              <p className="text-muted-foreground">{quotation.id}</p>
            </div>
            <Badge className={STATUS_COLORS[quotation.status]}>
              {quotation.status}
            </Badge>
          </div>

          {/* Edit mode */}
          {isEditing && canEdit ? (
            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Client Name
                </label>
                <Input
                  value={editedClient}
                  onChange={(e) => setEditedClient(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <Input
                  type="number"
                  value={editedAmount}
                  onChange={(e) => setEditedAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit}>Save</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-end justify-between pt-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(quotation.amount)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Last updated: {formatDate(quotation.last_updated)}
                </p>
              </div>
              {canEdit && (
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        {quotation.lineItems && quotation.lineItems.length > 0 && (
          <div className="bg-card rounded-2xl border border-border/50 p-6 mb-6 shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Line Items
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium">Description</th>
                    <th className="text-center py-2 font-medium">Qty</th>
                    <th className="text-center py-2 font-medium">Unit</th>
                    <th className="text-right py-2 font-medium">Rate</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-border">
                      <td className="py-2">{item.description}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-center py-2">{item.unit}</td>
                      <td className="text-right py-2">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="text-right py-2 font-medium">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(quotation.subtotal || quotation.tax || quotation.freight) && (
              <div className="mt-4 space-y-2 text-sm">
                {quotation.subtotal && (
                  <div className="flex justify-end gap-4">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(quotation.subtotal)}
                    </span>
                  </div>
                )}
                {quotation.tax && (
                  <div className="flex justify-end gap-4">
                    <span className="text-muted-foreground">Tax (18%):</span>
                    <span className="font-medium">
                      {formatCurrency(quotation.tax)}
                    </span>
                  </div>
                )}
                {quotation.freight && (
                  <div className="flex justify-end gap-4">
                    <span className="text-muted-foreground">Freight:</span>
                    <span className="font-medium">
                      {formatCurrency(quotation.freight)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Status actions */}
        {canApproveReject && quotation.status === "Pending" && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200 rounded-2xl p-6 mb-6 flex items-center justify-between shadow-md hover:shadow-lg transition-shadow">
            <div>
              <h3 className="font-bold text-blue-900">Action Required</h3>
              <p className="text-blue-800 text-sm">
                This quotation is pending your approval
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleStatusUpdate("Approved")}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition shadow-md"
              >
                Approve
              </Button>
              <Button
                onClick={() => handleStatusUpdate("Rejected")}
                variant="destructive"
                className="shadow-md hover:shadow-lg transition"
              >
                Reject
              </Button>
            </div>
          </div>
        )}

        {/* Comments section */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Activity & Comments
          </h2>

          {/* Add comment form */}
          {canComment && (
            <div className="mb-6 pb-6 border-b border-border">
              <label className="block text-sm font-medium mb-2">
                Add a comment
              </label>
              <Textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2"
                disabled={isSubmittingComment}
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmittingComment}
              >
                {isSubmittingComment ? "Saving..." : "Save Comment"}
              </Button>
            </div>
          )}

          {/* Comments list */}
          {quotation.comments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {quotation.comments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  quotationId={quotation.id}
                  currentUser={user!}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
