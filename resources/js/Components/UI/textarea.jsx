import * as React from "react"
import {cn} from "@/lib/utils"

const Textarea = React.forwardRef(({className, ...props}, ref) => (
    <textarea
        className={cn(
            "flex min-h-[100px] w-full rounded-lg border border-border/50",
            "bg-white dark:bg-[#111113] px-3 py-2 text-sm",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:border-foreground/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "resize-none",
            className
        )}
        ref={ref}
        {...props}
    />
))
Textarea.displayName = "Textarea"

export {Textarea}
