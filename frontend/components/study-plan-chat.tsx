"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, Loader2, Sparkles, Calendar, BookOpen, CheckCircle2, Clock, Target } from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/AppHeader"

// API Configuration
const API_BASE_URL = "http://localhost:3001"
const USER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone
const USER_ID = "550e8400-e29b-41d4-a716-446655440000"

interface Message {
    role: "user" | "assistant"
    content: string
    type?: "plan_generated" | "clarification" | "general"
    plan?: any
    planId?: string
    timestamp: Date
}

interface PlanCardProps {
    plan: any
    planId: string
    onApply: (planId: string) => void
    isApplying: boolean
}

function PlanCard({ plan, planId, onApply, isApplying }: PlanCardProps) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5 shadow-lg">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg text-foreground">{plan.goal}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{plan.total_days} days</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{Math.floor(plan.daily_time_minutes / 60)}h {plan.daily_time_minutes % 60}m daily</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            <span>{plan.schedule.length} study sessions</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategies */}
            <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Learning Strategies:</p>
                <div className="flex flex-wrap gap-2">
                    {plan.learning_strategy.map((strategy: string, index: number) => (
                        <span
                            key={index}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                        >
                            {strategy.replace('_', ' ')}
                        </span>
                    ))}
                </div>
            </div>

            {/* Quick Preview */}
            <div className="space-y-2 mb-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                    <span className="text-sm font-semibold text-primary">Day 1:</span>
                    <span className="text-sm text-foreground">{plan.schedule[0].topic}</span>
                </div>
                {plan.schedule[Math.floor(plan.total_days / 2)] && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                        <span className="text-sm font-semibold text-primary">Day {Math.floor(plan.total_days / 2) + 1}:</span>
                        <span className="text-sm text-foreground">
                            {plan.schedule[Math.floor(plan.total_days / 2)].topic}
                        </span>
                    </div>
                )}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                    <span className="text-sm font-semibold text-primary">Day {plan.total_days}:</span>
                    <span className="text-sm text-foreground">{plan.schedule[plan.total_days - 1].topic}</span>
                </div>
            </div>

            {/* Expandable Full Schedule */}
            {expanded && (
                <div className="mb-4 max-h-60 overflow-y-auto rounded-lg border border-border/50 bg-background/30">
                    <div className="p-4 space-y-2">
                        {plan.schedule.map((day: any, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-2 rounded hover:bg-background/50 transition-colors">
                                <span className="text-xs font-semibold text-primary min-w-[60px]">Day {day.day}:</span>
                                <div className="flex-1">
                                    <p className="text-sm text-foreground font-medium">{day.topic}</p>
                                    {day.notes && (
                                        <p className="text-xs text-muted-foreground mt-1">💡 {day.notes}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {day.sessions} session{day.sessions > 1 ? 's' : ''} × {day.session_duration_minutes} min
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="flex-1"
                >
                    {expanded ? "Hide" : "View"} Full Schedule ({plan.schedule.length} days)
                </Button>
                <Button
                    onClick={() => onApply(planId)}
                    disabled={isApplying}
                    size="sm"
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                >
                    {isApplying ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adding...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Add to Calendar
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

export function StudyPlanChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "👋 **Welcome to your AI Study Plan Generator!**\n\nI can create personalized study plans tailored to your goals and schedule.\n\n**Try saying things like:**\n\n📚 \"I want to prepare for DSA interviews in 4 weeks, I can study 2 hours daily\"\n\n💻 \"Help me learn React in 3 weeks with 1.5 hours per day\"\n\n🎯 \"Create a plan to master System Design in 8 weeks, 3 hours daily\"\n\nI'll ask clarifying questions if needed and generate a complete day-by-day study plan!",
            type: "general",
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isApplying, setIsApplying] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            role: "user",
            content: input,
            timestamp: new Date()
        }
        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch(`${API_BASE_URL}/study-plan/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": USER_ID,
                },
                body: JSON.stringify({
                    message: input,
                    timezone: USER_TIMEZONE,
                }),
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || "Failed to process message")
            }

            const assistantMessage: Message = {
                role: "assistant",
                content: result.data.message || result.data.message,
                type: result.data.type,
                plan: result.data.plan,
                planId: result.data.planId,
                timestamp: new Date()
            }

            setMessages((prev) => [...prev, assistantMessage])
        } catch (error) {
            const errorMessage: Message = {
                role: "assistant",
                content: `❌ Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}`,
                type: "general",
                timestamp: new Date()
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
            inputRef.current?.focus()
        }
    }

    const handleApplyPlan = async (planId: string) => {
        setIsApplying(true)

        try {
            const response = await fetch(`${API_BASE_URL}/study-plan/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": USER_ID,
                },
                body: JSON.stringify({
                    plan_id: planId,
                    timezone: USER_TIMEZONE,
                    options: {
                        // Can customize start date and time here
                        preferred_time: "09:00"
                    }
                }),
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.error?.message || "Failed to apply plan")
            }

            // Add success message
            const successMessage: Message = {
                role: "assistant",
                content: `✅ **Plan Applied Successfully!**\n\n🎉 Created ${result.data.tasks_created} study sessions\n📅 Starting: ${result.data.start_date}\n🏁 Ending: ${result.data.end_date}\n\nYour tasks are now in your calendar. View them in the [Calendar page](/calendar)!`,
                type: "general",
                timestamp: new Date()
            }
            setMessages((prev) => [...prev, successMessage])
        } catch (error) {
            const errorMessage: Message = {
                role: "assistant",
                content: `❌ Failed to add plan to calendar: ${error instanceof Error ? error.message : "Unknown error"}`,
                type: "general",
                timestamp: new Date()
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsApplying(false)
        }
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        })
    }

    return (
        <div className="flex h-screen flex-col bg-gradient-to-b from-background via-background to-background/95">
            {/* Header */}
            <AppHeader maxWidth="4xl" />

            {/* Chat Container */}
            <div className="flex-1 overflow-hidden">
                <div className="mx-auto max-w-4xl h-full flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-3 duration-500`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Message Bubble */}
                                <div className={`flex items-start gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                    {/* Avatar */}
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
                                            }`}
                                    >
                                        {message.role === "user" ? (
                                            <span className="text-sm font-semibold">You</span>
                                        ) : (
                                            <Sparkles className="h-4 w-4 text-primary" />
                                        )}
                                    </div>

                                    {/* Message Content */}
                                    <div className="flex flex-col gap-2 flex-1">
                                        <div
                                            className={`rounded-2xl px-5 py-3 shadow-sm ${message.role === "user"
                                                ? "rounded-tr-md bg-primary text-primary-foreground"
                                                : "rounded-tl-md bg-card border border-border/50"
                                                }`}
                                        >
                                            <div
                                                className={`text-sm leading-relaxed whitespace-pre-wrap ${message.role === "user" ? "text-primary-foreground" : "text-foreground"
                                                    }`}
                                            >
                                                {message.content}
                                            </div>

                                            {/* Plan Card */}
                                            {message.type === "plan_generated" && message.plan && message.planId && (
                                                <PlanCard
                                                    plan={message.plan}
                                                    planId={message.planId}
                                                    onApply={handleApplyPlan}
                                                    isApplying={isApplying}
                                                />
                                            )}
                                        </div>

                                        {/* Timestamp */}
                                        <span className={`text-xs text-muted-foreground px-1 ${message.role === "user" ? "text-right" : "text-left"}`}>
                                            {formatTime(message.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Loading */}
                        {isLoading && (
                            <div className="flex items-start gap-3 animate-in fade-in duration-300">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                </div>
                                <div className="rounded-2xl rounded-tl-md bg-card border border-border/50 px-5 py-3 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        <p className="text-sm text-muted-foreground">Creating your personalized study plan...</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
                        <div className="px-6 py-6">
                            <form onSubmit={handleSubmit} className="flex items-end gap-3">
                                <div className="flex-1">
                                    <div className="relative">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            placeholder="Describe your learning goal... (e.g., Master React in 3 weeks, 2 hours daily)"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            className="w-full rounded-2xl border border-border/50 bg-card px-5 py-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm"
                                            disabled={isLoading}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                            {input.length > 0 && `${input.length}`}
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground px-2">
                                        💡 <strong>Tip:</strong> Mention your goal, timeline, and daily time commitment for best results
                                    </p>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    size="lg"
                                    className="h-[52px] px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-105"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="h-5 w-5 mr-2" />
                                            Send
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-border/50 bg-background py-3">
                <div className="mx-auto max-w-4xl px-6 flex items-center justify-between text-xs text-muted-foreground">
                    <p>Powered by Groq AI + Supabase</p>
                    <p>Timezone: {USER_TIMEZONE}</p>
                </div>
            </footer>
        </div>
    )
}
