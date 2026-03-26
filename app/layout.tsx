import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MerchantFloat — Your POS data is your credit score",
  description: "Working capital loans for Nigerian merchants. Based on 90 days of verified Interswitch transaction data. No collateral. No guarantors. Decision in 60 seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
