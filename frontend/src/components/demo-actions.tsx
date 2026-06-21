"use client";

import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DemoFillButton({
  onClick,
  label = "Fill demo values",
  className,
  disabled,
}: {
  onClick: () => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={onClick}
      className={cn("gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 hover:text-amber-100", className)}
    >
      <Wand2 className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
