// Mock authentication state
export type AuthState = {
  isLoggedIn: boolean
  hasSeenOnboarding: boolean
  user: {
    name: string
    email: string
    avatar?: string
  } | null
}

export const initialAuthState: AuthState = {
  isLoggedIn: false,
  hasSeenOnboarding: false,
  user: null,
}

// Mock users for demo
export const MOCK_USERS = [
  {
    name: "Alex Johnson",
    email: "alex@company.com",
  },
  {
    name: "Sam Smith",
    email: "sam@company.com",
  },
  {
    name: "Jordan Lee",
    email: "jordan@company.com",
  },
]
