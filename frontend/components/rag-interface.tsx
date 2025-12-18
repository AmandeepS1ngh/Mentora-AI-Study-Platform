"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Send, ChevronRight, ChevronDown, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { AppHeader } from "@/components/AppHeader"

// API Configuration - change this to your backend URL
const API_BASE_URL = "http://localhost:3000"

interface SourceChunk {
  chunkId: string
  documentId: string
  content: string
  similarity: number
  metadata?: {
    chunkIndex: number
    charCount: number
  }
}

interface Message {
  role: "user" | "assistant"
  content: string
  sources?: SourceChunk[]
  metrics?: {
    totalTimeMs: number
    tokenUsage?: {
      promptTokens: number
      completionTokens: number
    }
  }
}

interface UploadedDocument {
  id: string
  name: string
  chunkCount: number
  pageCount: number
}

export function RAGInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const [expandedSources, setExpandedSources] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file")
      return
    }

    setIsUploading(true)
    setError("")
    setUploadProgress("Uploading document...")

    try {
      const formData = new FormData()
      formData.append("file", file)

      setUploadProgress("Extracting text and generating embeddings...")

      const response = await fetch(`${API_BASE_URL}/ingest`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to upload document")
      }

      setUploadProgress("Document processed successfully!")

      const newDoc: UploadedDocument = {
        id: result.data.documentId,
        name: result.data.fileName,
        chunkCount: result.data.chunkCount,
        pageCount: result.data.pageCount,
      }

      setUploadedDocuments((prev) => [...prev, newDoc])

      // Add a system message about the upload
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ **Document uploaded successfully!**\n\n📄 **${newDoc.name}**\n- Pages: ${newDoc.pageCount}\n- Chunks: ${newDoc.chunkCount}\n\nYou can now ask questions about this document.`,
        },
      ])

      setTimeout(() => setUploadProgress(""), 2000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed"
      setError(errorMessage)
      setUploadProgress("")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Query failed")
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: result.data.answer,
        sources: result.data.sources,
        metrics: result.metrics,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Query failed"
      setError(errorMessage)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Error: ${errorMessage}. Please make sure the backend is running.`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 70) return "text-green-500"
    if (similarity >= 50) return "text-yellow-500"
    return "text-orange-500"
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <AppHeader maxWidth="4xl" />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="mx-auto max-w-4xl h-full flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-6 max-w-md">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">Upload a document</h2>
                    <p className="text-sm text-muted-foreground">
                      Start by uploading a PDF document. Our AI will extract and index the content,
                      allowing you to ask questions and get accurate answers.
                    </p>
                  </div>
                  <label
                    htmlFor="pdf-upload-empty"
                    className={`inline-flex items-center gap-2 cursor-pointer rounded-xl border border-primary/30 bg-primary/5 px-6 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-all duration-200 ${isUploading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {uploadProgress || "Processing..."}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload PDF
                      </>
                    )}
                  </label>
                  <input
                    id="pdf-upload-empty"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {message.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="rounded-2xl rounded-tr-md bg-primary px-4 py-3 max-w-2xl shadow-lg shadow-primary/10">
                        <p className="text-sm text-primary-foreground">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-2xl rounded-tl-md bg-card border border-border/50 px-4 py-3 shadow-sm">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        {message.metrics && (
                          <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-4 text-xs text-muted-foreground">
                            <span>⏱️ {message.metrics.totalTimeMs}ms</span>
                            {message.metrics.tokenUsage && (
                              <span>
                                🎯 {message.metrics.tokenUsage.promptTokens} + {message.metrics.tokenUsage.completionTokens} tokens
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="ml-4">
                          <button
                            onClick={() => setExpandedSources(expandedSources === index ? null : index)}
                            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {expandedSources === index ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                            <span className="font-medium">
                              📚 Sources ({message.sources.length} chunks retrieved)
                            </span>
                          </button>

                          {expandedSources === index && (
                            <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                              {message.sources.map((source, sourceIndex) => (
                                <div
                                  key={sourceIndex}
                                  className="rounded-xl border border-border/50 bg-card/50 p-4 hover:bg-card transition-colors"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-foreground">
                                      Chunk {source.metadata?.chunkIndex !== undefined ? source.metadata.chunkIndex + 1 : sourceIndex + 1}
                                    </span>
                                    <span className={`text-xs font-semibold ${getSimilarityColor(source.similarity)}`}>
                                      {source.similarity.toFixed(1)}% match
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                                    {source.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="rounded-2xl rounded-tl-md bg-card border border-border/50 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload progress */}
            {isUploading && uploadProgress && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="rounded-2xl rounded-tl-md bg-card border border-border/50 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">{uploadProgress}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Section */}
          <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl px-6 py-4">
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              {/* Upload button */}
              <label
                htmlFor="pdf-upload"
                className={`flex-shrink-0 cursor-pointer rounded-xl border border-border/50 bg-card p-3 hover:bg-accent transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <Upload className="h-5 w-5 text-muted-foreground" />
                )}
              </label>
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />

              {/* Text input */}
              <div className="flex-1 flex items-end gap-3">
                <input
                  type="text"
                  placeholder={
                    uploadedDocuments.length === 0
                      ? "Upload a document first..."
                      : "Ask a question about your document..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 rounded-xl border border-border/50 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  disabled={isLoading || uploadedDocuments.length === 0}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim() || uploadedDocuments.length === 0}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 h-auto rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>

            {/* Status bar */}
            {uploadedDocuments.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span>
                  {uploadedDocuments.length} document{uploadedDocuments.length !== 1 ? "s" : ""} loaded •{" "}
                  {uploadedDocuments.reduce((sum, d) => sum + d.chunkCount, 0)} total chunks indexed
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background py-3">
        <div className="mx-auto max-w-4xl px-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Mentora RAG v1.0</p>
          <p className="text-xs text-muted-foreground">
            Powered by Voyage AI + Groq + Supabase
          </p>
        </div>
      </footer>
    </div>
  )
}
