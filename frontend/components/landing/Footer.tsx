import Link from "next/link"
import { Sparkles } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t border-border/50 bg-background py-6">
            <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Brand */}
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/60">
                        <Sparkles className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                        Mentora — AI-Powered Learning Platform
                    </span>
                </div>

                {/* Links */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <Link href="#" className="hover:text-foreground transition-colors">
                        Privacy
                    </Link>
                    <Link href="#" className="hover:text-foreground transition-colors">
                        Terms
                    </Link>
                    <span>© {new Date().getFullYear()}</span>
                </div>
            </div>
        </footer>
    )
}
