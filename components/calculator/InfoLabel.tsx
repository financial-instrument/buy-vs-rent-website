"use client";
import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { lookup } from "@/lib/glossary";

interface InfoLabelProps {
  text: string;
  glossaryId?: string; // when set, renders an info icon with hover/focus tooltip
  className?: string;
}

export function InfoLabel({ text, glossaryId, className }: InfoLabelProps) {
  const entry = glossaryId ? lookup(glossaryId) : undefined;
  if (!entry) {
    return <Label className={className ?? "text-xs text-muted-foreground"}>{text}</Label>;
  }
  return (
    <div className="flex items-center gap-1">
      <Label className={className ?? "text-xs text-muted-foreground"}>{text}</Label>
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={`What is ${entry.term}?`}
              className="inline-flex h-3.5 w-3.5 items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring rounded"
            >
              <Info className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="font-semibold">{entry.term}</div>
            <div className="mt-1 leading-snug">{entry.body}</div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
