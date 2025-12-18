"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Calendar,
    Plus,
    CheckCircle2,
    Clock,
    Loader2,
    AlertCircle,
    Sparkles,
    ChevronRight,
    ChevronDown,
    CalendarDays,
    ListTodo,
    RefreshCw,
    ExternalLink,
    Trash2,
    Edit,
    MessageSquare
} from "lucide-react"
import { TaskModal } from "@/components/task-modal"
import { SummaryPanel } from "@/components/summary-panel"
import { AppHeader } from "@/components/AppHeader"

// API Configuration - change this to your backend URL
const API_BASE_URL = "http://localhost:3001"

// Get user timezone
const USER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

// Demo user ID (in production, this comes from auth)
const USER_ID = "550e8400-e29b-41d4-a716-446655440000"

interface Task {
    id: string
    title: string
    description: string | null
    deadline: string
    deadlineFormatted: string
    deadlineRelative: string
    timezone: string
    status: "pending" | "in_progress" | "completed" | "cancelled"
    googleCalendarEventId: string | null
    googleTaskId: string | null
    isSynced: boolean
    syncedAt: string | null
    createdAt: string
    updatedAt: string
}

interface TaskStats {
    total: number
    pending: number
    inProgress: number
    completed: number
    cancelled: number
}

interface Summary {
    summary: string
    tasks: Array<{
        id: string
        title: string
        status: string
        deadline: string
    }>
    stats: TaskStats
    generatedAt: string
}

