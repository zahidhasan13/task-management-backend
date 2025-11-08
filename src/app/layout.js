"use client";
import { Provider } from "react-redux";
import store from "@/redux/store";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // ✅ Pages where header should NOT show
  const hideHeaderOn = ["/login", "/signup"];

  const showHeader = !hideHeaderOn.includes(pathname);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Provider store={store}>
          {showHeader && <Header />}
          {children}
        </Provider>
      </body>
    </html>
  );
}
