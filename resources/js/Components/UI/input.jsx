import * as React from "react"
import {cn} from "@/lib/utils"

const Input = React.forwardRef(({className, type, ...props}, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-10 w-full rounded-lg border border-border/50",
                "bg-white dark:bg-[#111113] px-3 py-2 text-sm",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:border-foreground/20",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Input.displayName = "Input"

export {Input}