export function CalendarInterface() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [stats, setStats] = useState<TaskStats | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [error, setError] = useState("")
    const [activeTab, setActiveTab] = useState<"today" | "week">("today")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [summary, setSummary] = useState<Summary | null>(null)
    const [isSummaryLoading, setIsSummaryLoading] = useState(false)
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
    const [isGoogleConnected, setIsGoogleConnected] = useState(false)

    // Fetch tasks on load and tab change
    useEffect(() => {
        fetchTasks()
    }, [activeTab])

    const fetchTasks = async () => {
        setIsLoading(true)
        setError("")

        try {
            const endpoint = activeTab === "today" ? "today" : "week"
            const response = await fetch(
                `${API_BASE_URL}/calendar/tasks/${endpoint}?timezone=${encodeURIComponent(USER_TIMEZONE)}`,
                {
                    headers: {
                        "X-User-Id": USER_ID,
                    },
                }
            )

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || "Failed to fetch tasks")
            }

            setTasks(result.data.tasks)
            if (result.data.stats) {
                setStats(result.data.stats)
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch tasks"
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateTask = async (taskData: {
        title: string
        description: string
        deadline: string
    }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/calendar/tasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": USER_ID,
                },
                body: JSON.stringify({
                    ...taskData,
                    timezone: USER_TIMEZONE,
                }),
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || "Failed to create task")
            }

            // Refresh tasks
            fetchTasks()
            setIsModalOpen(false)
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create task"
            setError(errorMessage)
        }
    }

    const handleUpdateStatus = async (taskId: string, newStatus: string) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/calendar/tasks/${taskId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "X-User-Id": USER_ID,
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            )

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || "Failed to update task")
            }

            // Refresh tasks
            fetchTasks()
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update task"
            setError(errorMessage)
        }
    }

    const handleSync = async () => {
        setIsSyncing(true)
        setError("")

        try {
            const response = await fetch(`${API_BASE_URL}/calendar/sync`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": USER_ID,
                },
                body: JSON.stringify({ syncToTasks: true }),
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || "Failed to sync")
            }

            // Refresh tasks to show updated sync status
            fetchTasks()
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Sync failed"
            setError(errorMessage)
        } finally {
            setIsSyncing(false)
        }
    }

    const handleGenerateSummary = async () => {
        setIsSummaryLoading(true)
        setError("")

        try {
            const endpoint = activeTab === "today" ? "daily" : "weekly"
            const response = await fetch(
                `${API_BASE_URL}/calendar/summary/${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-User-Id": USER_ID,
                    },
                    body: JSON.stringify({ timezone: USER_TIMEZONE }),
                }
            )

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || "Failed to generate summary")
            }

            setSummary(result.data)
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to generate summary"
            setError(errorMessage)
        } finally {
            setIsSummaryLoading(false)
        }
    }

    const handleConnectGoogle = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/calendar/connect-google`, {
                method: "POST",
                headers: {
                    "X-User-Id": USER_ID,
                },
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || "Failed to initiate Google OAuth")
            }

            // Open Google OAuth in new window
            window.open(result.data.authUrl, "_blank", "width=600,height=700")
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to connect Google"
            setError(errorMessage)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "text-green-500 bg-green-500/10"
            case "in_progress":
                return "text-blue-500 bg-blue-500/10"
            case "pending":
                return "text-yellow-500 bg-yellow-500/10"
            case "cancelled":
                return "text-red-500 bg-red-500/10"
            default:
                return "text-muted-foreground bg-muted"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="h-4 w-4" />
            case "in_progress":
                return <Clock className="h-4 w-4" />
            case "pending":
                return <ListTodo className="h-4 w-4" />
            default:
                return <AlertCircle className="h-4 w-4" />
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/95">
            {/* Header */}
            <AppHeader maxWidth="6xl" />

            {/* Action Bar */}
            <div className="border-b border-border/50 bg-background/50">
                <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleConnectGoogle}
                        className="gap-2"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Connect Google
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="gap-2"
                    >
                        {isSyncing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        Sync
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                    >
                        <Plus className="h-4 w-4" />
                        New Task
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <div className="mx-auto max-w-6xl h-full flex flex-col">
                    {/* Tabs */}
                    <div className="px-6 pt-6">
                        <div className="flex items-center gap-2 p-1 bg-card rounded-xl border border-border/50 w-fit">
                            <button
                                onClick={() => setActiveTab("today")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "today"
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setActiveTab("week")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "week"
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                This Week
                            </button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    {stats && (
                        <div className="px-6 pt-4">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="rounded-xl border border-border/50 bg-card p-4">
                                    <p className="text-xs text-muted-foreground">Total</p>
                                    <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
                                </div>
                                <div className="rounded-xl border border-border/50 bg-card p-4">
                                    <p className="text-xs text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-semibold text-yellow-500">{stats.pending}</p>
                                </div>
                                <div className="rounded-xl border border-border/50 bg-card p-4">
                                    <p className="text-xs text-muted-foreground">In Progress</p>
                                    <p className="text-2xl font-semibold text-blue-500">{stats.inProgress}</p>
                                </div>
                                <div className="rounded-xl border border-border/50 bg-card p-4">
                                    <p className="text-xs text-muted-foreground">Completed</p>
                                    <p className="text-2xl font-semibold text-green-500">{stats.completed}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content Grid */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Tasks List */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-foreground">
                                        {activeTab === "today" ? "Today's Tasks" : "This Week's Tasks"}
                                    </h2>
                                    <span className="text-sm text-muted-foreground">
                                        {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                                    </span>
                                </div>

                                {/* Loading State */}
                                {isLoading && (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                )}

                                {/* Error State */}
                                {error && (
                                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && tasks.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-4">
                                            <Calendar className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground mb-1">No tasks yet</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Try using the AI chat to create tasks naturally
                                        </p>
                                    </div>
                                )}

                                {/* Task List */}
                                {!isLoading && tasks.length > 0 && (
                                    <div className="space-y-3">
                                        {tasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="rounded-xl border border-border/50 bg-card hover:bg-card/80 transition-colors"
                                            >
                                                <div
                                                    className="p-4 cursor-pointer"
                                                    onClick={() =>
                                                        setExpandedTaskId(expandedTaskId === task.id ? null : task.id)
                                                    }
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-medium text-foreground truncate">
                                                                    {task.title}
                                                                </h3>
                                                                {task.isSynced && (
                                                                    <span className="text-xs text-green-500">✓ Synced</span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {task.deadlineFormatted}
                                                                </span>
                                                                <span>{task.deadlineRelative}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(
                                                                    task.status
                                                                )}`}
                                                            >
                                                                {getStatusIcon(task.status)}
                                                                {task.status.replace("_", " ")}
                                                            </span>
                                                            {expandedTaskId === task.id ? (
                                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expanded Content */}
                                                {expandedTaskId === task.id && (
                                                    <div className="px-4 pb-4 pt-0 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                        {task.description && (
                                                            <p className="text-sm text-muted-foreground mt-3 mb-4">
                                                                {task.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-2">
                                                            {task.status !== "completed" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleUpdateStatus(task.id, "completed")
                                                                    }}
                                                                    className="gap-1"
                                                                >
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                    Mark Complete
                                                                </Button>
                                                            )}
                                                            {task.status === "pending" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleUpdateStatus(task.id, "in_progress")
                                                                    }}
                                                                    className="gap-1"
                                                                >
                                                                    <Clock className="h-3 w-3" />
                                                                    Start
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Column: AI Summary */}
                            <div className="space-y-4">
                                {/* AI Summary Panel */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-foreground">AI Summary</h2>
                                    </div>

                                    <div className="rounded-xl border border-border/50 bg-card p-4">
                                        {!summary && !isSummaryLoading && (
                                            <div className="text-center py-8">
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-3">
                                                    <Sparkles className="h-6 w-6 text-primary" />
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Generate an AI-powered summary of your {activeTab === "today" ? "daily" : "weekly"} tasks
                                                </p>
                                                <Button
                                                    onClick={handleGenerateSummary}
                                                    disabled={tasks.length === 0}
                                                    size="sm"
                                                    className="gap-2"
                                                >
                                                    <Sparkles className="h-4 w-4" />
                                                    Generate Summary
                                                </Button>
                                            </div>
                                        )}

                                        {isSummaryLoading && (
                                            <div className="flex items-center justify-center py-12">
                                                <div className="text-center">
                                                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                                                    <p className="text-sm text-muted-foreground">Generating summary...</p>
                                                </div>
                                            </div>
                                        )}

                                        {summary && !isSummaryLoading && (
                                            <div className="space-y-4">
                                                <div className="prose prose-sm dark:prose-invert">
                                                    <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                                        {summary.summary}
                                                    </div>
                                                </div>
                                                <div className="pt-3 border-t border-border/50">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleGenerateSummary}
                                                        className="w-full gap-2"
                                                    >
                                                        <RefreshCw className="h-3 w-3" />
                                                        Regenerate
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-border/50 bg-background py-3">
                <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Mentora Calendar Agent v1.0</p>
                    <p className="text-xs text-muted-foreground">
                        Powered by Groq AI + Google Calendar + Supabase
                    </p>
                </div>
            </footer>

            {/* Task Creation Modal */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateTask}
            />
        </div>
    )
}
