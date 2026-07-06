import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "[background:var(--gradient-primary)] text-white font-semibold rounded-md hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
        secondary:
          "bg-surface border border-border text-text font-medium rounded-md hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
        default:
          "bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground rounded-md focus-visible:ring-3 focus-visible:ring-ring/50",
        ghost:
          "hover:bg-muted hover:text-foreground rounded-md focus-visible:ring-3 focus-visible:ring-ring/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md focus-visible:ring-3 focus-visible:ring-ring/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-1.5 px-3 text-sm",
        sm:      "h-7 gap-1 px-2.5 text-sm",
        lg:      "h-10 gap-1.5 px-4 text-sm",
        cta:     "px-6 py-3.5 text-sm gap-2",
        idoso:   "px-8 py-4 text-lg min-h-[56px] gap-2",
        icon:    "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
