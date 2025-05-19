import { create } from "zustand"
import axios from "@/lib/axios-custom"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface ChatState {
  isOpen: boolean
  messages: Message[]
  inputValue: string
  isLoading: boolean

  toggleChat: () => void
  setInputValue: (value: string) => void
  sendMessage: (message: string) => Promise<void>
  clearMessages: () => void
}

const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  messages: [],
  inputValue: "",
  isLoading: false,

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

  setInputValue: (value: string) => set({ inputValue: value }),

  sendMessage: async (message: string) => {
    if (!message.trim()) return

    // Generate a unique ID for the message
    const messageId = Date.now().toString()

    // Add user message to the chat
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: messageId,
          content: message,
          isUser: true,
          timestamp: new Date(),
        },
      ],
      inputValue: "",
      isLoading: true,
    }))

    try {
      // Send the message to the backend
      const response = await axios.post("/api/chatbot/ask", null, {
        params: { prompt: message },
      })

      console.log(response)

      // Add the bot's response to the chat
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: `response-${messageId}`,
            content: response.data.result,
            isUser: false,
            timestamp: new Date(),
          },
        ],
        isLoading: false,
      }))
    } catch (error) {
      console.error("Error sending message to chatbot:", error)

      // Add an error message
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: `error-${messageId}`,
            content: "Sorry, I encountered an error. Please try again later.",
            isUser: false,
            timestamp: new Date(),
          },
        ],
        isLoading: false,
      }))
    }
  },

  clearMessages: () => set({ messages: [] }),
}))

export default useChatStore
