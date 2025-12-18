"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, Loader2, Sparkles, Calendar } from "lucide-react"

// API Configuration
const API_BASE_URL = "http://localhost:3001"
const USER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone
const USER_ID = "550e8400-e29b-41d4-a716-446655440000"

interface Message {
    role: "user" | "assistant"
    content: string
    type?: "task_created" | "clarification" | "general"
    task?: any
}

interface ChatInterfaceProps {
    onTaskCreated?: () => void
}

export function ChatInterface({ onTaskCreated }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "👋 Hi! I'm your study assistant. You can tell me things like:\n\n• \"Tomorrow at 7pm, study React hooks for 2 hours\"\n• \"Next Monday at 3pm, complete PBL project\"\n• \"Friday at 5pm, review DSA concepts\"\n\nI'll help you create tasks for your calendar!",
            type: "general"
        }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = { role: "user", content: input }
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
            }

            setMessages((prev) => [...prev, assistantMessage])

            // If task was created, notify parent to refresh task list
            if (result.data.type === "task_created" && onTaskCreated) {
                onTaskCreated()
            }
        } catch (error) {
            const errorMessage: Message = {
                role: "assistant",
                content: `❌ Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}`,
                type: "general",
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full rounded-xl border border-border/50 bg-card overflow-hidden">
            {/* Header */}
            <div className="border-b border-border/50 bg-card/50 px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">AI Assistant</h3>
                        <p className="text-xs text-muted-foreground">Create tasks with natural language</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        {message.role === "user" ? (
                            <div className="rounded-2xl rounded-tr-md bg-primary px-4 py-2 max-w-[85%] shadow-sm">
                                <p className="text-sm text-primary-foreground">{message.content}</p>
                            </div>
                        ) : (
                            <div className="rounded-2xl rounded-tl-md bg-muted/50 px-4 py-2 max-w-[85%] shadow-sm">
                                <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                    {message.content}
                                </div>
                                {message.type === "task_created" && message.task && (
                                    <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>Task ID: {message.task.id.substring(0, 8)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                        <div className="rounded-2xl rounded-tl-md bg-muted/50 px-4 py-2 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">Thinking...</p>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border/50 bg-card/50 p-4">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="e.g., Tomorrow at 7pm, study React hooks..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 rounded-xl border border-border/50 bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}
