"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sparkles, FileText, Calendar, MessageSquare, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
    { href: "/docs", label: "Docs", icon: FileText },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/study-plan", label: "Study Plans", icon: BookOpen },
]

export function Header() {
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                {/* Logo / Brand */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/25">
                        <Sparkles className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">Mentora</h1>
                        <p className="text-xs text-muted-foreground">AI Study Platform</p>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav className="flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                )}
                            >
                                <link.icon className="w-4 h-4" />
                                <span>{link.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </header>
    )
}
