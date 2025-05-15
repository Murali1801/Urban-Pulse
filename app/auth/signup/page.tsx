"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export default function SignUpPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: Password
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)

  // Function to generate a 6-digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Function to send OTP email
  const sendOTP = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Generate OTP
      const generatedOTP = generateOTP()
      
      // Store OTP in Firestore with expiration
      const otpRef = doc(db, "otps", email)
      await setDoc(otpRef, {
        otp: generatedOTP,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes expiry
      })

      // Send email using your email service
      // For now, we'll just show the OTP in console (in production, use a proper email service)
      console.log("OTP for", email, ":", generatedOTP)
      
      setOtpSent(true)
      setOtpTimer(60) // Start 60-second timer
      
      // Start countdown timer
      const timer = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      toast.success("OTP sent to your email")
      setStep(2)
    } catch (error: any) {
      console.error("Error sending OTP:", error)
      setError(error.message || "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to verify OTP
  const verifyOTP = async () => {
    if (!otp) {
      setError("Please enter the OTP")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const otpRef = doc(db, "otps", email)
      const otpDoc = await getDoc(otpRef)

      if (!otpDoc.exists()) {
        throw new Error("OTP expired or invalid")
      }

      const otpData = otpDoc.data()
      const now = new Date()
      const expiresAt = new Date(otpData.expiresAt)

      if (now > expiresAt) {
        throw new Error("OTP has expired")
      }

      if (otpData.otp !== otp) {
        throw new Error("Invalid OTP")
      }

      // OTP verified, proceed to password step
      setStep(3)
      toast.success("Email verified successfully")
    } catch (error: any) {
      console.error("Error verifying OTP:", error)
      setError(error.message || "Failed to verify OTP")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to handle signup
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match")
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long")
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update profile with display name
      await updateProfile(user, {
        displayName: displayName
      })

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: displayName,
        createdAt: new Date().toISOString(),
        notifications: {
          email: true,
          push: true,
          marketing: false
        },
        privacy: {
          profileVisibility: "public",
          locationSharing: true,
          activityStatus: true
        }
      })

      // Send email verification
      await sendEmailVerification(user)

      toast.success("Account created successfully")
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error creating account:", error)
      setError(error.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  if (user) {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-dark-bg bg-city-pattern opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-transparent to-dark-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-transparent to-dark-bg" />
      </div>

      <div className="container relative z-10 flex flex-1 flex-col items-center justify-center py-12">
        <div className="mx-auto flex w-full max-w-md flex-col items-center space-y-8">
          <div className="flex flex-col items-center space-y-2 text-center">
            <motion.div
              className="relative w-24 h-24 mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-blue to-neon-orange blur-sm" />
              <div className="absolute inset-1 rounded-full bg-darker-bg" />
              <div className="absolute inset-3 rounded-full bg-gradient-to-r from-neon-blue to-neon-orange opacity-80 flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold text-gradient">Create Account</h1>
            <p className="text-muted-foreground">Join UrbanPulse and start monitoring your city</p>
          </div>

          <div className="w-full">
            <motion.div
              className="glassmorphism rounded-xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {step === 1 && (
                <form onSubmit={(e) => { e.preventDefault(); sendOTP(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-muted/50"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-neon-blue to-neon-orange hover:from-neon-blue/90 hover:to-neon-orange/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="mr-2 h-4 w-4" />
                    )}
                    Send OTP
                  </Button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={(e) => { e.preventDefault(); verifyOTP(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="bg-muted/50"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      OTP sent to {email}
                      {otpTimer > 0 && ` (${otpTimer}s)`}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setStep(1)
                        setOtp("")
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-neon-blue to-neon-orange hover:from-neon-blue/90 hover:to-neon-orange/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="mr-2 h-4 w-4" />
                      )}
                      Verify OTP
                    </Button>
                  </div>

                  {otpTimer === 0 && (
                    <Button
                      type="button"
                      variant="link"
                      className="w-full"
                      onClick={sendOTP}
                    >
                      Resend OTP
                    </Button>
                  )}
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-muted/50"
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-muted/50"
                      placeholder="Create a password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-muted/50"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setStep(2)
                        setPassword("")
                        setConfirmPassword("")
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-neon-blue to-neon-orange hover:from-neon-blue/90 hover:to-neon-orange/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Lock className="mr-2 h-4 w-4" />
                      )}
                      Create Account
                    </Button>
                  </div>
                </form>
              )}

              {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 text-neon-blue hover:text-neon-orange"
                    onClick={() => router.push("/auth/login")}
                  >
                    Sign in
                  </Button>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 