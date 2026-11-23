import type { Metadata } from "next";
import "@fontsource-variable/outfit";
import "@fontsource-variable/dm-sans";
import "./globals.css";
export const metadata: Metadata = {
  title: "CELL WARS — The Spreadsheet Challenge",
  description:
    "Master the Class 7 ICSE Introduction to Spreadsheet chapter with quizzes, quests, achievements and a live spreadsheet lab.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
