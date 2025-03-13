"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false)

    // Initialize theme based on system preference or stored preference
    useEffect(() => {
        // Check if user has a stored preference
        const storedTheme = localStorage.getItem("theme")

        if (storedTheme === "dark") {
            setIsDark(true)
            document.documentElement.classList.add("dark")
        } else if (storedTheme === "light") {
            setIsDark(false)
            document.documentElement.classList.remove("dark")
        } else {
            // Check system preference
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
            setIsDark(prefersDark)
            if (prefersDark) {
                document.documentElement.classList.add("dark")
            }
        }
    }, [])

    // Toggle theme
    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove("dark")
            localStorage.setItem("theme", "light")
        } else {
            document.documentElement.classList.add("dark")
            localStorage.setItem("theme", "dark")
        }
        setIsDark(!isDark)
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
                "rounded-full",
                isDark ? "text-yellow-400 hover:text-yellow-500" : "text-slate-500 hover:text-slate-900"
            )}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
    )
}

