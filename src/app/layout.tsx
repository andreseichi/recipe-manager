import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { VercelAnalytics } from "@/components/vercel-analytics";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Baú de Receitas",
    template: "%s | Baú de Receitas",
  },
  description:
    "Organize suas receitas em um caderno pessoal, simples e bonito.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <VercelAnalytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
