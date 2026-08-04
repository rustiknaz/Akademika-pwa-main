import { useState } from "react";
import { useCreateMessage } from "@/hooks/use-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2 } from "lucide-react";

export function CreateMessage() {
  const [content, setContent] = useState("");
  const createMessage = useCreateMessage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    createMessage.mutate(
      { content },
      {
        onSuccess: () => setContent(""),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mt-8 max-w-lg mx-auto w-full group">
      <div className="relative flex-1">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          disabled={createMessage.isPending}
          className="h-12 px-4 bg-background border-border transition-all duration-300 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary rounded-btn font-mono text-sm shadow-sm"
        />
      </div>
      <Button 
        type="submit" 
        disabled={createMessage.isPending || !content.trim()}
        className="h-12 px-6 rounded-btn font-bold transition-all active:scale-95 disabled:opacity-50"
      >
        {createMessage.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            Post <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </form>
  );
}
