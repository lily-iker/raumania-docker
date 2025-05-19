"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import useChatStore from "@/stores/useChatStore"

export default function ChatBubble() {
  const { isOpen, messages, inputValue, isLoading, toggleChat, setInputValue, sendMessage } = useChatStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue)
    }
  }

  return (
    <>
      {/* Chat toggle button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg p-0 bg-primary hover:bg-primary/90"
        aria-label="Toggle chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Button>

      {/* Chat window */}
      <div
        className={cn(
          "fixed bottom-24 right-6 w-80 md:w-96 transition-all duration-300 transform z-50",
          isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95 pointer-events-none",
        )}
      >
        <Card className="border-2 shadow-2xl bg-background">
          <CardHeader className="bg-primary text-primary-foreground py-3 px-4 font-medium border-b">
            Chat Assistant
          </CardHeader>

          <CardContent className="p-0">
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">Ask me anything about our products!</div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={cn("flex", message.isUser ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%]  rounded-lg px-3 py-2",
                        message.isUser ? "bg-brand-purple text-white" : "bg-muted",
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-3 py-2 bg-muted flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          <CardFooter className="p-2 border-t">
            <form onSubmit={handleSubmit} className="flex w-full space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={!inputValue.trim() || isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
