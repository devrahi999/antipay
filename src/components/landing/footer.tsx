'use client';

import Link from "next/link"
import { Facebook, MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-secondary/10 border-t py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-6">
            <Link href="/" className="inline-block">
              <img src="https://i.imgur.com/Chozuv5.png" alt="AntiPay" className="h-14 w-auto object-contain" />
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              Empowering businesses across Bangladesh with automated payment verification systems. Reliable, secure, and fast.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#features" className="hover:text-primary">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-primary">Pricing</Link></li>
              <li><Link href="/docs" className="hover:text-primary"Docs</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Social</h4>
            <div className="flex gap-4">
              <Link href="https://facebook.com" target="_blank" className="p-2 bg-secondary rounded-full hover:bg-primary hover:text-white transition-colors">
                <Facebook size={20} />
              </Link>
              <Link href="https://wa.me/yournumber" target="_blank" className="p-2 bg-secondary rounded-full hover:bg-primary hover:text-white transition-colors">
                <MessageCircle size={20} />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2024 AntiPay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
