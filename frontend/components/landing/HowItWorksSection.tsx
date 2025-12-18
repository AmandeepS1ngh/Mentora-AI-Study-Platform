import { Upload, MessageCircle, Lightbulb, TrendingUp } from "lucide-react"

const steps = [
    {
        icon: Upload,
        step: "01",
        title: "Upload Documents",
        description: "Add your study materials, notes, or any documents you want to learn from.",
    },
    {
        icon: MessageCircle,
        step: "02",
        title: "Ask Questions",
        description: "Chat with your documents or plan tasks using natural language.",
    },
    {
        icon: Lightbulb,
        step: "03",
        title: "Get Insights",
        description: "Receive AI-powered answers, summaries, and study recommendations.",
    },
    {
        icon: TrendingUp,
        step: "04",
        title: "Track Progress",
        description: "Monitor your learning journey and stay on top of your goals.",
    },
]

export function HowItWorksSection() {
    return (
        <section className="py-24 px-6 border-y border-border/50">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        How It Works
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Get started in minutes with a simple, intuitive workflow.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((item, index) => (
                        <div key={index} className="relative">
                            {/* Connector line (hidden on last item and mobile) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-6 left-[calc(50%+1.5rem)] w-[calc(100%-3rem)] h-px bg-border/50" />
                            )}

                            <div className="text-center">
                                {/* Step Icon */}
                                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-4">
                                    <item.icon className="w-5 h-5 text-primary" />
                                </div>

                                {/* Step Label */}
                                <div className="text-xs font-mono text-primary mb-2">
                                    STEP {item.step}
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    {item.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-muted-foreground">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
