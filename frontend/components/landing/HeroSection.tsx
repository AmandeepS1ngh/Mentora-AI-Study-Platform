import Link from "next/link"
import { ArrowRight, FileSearch, Calendar, BookOpen, Brain } from "lucide-react"

const features = [
    { icon: FileSearch, label: "Document Q&A" },
    { icon: Calendar, label: "Smart Calendar" },
    { icon: BookOpen, label: "Study Plans" },
    { icon: Brain, label: "AI Summaries" },
]

export function HeroSection() {
    return (
        <section className="relative pt-24 pb-20 px-6 overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-4xl mx-auto">
                {/* Agent badges */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-card/50 text-sm text-muted-foreground"
                        >
                            <feature.icon className="w-3.5 h-3.5 text-primary" />
                            <span>{feature.label}</span>
                        </div>
                    ))}
                </div>

                {/* Headline */}
                <div className="text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
                        Your intelligent companion
                        <br />
                        <span className="text-primary">for focused learning</span>
                    </h1>

                    {/* Subtext */}
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Mentora combines document Q&A, smart scheduling, and personalized study planning
                        to help you learn more effectively.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            href="/docs"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                        >
                            Get Started
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="#features"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-border/50 bg-card text-foreground font-medium rounded-xl hover:bg-accent transition-colors"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>

                {/* Stats or quick info */}
                <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">RAG</p>
                        <p className="text-xs text-muted-foreground">Document AI</p>
                    </div>
                    <div className="text-center border-x border-border/50">
                        <p className="text-2xl font-bold text-foreground">4</p>
                        <p className="text-xs text-muted-foreground">AI Agents</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">∞</p>
                        <p className="text-xs text-muted-foreground">Possibilities</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
