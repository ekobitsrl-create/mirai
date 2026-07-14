"use client"

import Link from "next/link"

export function WhatsAppButton() {
  return (
    <Link
      href="https://wa.me/393456141901?text=Ciao%2C%20vorrei%20informazioni%20sui%20vostri%20prodotti"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contattaci su WhatsApp"
      className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-lg hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-all duration-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-7 h-7 fill-white"
        aria-hidden="true"
      >
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.962a15.93 15.93 0 0 0 8.832 2.672C24.826 31.999 32 24.824 32 16.004 32 7.176 24.826 0 16.004 0zm9.53 22.606c-.4 1.13-2.352 2.16-3.276 2.238-.876.074-1.682.396-5.67-1.18-4.812-1.904-7.874-6.836-8.112-7.152-.23-.316-1.906-2.536-1.906-4.836s1.206-3.428 1.636-3.898c.43-.468.938-.586 1.25-.586.312 0 .626.002.898.016.29.016.676-.11 1.058.806.396.952 1.346 3.284 1.462 3.52.12.236.196.512.04.828-.158.316-.236.512-.47.788-.236.276-.496.618-.708.828-.236.236-.482.49-.208.96s1.222 2.02 2.626 3.272c1.804 1.608 3.326 2.108 3.796 2.344.47.236.744.196 1.018-.118.276-.316 1.176-1.372 1.49-1.842.314-.468.628-.39 1.058-.234.432.158 2.762 1.302 3.232 1.538.47.236.784.354.9.548.118.196.118 1.128-.282 2.258z" />
      </svg>
    </Link>
  )
}
