import { FileSearch, Calendar, BookOpen, Brain } from "lucide-react"

const features = [
    {
        icon: FileSearch,
        title: "Document Q&A",
        description:
            "Upload documents and ask questions. Get accurate answers with source citations powered by RAG technology.",
    },
    {
        icon: Calendar,
        title: "Smart Calendar",
        description:
            "Manage your tasks and schedule with an AI-assisted calendar that understands your learning goals.",
    },
    {
        icon: BookOpen,
        title: "Study Planner",
        description:
            "Create personalized study plans based on your materials, deadlines, and learning pace.",
    },
    {
        icon: Brain,
        title: "AI Summaries",
        description:
            "Generate intelligent summaries and reflections to reinforce your understanding of key concepts.",
    },
]

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Core Capabilities
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Four intelligent agents working together to enhance your learning experience.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-6 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors"
                        >
                            {/* Icon */}
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-4 group-hover:from-primary/30 group-hover:to-primary/10 transition-colors">
                                <feature.icon className="w-6 h-6 text-primary" />
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                {feature.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
