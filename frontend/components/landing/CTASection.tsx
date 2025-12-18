import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTASection() {
    return (
        <section className="py-24 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="rounded-2xl border border-border/50 bg-card p-12 text-center relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-primary/5 rounded-full blur-3xl" />
                    </div>

                    <div className="relative">
                        {/* Icon */}
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-6">
                            <Sparkles className="h-8 w-8 text-primary" />
                        </div>

                        {/* Headline */}
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Ready to learn smarter?
                        </h2>

                        {/* Subtext */}
                        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                            Start using Mentora today and transform the way you study, plan, and understand.
                        </p>

                        {/* CTA Button */}
                        <Link
                            href="/docs"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                        >
                            Get Started Now
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
