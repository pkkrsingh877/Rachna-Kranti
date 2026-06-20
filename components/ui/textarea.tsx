import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground flex min-h-24 w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600/20",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
