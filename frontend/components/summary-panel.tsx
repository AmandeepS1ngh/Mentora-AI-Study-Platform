"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, RefreshCw, Loader2 } from "lucide-react"

interface TaskStats {
    total: number
    pending: number
    inProgress: number
    completed: number
    cancelled: number
}

interface SummaryPanelProps {
    summary: string | null
    stats: TaskStats | null
    isLoading: boolean
    onGenerate: () => void
    type: "daily" | "weekly"
    hasTasks: boolean
}

export function SummaryPanel({
    summary,
    stats,
    isLoading,
    onGenerate,
    type,
    hasTasks,
}: SummaryPanelProps) {
    return (
        <div className="rounded-xl border border-border/50 bg-card p-4">
            {!summary && !isLoading && (
                <div className="text-center py-8">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-3">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Generate an AI-powered summary of your {type} tasks
                    </p>
                    <Button onClick={onGenerate} disabled={!hasTasks} className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Generate Summary
                    </Button>
                </div>
            )}

            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Generating summary...</p>
                    </div>
                </div>
            )}

            {summary && !isLoading && (
                <div className="space-y-4">
                    {/* Stats */}
                    {stats && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="rounded-lg bg-background p-2 text-center">
                                <p className="text-lg font-semibold text-foreground">{stats.completed}</p>
                                <p className="text-xs text-muted-foreground">Completed</p>
                            </div>
                            <div className="rounded-lg bg-background p-2 text-center">
                                <p className="text-lg font-semibold text-foreground">{stats.pending}</p>
                                <p className="text-xs text-muted-foreground">Pending</p>
                            </div>
                        </div>
                    )}

                    {/* Summary Content */}
                    <div className="prose prose-sm dark:prose-invert">
                        <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                            {summary}
                        </div>
                    </div>

                    {/* Regenerate Button */}
                    <div className="pt-3 border-t border-border/50">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onGenerate}
                            className="w-full gap-2"
                        >
                            <RefreshCw className="h-3 w-3" />
                            Regenerate
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
