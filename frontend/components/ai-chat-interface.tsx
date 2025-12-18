"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, Loader2, Sparkles, Calendar, ExternalLink } from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/AppHeader"

// API Configuration
const API_BASE_URL = "http://localhost:3001"
const USER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone
const USER_ID = "550e8400-e29b-41d4-a716-446655440000"

interface Message {
    role: "user" | "assistant"
    content: string
    type?: "task_created" | "clarification" | "general"
    task?: any
    timestamp: Date
}

export function AIChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "👋 **Welcome to your AI Study Assistant!**\n\nI can help you create tasks using natural language. Just tell me what you need to do and when.\n\n**Try saying things like:**\n\n📚 \"Tomorrow at 7pm, study React hooks for 2 hours\"\n\n📝 \"Next Monday at 3pm, complete PBL project\"\n\n🎯 \"Friday at 5pm, review DSA concepts\"\n\nI'll extract the details and create tasks for you automatically!",
            type: "general",
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        // Focus input on mount
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
            const response = await fetch(`${API_BASE_URL}/calendar/chat`, {
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
                content: result.data.message,
                type: result.data.type,
                task: result.data.task,
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
                                    <div className="flex flex-col gap-2">
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

                                            {/* Task Details Card */}
                                            {message.type === "task_created" && message.task && (
                                                <div className="mt-3 pt-3 border-t border-border/30">
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        <span className="font-mono">Task ID: {message.task.id.substring(0, 8)}</span>
                                                    </div>
                                                    <Link href="/calendar">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-2 w-full gap-2 text-xs h-8"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            View in Calendar
                                                        </Button>
                                                    </Link>
                                                </div>
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
                                        <p className="text-sm text-muted-foreground">Thinking...</p>
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
                                            placeholder="Type your message... (e.g., Tomorrow at 7pm, study React hooks)"
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
                                        💡 <strong>Tip:</strong> Include date, time, and optional duration for best results
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
