import { useState } from "react";
import { Comment, User } from "@/lib/types";
import { mockApi } from "@/lib/mock-api";
import { permissions, getInitials, formatTime } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface CommentThreadProps {
  comment: Comment;
  quotationId: string;
  currentUser: User;
  level?: number;
}

export const CommentThread = ({
  comment,
  quotationId,
  currentUser,
  level = 0,
}: CommentThreadProps) => {
  const { toast } = useToast();
  const [showReplies, setShowReplies] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(
    comment._repliesLoaded || false,
  );
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [newReply, setNewReply] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const canReply = permissions.canAddReply(currentUser.role);
  const replies = comment.replies || [];

  const handleToggleReplies = async () => {
    if (!showReplies && !repliesLoaded) {
      setIsLoadingReplies(true);
      try {
        await mockApi.loadReplies(comment.id, quotationId);
        setRepliesLoaded(true);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load replies",
          variant: "destructive",
        });
      } finally {
        setIsLoadingReplies(false);
      }
    }
    setShowReplies(!showReplies);
  };

  const handleAddReply = async () => {
    if (!newReply.trim()) return;

    setIsSubmittingReply(true);
    try {
      await mockApi.addReply(
        comment.id,
        quotationId,
        currentUser.name,
        currentUser.role,
        newReply,
      );
      setNewReply("");
      setRepliesLoaded(false);
      toast({
        title: "Success",
        description: "Reply added",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const visibleReplies = replies.filter((reply) =>
    permissions.canViewReply(reply.role, currentUser.role),
  );

  return (
    <div className={`${level > 0 ? "ml-8" : ""}`}>
      {/* Comment */}
      <div className="flex gap-3 pb-4">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="text-xs">
            {getInitials(comment.author)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-medium text-sm">{comment.author}</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded">
              {comment.role === "manager"
                ? "Manager"
                : comment.role === "sales_rep"
                  ? "Sales Rep"
                  : "Viewer"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(comment.timestamp)}
            </span>
          </div>
          <p className="text-sm text-foreground break-words">{comment.text}</p>

          {/* Reply action */}
          {canReply && level < 2 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-auto p-0 text-xs text-primary hover:underline"
              onClick={() => setShowReplies(true)}
            >
              Reply
            </Button>
          )}
        </div>
      </div>

      {/* Show replies count if any */}
      {replies.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="ml-11 mb-2 h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleToggleReplies}
        >
          {showReplies ? (
            <>
              <ChevronUp className="w-3 h-3 mr-1" />
              Hide replies ({visibleReplies.length})
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 mr-1" />
              View replies ({visibleReplies.length})
            </>
          )}
          {isLoadingReplies && (
            <Loader2 className="w-3 h-3 ml-1 animate-spin" />
          )}
        </Button>
      )}

      {/* Replies */}
      {showReplies && repliesLoaded && (
        <div className="space-y-4 mt-4 ml-4 pl-4 border-l border-border">
          {/* Visible replies */}
          {visibleReplies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="text-xs">
                  {getInitials(reply.author)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-medium text-sm">{reply.author}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">
                    {reply.role === "manager"
                      ? "Manager"
                      : reply.role === "sales_rep"
                        ? "Sales Rep"
                        : "Viewer"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(reply.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-foreground break-words">
                  {reply.text}
                </p>
              </div>
            </div>
          ))}

          {/* No visible replies message */}
          {visibleReplies.length === 0 && replies.length > 0 && (
            <p className="text-xs text-muted-foreground italic">
              Replies are only visible to users with the same role
            </p>
          )}

          {/* Add reply form */}
          {canReply && level < 2 && (
            <div className="mt-4 pt-4 border-t border-border">
              <Textarea
                placeholder="Write a reply..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                className="mb-2 text-sm"
                rows={2}
                disabled={isSubmittingReply}
              />
              <Button
                size="sm"
                onClick={handleAddReply}
                disabled={!newReply.trim() || isSubmittingReply}
              >
                {isSubmittingReply ? "Saving..." : "Save Reply"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
