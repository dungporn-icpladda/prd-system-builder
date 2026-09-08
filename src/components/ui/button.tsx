import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-extrabold cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_14px_32px_rgb(120_53_15_/_0.22)] hover:bg-[#431407] hover:shadow-[0_18px_40px_rgb(120_53_15_/_0.28)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_8px_24px_rgb(239_68_68_/_0.2)] hover:bg-[#dc2626]",
        outline:
          "border-2 border-primary/20 bg-surface text-primary shadow-[0_10px_24px_rgb(120_53_15_/_0.08)] hover:border-primary/50 hover:bg-muted hover:text-primary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_10px_24px_rgb(251_146_60_/_0.16)] hover:bg-[#fdba74]",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-9 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
