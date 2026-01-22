export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 50px -15px rgba(15, 23, 42, 0.25)",
        glow: "0 20px 60px -20px rgba(59, 130, 246, 0.35)"
      },
      borderRadius: {
        xl: "1.25rem"
      },
      backgroundImage: {
        "mesh": "radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.12) 0, transparent 45%), radial-gradient(circle at 90% 10%, rgba(129, 140, 248, 0.12) 0, transparent 55%), radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.12) 0, transparent 60%)"
      }
    }
  },
  plugins: []
};
