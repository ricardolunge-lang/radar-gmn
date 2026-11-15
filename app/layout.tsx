import "./globals.css";
import type { ReactNode } from "react";

export const metadata = { title: "Radar GMN · Braza Labz", description: "Prospecção por Google Meu Negócio" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
