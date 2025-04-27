import { create } from 'zustand'
import axios from '../lib/axios-custom'
import toast from 'react-hot-toast'
import { AuthUser } from '@/types'

type AuthState = {
  authUser: AuthUser | null
  isLoading: boolean
  error: string | null

  setAuthUser: (user: AuthUser | null) => void
  fetchAuthUser: () => Promise<void>
  login: (identifier: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<void> // New method
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  authUser: null,
  isLoading: false,
  error: null,

  setAuthUser: (user) => set({ authUser: user }),

  fetchAuthUser: async () => {
    set({ isLoading: true })
    try {
      const res = await axios.get('/api/user/my-info')
      console.log(res.data.result)
      set({ authUser: res.data.result })
    } catch (error) {
      console.error(error)
    } finally {
      set({ isLoading: false })
    }
  },

  login: async (identifier: string, password: string) => {
    set({ isLoading: true })
    try {
      await axios.post('/api/auth/login', { identifier, password })
      await useAuthStore.getState().fetchAuthUser()
      toast.success('Logged in successfully')
    } catch (error: unknown) {
      console.log(error)
      toast.error('Wrong identifier or password. Please try again')
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (username: string, email: string, password: string, confirmPassword: string) => {
    set({ isLoading: true })
    try {
      const registerData = { username, email, password, confirmPassword }
      await axios.post('/api/auth/register', registerData)
      toast.success('Registered successfully')
    } catch (error: unknown) {
      console.log(error)
      toast.error('Registration failed. Please try again')
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await axios.post('/api/auth/logout')
      set({ authUser: null })
      toast.success('Logged out successfully')
    } catch (error: unknown) {
      console.log(error)
      toast.error('Something went wrong')
    } finally {
      set({ isLoading: false })
    }
  },
  forgotPassword: async (email: string) => {
    set({ isLoading: true })
    try {
      const response = await axios.post("/api/auth/forgot-password", { email })
      toast.success(response.data.result.message || "Reset password link sent to your email")
    } catch (error: unknown) {
      console.log(error)
      toast.error("Failed to send reset password link. Please try again")
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  resetPassword: async (token: string, password: string, confirmPassword: string) => {
    set({ isLoading: true })
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const email = searchParams.get("email");
  
      if (!email) {
        throw new Error("Email is required");
      }
  
      const response = await axios.post("/api/auth/reset-password", {
        token,
        email, // Add email to the request payload
        password,
        confirmPassword,
      });
      toast.success(response.data.result.message || "Password reset successful")
    } catch (error: unknown) {
      console.log(error)
      toast.error("Failed to reset password. Please try again")
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

}))
