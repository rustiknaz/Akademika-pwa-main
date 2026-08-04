import { useMessages } from "@/hooks/use-messages";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export function MessageList() {
  const { data: messages, isLoading, error } = useMessages();

  if (isLoading) {
    return (
      <div className="grid gap-4 mt-12 max-w-5xl mx-auto w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-inner bg-muted/50" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12 text-center text-destructive bg-destructive/10 py-4 px-6 rounded-control max-w-lg mx-auto">
        Failed to load messages. Please try again.
      </div>
    );
  }

  if (!messages?.length) {
    return (
      <div className="mt-12 text-center text-muted-foreground font-mono text-sm bg-muted/30 py-12 rounded-inner border border-dashed border-border max-w-2xl mx-auto">
        No messages yet. Be the first to post!
      </div>
    );
  }

  return (
    <div className="grid gap-4 mt-12 max-w-5xl mx-auto w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {messages.map((msg) => (
        <Card 
          key={msg.id} 
          className="group relative overflow-hidden glass-card p-6 flex flex-col justify-between h-full min-h-[140px]"
        >
          <p className="text-foreground leading-relaxed text-balance">
            {msg.content}
          </p>
          <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>#{msg.id}</span>
            <span>
              {msg.createdAt && formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          {/* Subtle gradient accent on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </Card>
      ))}
    </div>
  );
}
