import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduNavigator AI — Your Personal Academic Mentor",
  description:
    "An AI-powered academic assistant tailored to your engineering branch. Upload syllabi, get personalized study plans, and chat with an intelligent tutor.",
  keywords: ["AI tutor", "engineering assistant", "study planner", "RAG chatbot"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
