import React from 'react'
import './style.css'
import { Cairo } from 'next/font/google'

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  weight:['400','700'],
  display:'swap'
})

export const metadata = {
  title: "Waffer - وفر",
  description: "تتبع اقرب العروض ووفر مع وفر",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={cairo.className}>
      <body id='app-container'>
        {children}
      </body>
    </html>
  );
}
