import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-extrabold transition-colors focus:outline-none focus:ring-4 focus:ring-ring/20 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-[0_10px_24px_rgb(120_53_15_/_0.18)] hover:bg-[#431407]",
        secondary:
          "border-transparent bg-success text-success-foreground shadow-[0_8px_24px_rgb(34_197_94_/_0.18)] hover:bg-[#16a34a]",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-[0_8px_24px_rgb(239_68_68_/_0.2)] hover:bg-[#dc2626]",
        outline: "border-primary/15 bg-surface text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
