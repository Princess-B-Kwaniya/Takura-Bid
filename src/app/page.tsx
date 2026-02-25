'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const homeHref = user?.role === 'DRIVER' ? '/driver' : '/client'
  const profileHref = user?.role === 'DRIVER' ? '/driver/profile' : '/client/profile'

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#3f2a52] selection:text-white">
      {/* Floating Navbar */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6">
        <header className="w-full max-w-5xl bg-white/80 backdrop-blur-md border border-gray-100 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-8 py-4 flex items-center justify-between transition-all duration-300 hover:shadow-[0_8px_30px_rgb(63,42,82,0.08)] relative">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#3f2a52] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(63,42,82,0.3)]">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 18h16v6H8v-6zm2-4h12v3H10v-3z" fill="white"/>
                <circle cx="12" cy="26" r="2" fill="white"/>
                <circle cx="20" cy="26" r="2" fill="white"/>
                <path d="M14 12h4v2h-4v-2z" fill="white"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#3f2a52]">TakuraBid</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link href={homeHref} className="text-sm font-medium text-gray-600 hover:text-[#3f2a52] transition-colors">
                  Home
                </Link>
                <Link href={profileHref} className="text-sm font-medium text-white bg-[#3f2a52] px-5 py-2 rounded-full hover:bg-[#3f2a52]/90 transition-colors shadow-[0_4px_15px_rgba(63,42,82,0.25)]">
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-[#3f2a52] transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="text-sm font-medium text-white bg-[#3f2a52] px-5 py-2 rounded-full hover:bg-[#3f2a52]/90 transition-colors shadow-[0_4px_15px_rgba(63,42,82,0.25)]">
                  Get Started
                </Link>
              </>
            )}
          </nav>

          <div className="md:hidden">
             <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-8 h-8 flex flex-col justify-center items-center space-y-1.5 cursor-pointer group focus:outline-none"
             >
                <span className={`w-6 h-0.5 bg-gray-600 group-hover:bg-[#3f2a52] transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`w-4 h-0.5 bg-gray-600 group-hover:bg-[#3f2a52] transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`w-6 h-0.5 bg-gray-600 group-hover:bg-[#3f2a52] transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
             </button>
          </div>
        </header>
      </div>

      {/* Mobile Menu Drawer */}
       <div className={`fixed inset-0 z-40 bg-white/90 backdrop-blur-xl transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          {user ? (
            <>
              <Link
                href={homeHref}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-bold text-gray-900 hover:text-[#3f2a52] transition-colors"
              >
                Home
              </Link>
              <Link
                href={profileHref}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-bold text-gray-900 hover:text-[#3f2a52] transition-colors"
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-bold text-gray-900 hover:text-[#3f2a52] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-bold text-gray-900 hover:text-[#3f2a52] transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <main className="pt-40 pb-20 px-6">
        <section className="container mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center mb-24">
            <div className="inline-flex items-center px-4 py-2 bg-gray-50 border border-gray-100 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-[#3f2a52] mr-2 shadow-[0_0_10px_rgba(63,42,82,0.5)]"></span>
              <span className="text-xs font-semibold tracking-wide uppercase text-gray-500">Next Gen Procurement</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
              Transforming <br />
              <span className="relative">
                Procurement
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#3f2a52] to-transparent opacity-30"></span>
              </span>
              {' '}in Africa
            </h2>
            
            <p className="text-lg md:text-xl text-gray-500 max-w-3xl leading-relaxed mb-12">
              TakuraBid bridges the gap between buyers and suppliers with an intelligent, transparent, and secure marketplace infrastructure.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
              <Link
                href={user ? '/client' : '/auth/signup'}
                className="group relative overflow-hidden bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(63,42,82,0.15)] hover:border-[#3f2a52]/20 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col items-start text-left">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#3f2a52] transition-colors duration-300">
                    <svg className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Client Portal</h3>
                  <p className="text-gray-500 mb-6 text-sm">Post needs, evaluate bids, and manage suppliers efficiently.</p>
                  <span className="inline-flex items-center text-[#3f2a52] font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    {user ? 'Go to Dashboard' : 'Access System'} <span className="ml-2">→</span>
                  </span>
                </div>
              </Link>

              <Link
                href={user ? '/driver' : '/auth/signup'}
                className="group relative overflow-hidden bg-[#3f2a52] p-8 rounded-2xl shadow-[0_10px_40px_rgba(63,42,82,0.25)] hover:shadow-[0_20px_50px_rgba(63,42,82,0.35)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col items-start text-left">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Driver Portal</h3>
                  <p className="text-white/70 mb-6 text-sm">Unlock new opportunities and grow your delivery network.</p>
                  <span className="inline-flex items-center text-white font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    {user ? 'Go to Dashboard' : 'Join Network'} <span className="ml-2">→</span>
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto max-w-5xl py-20 border-t border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
             <div className="max-w-xl">
                <h3 className="text-sm font-bold text-[#3f2a52] uppercase tracking-wider mb-2">Capabilities</h3>
                <h2 className="text-3xl font-bold text-gray-900">Engineered for Efficiency</h2>
             </div>
             <p className="text-gray-500 max-w-sm text-sm mt-4 md:mt-0 text-right md:text-left">
                Advanced tools designed to streamline every aspect of the procurement lifecycle.
             </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[
               { title: "Real-Time Bidding", desc: "Live auction participation with instant competitor tracking.", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
               { title: "Smart Matching", desc: "AI-driven algorithms connecting buyers to optimal suppliers.", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
               { title: "Audit & Compliance", desc: "Immutable secure logging for all platform transactions.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
               { title: "Deep Analytics", desc: "Market intelligence and performance metric visualization.", icon: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" },
               { title: "Multi-Region", desc: "Seamless localized currency and regulatory support.", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
               { title: "Enterprise Security", desc: "Financial-grade data protection infrastructure.", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }
             ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 hover:border-[#3f2a52]/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center mb-4 text-gray-500 group-hover:text-[#3f2a52] group-hover:bg-[#3f2a52]/10 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
             ))}
          </div>
        </section>

        {/* Vision Section - Minimalist */}
        <section className="container mx-auto max-w-5xl py-20 border-t border-gray-100">
          <div className="bg-gray-900 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
             {/* Abstract Glow */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#3f2a52]/40 via-transparent to-transparent opacity-50"></div>
             
             <div className="relative z-10 max-w-2xl mx-auto">
               <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Elevating African Procurement.</h2>
               <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                 We envision a connected continent where efficiency and transparency are the standards, not the exceptions.
               </p>
             </div>
          </div>
        </section>
      </main>

      {/* Footer - Techy Minimal */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row justify-between items-center text-sm">
           <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="w-3 h-3 rounded-full bg-[#3f2a52]"></span>
              <span className="font-bold text-gray-900">TakuraBid</span>
              <span className="text-gray-400">© 2026</span>
           </div>
           
           <div className="flex space-x-8 text-gray-500 font-medium">
             <Link href="#" className="hover:text-[#3f2a52] transition-colors">Privacy</Link>
             <Link href="#" className="hover:text-[#3f2a52] transition-colors">Terms</Link>
             <Link href="#" className="hover:text-[#3f2a52] transition-colors">Contact</Link>
           </div>
        </div>
      </footer>
    </div>
  )
}