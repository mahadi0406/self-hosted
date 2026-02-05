import * as React from "react"
import {Slot} from "@radix-ui/react-slot"
import {cva} from "class-variance-authority"
import {cn} from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-foreground text-background hover:bg-foreground/90",
                destructive:
                    "bg-red-500 text-white hover:bg-red-600",
                outline:
                    "border border-border/50 bg-white dark:bg-[#111113] hover:bg-muted",
                secondary:
                    "bg-muted text-foreground hover:bg-muted/80",
                ghost:
                    "hover:bg-muted",
                link:
                    "text-foreground underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8 px-3 text-xs",
                lg: "h-11 px-6",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(({className, variant, size, asChild = false, ...props}, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
        <Comp
            className={cn(buttonVariants({variant, size, className}))}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export {Button, buttonVariants}
