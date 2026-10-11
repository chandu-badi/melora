import type { Metadata } from "next";
export const metadata: Metadata = { title: "Melora — your everyday soundtrack", description: "Discover music and keep your favourites together." };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
