"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Settings, Loader2, Lock, Bell, Shield, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { auth, db } from "@/lib/firebase"
import { updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore"
import { useAuth } from "@/contexts/AuthContext"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false
  })
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    locationSharing: true,
    activityStatus: true
  })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          if (userData.notifications) {
            setNotifications(userData.notifications)
          }
          if (userData.privacy) {
            setPrivacy(userData.privacy)
          }
        }
      } catch (error) {
        console.error("Error fetching user settings:", error)
        setError("Failed to load settings")
      }
    }

    if (user) {
      fetchUserSettings()
    }
  }, [user, router])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!user) {
        router.push("/login")
        return
      }

      if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters long")
      }

      if (newPassword !== confirmPassword) {
        throw new Error("New passwords do not match")
      }

      // Reauthenticate user before changing password
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      )
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)

      setSuccess("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Error updating password:", error)
      if (error.code === "auth/wrong-password") {
        setError("Current password is incorrect")
      } else {
        setError(error.message || "Failed to update password")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationChange = async (key: string, value: boolean) => {
    if (!user) return

    try {
      const newNotifications = { ...notifications, [key]: value }
      setNotifications(newNotifications)

      const userRef = doc(db, "users", user.uid)
      await setDoc(userRef, {
        notifications: newNotifications,
        updatedAt: new Date().toISOString()
      }, { merge: true })
    } catch (error) {
      console.error("Error updating notification settings:", error)
      setError("Failed to update notification settings")
    }
  }

  const handlePrivacyChange = async (key: string, value: any) => {
    if (!user) return

    try {
      const newPrivacy = { ...privacy, [key]: value }
      setPrivacy(newPrivacy)

      const userRef = doc(db, "users", user.uid)
      await setDoc(userRef, {
        privacy: newPrivacy,
        updatedAt: new Date().toISOString()
      }, { merge: true })

      // If location sharing is disabled, remove coordinates
      if (key === "locationSharing" && !value) {
        const userDoc = await getDoc(userRef)
        if (userDoc.exists()) {
          const userData = userDoc.data()
          if (userData.location && userData.location.coordinates) {
            await setDoc(userRef, {
              location: {
                ...userData.location,
                coordinates: null
              }
            }, { merge: true })
          }
        }
      }
    } catch (error) {
      console.error("Error updating privacy settings:", error)
      setError("Failed to update privacy settings")
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    setIsDeleting(true)
    setError("")
    setSuccess("")

    try {
      // Delete user data from Firestore
      const userRef = doc(db, "users", user.uid)
      await deleteDoc(userRef)

      // Delete user from Firebase Authentication
      await deleteUser(user)

      // Redirect to home page
      router.push("/")
    } catch (error: any) {
      console.error("Error deleting account:", error)
      if (error.code === "auth/requires-recent-login") {
        setError("Please log out and log in again before deleting your account")
      } else {
        setError("Failed to delete account. Please try again.")
      }
      setIsDeleting(false)
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
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
                <Settings className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold text-gradient">Account Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences</p>
          </div>

          <div className="w-full">
            <motion.div
              className="glassmorphism rounded-xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Security Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-neon-blue" />
                  <h2 className="text-xl font-semibold">Security</h2>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-muted/50"
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
                      <Lock className="mr-2 h-4 w-4" />
                    )}
                    Update Password
                  </Button>
                </form>
              </div>

              {/* Notifications Section */}
              <div className="mt-8 space-y-6">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-neon-orange" />
                  <h2 className="text-xl font-semibold">Notifications</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <Switch
                      id="emailNotifications"
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <Switch
                      id="pushNotifications"
                      checked={notifications.push}
                      onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketingNotifications">Marketing Updates</Label>
                    <Switch
                      id="marketingNotifications"
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => handleNotificationChange("marketing", checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Section */}
              <div className="mt-8 space-y-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-neon-blue" />
                  <h2 className="text-xl font-semibold">Privacy</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="profileVisibility">Public Profile</Label>
                    <Switch
                      id="profileVisibility"
                      checked={privacy.profileVisibility === "public"}
                      onCheckedChange={(checked) => handlePrivacyChange("profileVisibility", checked ? "public" : "private")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="locationSharing">Share Location</Label>
                    <Switch
                      id="locationSharing"
                      checked={privacy.locationSharing}
                      onCheckedChange={(checked) => handlePrivacyChange("locationSharing", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="activityStatus">Show Activity Status</Label>
                    <Switch
                      id="activityStatus"
                      checked={privacy.activityStatus}
                      onCheckedChange={(checked) => handlePrivacyChange("activityStatus", checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-8 space-y-6">
                <div className="flex items-center space-x-2">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
              {success && <p className="mt-4 text-green-500 text-sm">{success}</p>}

              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard")}
                >
                  Back to Dashboard
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 