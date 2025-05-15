"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, Mic, Bot, User, Loader2, Volume2, CloudFog, Car, AlertCircle, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

// SpeechRecognition setup with better TypeScript support
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: any;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionClass {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  abort(): void;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionError) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

// Get speech recognition API from browser with proper type safety
const getSpeechRecognition = (): SpeechRecognitionClass | null => {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
};

// Initial welcome message
const initialMessages = [
  {
    id: 1,
    type: "ai",
    content: "Hello! I'm your Smart City Assistant. Ask me about traffic, air quality, or other city data.",
  },
]

// Sample suggested queries
const suggestedQueries = [
  "What's the air quality in Vasai West?",
  "How's the air quality today?",
  "Is there pollution in Mumbai?",
  "Tell me about traffic conditions in Vasai",
  "What's the air quality index in Vasai?",
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState(initialMessages)
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [recognitionSupported, setRecognitionSupported] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  const SpeechRecognitionAPI = getSpeechRecognition();

  // Check if speech recognition is supported
  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      setRecognitionSupported(false);
      console.warn("Speech recognition not supported in this browser");
    }
  }, [SpeechRecognitionAPI]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize and handle speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const synth = window.speechSynthesis;
      
      // Cancel any ongoing speech when component unmounts
      return () => {
        synth.cancel();
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.error("Error stopping recognition:", e);
          }
        }
      };
    }
  }, []);

  // Text-to-speech function
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && voiceEnabled) {
      const synth = window.speechSynthesis;
      
      // First, cancel any ongoing speech
      synth.cancel();
      
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set properties
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Try to find a good voice (prefer female voices if available)
      const voices = synth.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && voice.name.includes('Female')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Add event handlers
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      // Start speaking
      synth.speak(utterance);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Function to start voice recognition
  const startVoiceRecognition = () => {
    if (!SpeechRecognitionAPI) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition. Try using Chrome, Edge, or Safari.",
        variant: "destructive"
      });
      return;
    }

    // If already speaking, stop it
    if (isSpeaking) {
      stopSpeaking();
    }

    try {
      // Create a new recognition instance
      recognitionRef.current = new SpeechRecognitionAPI();
      const recognition = recognitionRef.current;
      
      // Configure the recognition
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      // Event handlers
      recognition.onstart = () => {
        setIsListening(true);
        console.log("Voice recognition started");
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("Recognized:", transcript);
        setInputMessage(transcript);
        
        // Automatically submit after a short delay if we have text
        if (transcript && transcript.trim().length > 0) {
          setTimeout(() => {
            setIsListening(false);
            handleSendMessage();
          }, 500);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error("Recognition error:", event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive"
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
        console.log("Voice recognition ended");
      };
      
      // Start recognition
      recognition.start();
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setIsListening(false);
      toast({
        title: "Voice Recognition Failed",
        description: "Failed to start voice recognition. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to stop voice recognition
  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
    }
    setIsListening(false);
  };

  // Function to fetch city coordinates from name
  const fetchCityCoordinates = async (cityName: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        return {
          name: cityName,
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        }
      }
      return null
    } catch (error) {
      console.error("Error fetching city coordinates:", error)
      return null
    }
  }

  // Function to fetch air quality data
  const fetchAirQualityData = async (lat: number, lon: number) => {
    try {
      const apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone&current=ozone,nitrogen_dioxide,carbon_monoxide,european_aqi,us_aqi,pm10,pm2_5`
      
      const response = await fetch(apiUrl)
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching air quality data:", error)
      return null
    }
  }

  // Function to interpret AQI level
  const getAqiDescription = (aqi: number) => {
    if (aqi <= 20) return "Good"
    if (aqi <= 40) return "Fair"
    if (aqi <= 60) return "Moderate"
    if (aqi <= 80) return "Poor"
    if (aqi <= 100) return "Very Poor"
    return "Hazardous"
  }

  // Function to provide recommendations based on AQI
  const getAqiRecommendation = (aqi: number) => {
    if (aqi <= 40) return "It's safe for outdoor activities."
    if (aqi <= 60) return "Consider reducing prolonged outdoor activities if you're sensitive to air pollution."
    if (aqi <= 80) return "People with respiratory issues should limit outdoor activities."
    return "Everyone should reduce outdoor activities and wear masks if necessary."
  }

  // Get mock traffic data (in a real app, this would be an API call)
  const getTrafficData = (cityName: string) => {
    const trafficLevels = ["light", "moderate", "heavy", "congested"]
    const level = trafficLevels[Math.floor(Math.random() * trafficLevels.length)]
    const congestionPercentage = Math.floor(Math.random() * 80) + 20
    const averageSpeed = Math.floor(Math.random() * 40) + 10
    
    return {
      cityName,
      level,
      congestionPercentage,
      averageSpeed,
    }
  }

  // Process the user message and generate a response
  const processUserQuery = async (query: string) => {
    const lowerQuery = query.toLowerCase()
    let response = "I'm not sure how to answer that yet. I can provide information about air quality and traffic conditions in different cities."
    
    // Improved city extraction function
    const extractCity = (query: string): string => {
      // Common Indian cities to check for direct mentions
      const commonCities = [
        "mumbai", "delhi", "bangalore", "kolkata", "chennai", "hyderabad",
        "pune", "ahmedabad", "jaipur", "lucknow", "vasai", "vasai west"
      ];
      
      // Check for direct city mentions (case insensitive)
      for (const city of commonCities) {
        if (query.toLowerCase().includes(city)) {
          // Capitalize city name properly
          return city.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
      }
      
      // Try different regex patterns to extract cities
      // Pattern 1: "in/at/for/near [City]"
      const prepositionPattern = /(?:in|at|for|near)\s+([A-Za-z\s]+)(?:\?|\.|\s|$)/i;
      const prepositionMatch = query.match(prepositionPattern);
      
      // Pattern 2: "[City] city/area/region"
      const cityPattern = /([A-Za-z\s]+)\s+(?:city|area|region)(?:\?|\.|\s|$)/i;
      const cityMatch = query.match(cityPattern);
      
      // Pattern 3: Last capitalized word in the sentence might be a city
      const capitalizedWordsPattern = /\b([A-Z][a-z]+)\b/g;
      const capitalizedWords = Array.from(query.matchAll(capitalizedWordsPattern), m => m[1]);
      const lastCapitalizedWord = capitalizedWords.length > 0 ? capitalizedWords[capitalizedWords.length - 1] : null;
      
      // Return the first match found, with priority order
      if (prepositionMatch && prepositionMatch[1]) {
        return prepositionMatch[1].trim();
      } else if (cityMatch && cityMatch[1]) {
        return cityMatch[1].trim();
      } else if (lastCapitalizedWord) {
        return lastCapitalizedWord;
      }
      
      // Default city if no match found
      return "Vasai West";
    };
    
    // Air quality related queries
    if (
      lowerQuery.includes("air quality") || 
      lowerQuery.includes("pollution") || 
      lowerQuery.includes("aqi") ||
      lowerQuery.includes("pm2.5") ||
      lowerQuery.includes("pm10")
    ) {
      // Extract city name using our improved function
      const cityName = extractCity(query);
      console.log("Detected city for air quality query:", cityName);
      
      // Get coordinates for the city
      const cityData = await fetchCityCoordinates(cityName)
      
      if (cityData) {
        // Fetch air quality data
        const airData = await fetchAirQualityData(cityData.lat, cityData.lon)
        
        if (airData && airData.current) {
          const current = airData.current
          const aqiLevel = getAqiDescription(current.european_aqi)
          const recommendation = getAqiRecommendation(current.european_aqi)
          
          response = `The current air quality in ${cityName} is ${aqiLevel} with an AQI of ${current.european_aqi}. 
          \nPM2.5 levels are at ${current.pm2_5.toFixed(1)} μg/m³ and PM10 at ${current.pm10.toFixed(1)} μg/m³.
          \nOzone is ${current.ozone.toFixed(1)} μg/m³ and Nitrogen Dioxide is ${current.nitrogen_dioxide.toFixed(1)} μg/m³.
          \n${recommendation}`
        } else {
          response = `I couldn't retrieve the current air quality data for ${cityName}. Please try again later.`
        }
      } else {
        response = `I couldn't find information for ${cityName}. Please try another city name.`
      }
    }
    // Traffic related queries
    else if (
      lowerQuery.includes("traffic") || 
      lowerQuery.includes("congestion") || 
      lowerQuery.includes("road") ||
      lowerQuery.includes("route") ||
      lowerQuery.includes("highway")
    ) {
      // Extract city name using our improved function
      const cityName = extractCity(query);
      console.log("Detected city for traffic query:", cityName);
      
      // Get mock traffic data (would be real API in production)
      const trafficData = getTrafficData(cityName)
      
      response = `Traffic in ${cityName} is currently ${trafficData.level} with ${trafficData.congestionPercentage}% congestion. 
      The average vehicle speed is ${trafficData.averageSpeed} mph. 
      ${trafficData.level === "heavy" || trafficData.level === "congested" 
        ? "Consider using alternate routes or public transportation if available." 
        : "Roads are flowing relatively well at this time."}`
    }
    
    return response
  }

  const handleSendMessage = async () => {
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

    // Process the user query and get a response
    try {
      // Stop any ongoing speech
      stopSpeaking();
      
      const aiResponseContent = await processUserQuery(newUserMessage.content)
      
      const aiResponse = {
        id: messages.length + 2,
        type: "ai",
        content: aiResponseContent,
      }

      setMessages((prev) => [...prev, aiResponse])
      
      // Speak the response if voice is enabled
      if (voiceEnabled) {
        // Use a short timeout to ensure DOM is updated before speaking
        setTimeout(() => {
          speakText(aiResponseContent);
        }, 200);
      }
    } catch (error) {
      console.error("Error processing query:", error)
      
      const errorResponse = {
        id: messages.length + 2,
        type: "ai",
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
      }
      
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
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
    if (isListening) {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  }

  // Toggle voice output
  const toggleVoiceOutput = () => {
    if (isSpeaking && voiceEnabled) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

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
                    <div className="flex items-center gap-3">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="voice-mode" 
                          checked={voiceEnabled}
                          onCheckedChange={toggleVoiceOutput}
                        />
                        <Label htmlFor="voice-mode" className="text-xs cursor-pointer">
                          {voiceEnabled ? (
                            <span className="flex items-center gap-1">
                              <Volume2 className="h-3 w-3" />
                              Voice
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <VolumeX className="h-3 w-3" />
                              Muted
                            </span>
                          )}
                        </Label>
                      </div>
                    <Badge className="bg-neon-blue/20 text-neon-blue">
                      <Bot className="h-3 w-3 mr-1" /> AI Powered
                    </Badge>
                    </div>
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
                              <div className="text-sm whitespace-pre-line">
                                {message.content}
                                {message.type === "ai" && message.id === messages.length && isSpeaking && (
                                  <div className="mt-1 text-xs flex items-center gap-1 text-blue-400">
                                    <Volume2 className="h-3 w-3 animate-pulse" />
                                    <span>Speaking...</span>
                                  </div>
                                )}
                              </div>
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
                        className={`rounded-full ${isListening ? "bg-red-500/20 text-red-400" : ""} ${isSpeaking ? "bg-blue-500/20 text-blue-400" : ""}`}
                        onClick={toggleListening}
                        disabled={!recognitionSupported}
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
                  <CardTitle>Ask About</CardTitle>
                  <CardDescription>Information available through the assistant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="glassmorphism p-4 rounded-lg space-y-4">
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <CloudFog className="h-4 w-4 text-neon-blue shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium">Air Quality</span>
                          <p className="text-muted-foreground text-xs mt-1">
                            Get AQI, PM2.5, PM10, and other pollutant levels for any city
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Car className="h-4 w-4 text-neon-orange shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium">Traffic Conditions</span>
                          <p className="text-muted-foreground text-xs mt-1">
                            Check congestion levels and get route recommendations
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium">Alerts & Warnings</span>
                          <p className="text-muted-foreground text-xs mt-1">
                            Get information about active warnings in your area
                          </p>
                        </div>
                      </li>
                    </ul>

                    <Button
                      className="w-full bg-gradient-to-r from-neon-blue to-neon-orange gap-2"
                      onClick={toggleListening}
                      disabled={!recognitionSupported}
                    >
                      <Mic className="h-4 w-4" />
                      {isListening ? "Stop Listening" : "Start Voice Command"}
                    </Button>

                    <div className="flex justify-center pt-2 items-center text-sm text-muted-foreground">
                      <p className="flex items-center gap-1">
                        <Volume2 className="h-3 w-3" />
                        {voiceEnabled ? "Voice responses enabled" : "Enable voice responses with the toggle above"}
                      </p>
                    </div>
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


