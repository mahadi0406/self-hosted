import * as React from "react"
import {cva} from "class-variance-authority"
import {cn} from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
    {
        variants: {
            variant: {
                default:
                    "bg-foreground text-background",
                secondary:
                    "bg-muted text-foreground",
                destructive:
                    "bg-red-500 text-white",
                outline:
                    "border border-border/50 text-foreground",
                success:
                    "bg-emerald-500 text-white",
                warning:
                    "bg-amber-500 text-white",
                info:
                    "bg-blue-500 text-white",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

function Badge({className, variant, ...props}) {
    return (
        <div className={cn(badgeVariants({variant}), className)} {...props} />
    )
}

export {Badge, badgeVariants}
