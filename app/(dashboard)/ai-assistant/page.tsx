"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, Mic, Bot, User, Loader2, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// Sample AI responses
const sampleResponses = [
  {
    id: 1,
    type: "ai",
    content: "Hello! I'm your Smart City Assistant. How can I help you today?",
  },
  {
    id: 2,
    type: "user",
    content: "What's the traffic like downtown?",
  },
  {
    id: 3,
    type: "ai",
    content:
      "Based on the latest data, traffic in the downtown area is currently moderate with an average speed of 25 mph. There's some congestion on Main Street due to construction work. I'd recommend taking 5th Avenue if you're heading north, or Broadway if you're going south.",
  },
  {
    id: 4,
    type: "user",
    content: "Is the air quality good today?",
  },
  {
    id: 5,
    type: "ai",
    content:
      "Yes, the air quality today is good with an AQI of 42. PM2.5 levels are at 10 µg/m³ and PM10 at 22 µg/m³. It's a great day for outdoor activities in most areas of the city. Would you like me to notify you if the air quality changes significantly?",
  },
]

// Sample suggested queries
const suggestedQueries = [
  "What's the fastest route to the airport?",
  "Where are the active flood warnings?",
  "Which areas have the best air quality now?",
  "When will the construction on Main Street finish?",
  "How's the traffic on Highway 101?",
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState(sampleResponses)
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      type: "user",
      content: inputMessage,
    }

    setMessages([...messages, newUserMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: "ai",
        content:
          "I'm processing your request about \"" +
          inputMessage +
          '". This is a simulated response since this is a demo. In a real application, this would connect to an AI service to provide relevant city data and insights based on your query.',
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestedQuery = (query: string) => {
    setInputMessage(query)
  }

  const toggleListening = () => {
    setIsListening(!isListening)

    // Simulate voice recognition after a delay
    if (!isListening) {
      setTimeout(() => {
        setInputMessage("What's the air quality index in the park area?")
        setIsListening(false)
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold mb-2">AI Assistant</h1>
            <p className="text-muted-foreground mb-6">
              Get instant answers about traffic, air quality, and city services
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="border-0 shadow-none bg-transparent h-[600px] flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Chat with City Assistant</CardTitle>
                    <Badge className="bg-neon-blue/20 text-neon-blue">
                      <Bot className="h-3 w-3 mr-1" /> AI Powered
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1 glassmorphism rounded-lg p-4 mb-4 overflow-y-auto">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`
                              glassmorphism max-w-[80%] p-3 rounded-lg
                              ${
                                message.type === "user"
                                  ? "bg-neon-orange/10 border border-neon-orange/30"
                                  : "bg-neon-blue/10 border border-neon-blue/30"
                              }
                            `}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-shrink-0 mt-1">
                                {message.type === "user" ? (
                                  <div className="bg-neon-orange/30 p-1 rounded-full">
                                    <User className="h-3 w-3" />
                                  </div>
                                ) : (
                                  <div className="bg-neon-blue/30 p-1 rounded-full">
                                    <Bot className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                              <div className="text-sm">{message.content}</div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="glassmorphism bg-neon-blue/10 border border-neon-blue/30 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="bg-neon-blue/30 p-1 rounded-full">
                                <Bot className="h-3 w-3" />
                              </div>
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-neon-blue/50 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-neon-blue/50 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-neon-blue/50 rounded-full animate-pulse delay-150"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  <div className="relative">
                    <Textarea
                      placeholder="Type your question or request..."
                      className="pr-24 bg-muted/30 resize-none"
                      rows={3}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className={`rounded-full ${isListening ? "bg-red-500/20 text-red-400" : ""}`}
                        onClick={toggleListening}
                      >
                        {isListening ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                        <span className="sr-only">{isListening ? "Stop voice input" : "Start voice input"}</span>
                      </Button>
                      <Button
                        size="icon"
                        className="rounded-full bg-gradient-to-r from-neon-blue to-neon-orange"
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send message</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-6">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <CardTitle>Suggested Questions</CardTitle>
                  <CardDescription>Try asking these questions to the AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {suggestedQueries.map((query, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-2 glassmorphism"
                          onClick={() => handleSuggestedQuery(query)}
                        >
                          {query}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <CardTitle>Voice Commands</CardTitle>
                  <CardDescription>Use voice to interact with the city assistant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="glassmorphism p-4 rounded-lg space-y-4">
                    <p className="text-sm text-muted-foreground">
                      You can use voice commands to get information about:
                    </p>

                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Volume2 className="h-4 w-4 text-neon-blue shrink-0 mt-0.5" />
                        <span>"What's the traffic like on Highway 101?"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Volume2 className="h-4 w-4 text-neon-blue shrink-0 mt-0.5" />
                        <span>"How's the air quality in downtown?"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Volume2 className="h-4 w-4 text-neon-blue shrink-0 mt-0.5" />
                        <span>"Are there any flood warnings today?"</span>
                      </li>
                    </ul>

                    <Button
                      className="w-full bg-gradient-to-r from-neon-blue to-neon-orange gap-2"
                      onClick={toggleListening}
                    >
                      <Mic className="h-4 w-4" />
                      {isListening ? "Stop Listening" : "Start Voice Command"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

