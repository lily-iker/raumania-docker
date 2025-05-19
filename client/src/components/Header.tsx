'use client' // Required because we're using useState

import Link from 'next/link'
import React, { useState } from 'react' // Import useState
import { ButtonLink } from './ButtonLink'
import { Logo } from './Logo'
import { FaX } from 'react-icons/fa6' // Using react-icons like the example
import { CgMenu } from 'react-icons/cg' // Using react-icons like the example
import { FaUser, FaShoppingBag, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa' // Added dashboard icon
import axios from '@/lib/axios-custom'
import { useAuthStore } from '@/stores/useAuthStore'

export function Header() {
  // State to manage mobile menu visibility
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // State to manage avatar dropdown visibility
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false)

  // Get auth state from the store
  const { authUser, fetchAuthUser } = useAuthStore()

  // Fetch user data on component mount
  React.useEffect(() => {
    fetchAuthUser()
  }, [fetchAuthUser])

  const navigation = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/search' }, // Kept original /search href
    { label: 'Contact', href: '/contact' },
  ]

  // User menu options - conditionally add admin dashboard if user is admin
  const userMenuOptions = [
    ...(authUser?.role === 'ADMIN'
      ? [{ label: 'Admin Dashboard', href: '/admin', icon: <FaTachometerAlt className="mr-2" /> }]
      : []),
    { label: 'Profile', href: '/profile', icon: <FaUser className="mr-2" /> },
    { label: 'Orders', href: '/orders', icon: <FaShoppingBag className="mr-2" /> },
  ]

  // Logout function
  const handleLogoutAndRedirect = async () => {
    try {
      await axios.post('/api/auth/logout')
      window.location.reload()
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.avatar-dropdown')) {
        setAvatarDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="header absolute left-0 right-0 top-0 z-50 ~h-32/48 ~px-4/6 ~py-4/6 hd:h-32">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[auto,1fr,auto] items-center gap-6 md:grid-cols-[1fr,auto,1fr]">
        {/* Logo */}
        <Link href="/" className="col-start-1 justify-self-start">
          {/* Original class */}
          <Logo className="text-brand-pinkbutton ~h-16/24" />
        </Link>

        {/* Desktop Navigation (Hidden on Mobile) */}
        <nav
          aria-label="Main"
          // Original classes ensuring correct placement on desktop, plus hidden on mobile
          className="col-span-1 col-start-2 row-start-1 hidden md:block"
        >
          <ul className="flex flex-wrap items-center justify-center ~gap-8/16">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="~text-2xl/3xl hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Cart Button and Avatar (Hidden on Mobile) */}
        <div className="col-start-3 justify-self-end hidden md:flex items-center gap-16">
          {/* Avatar Dropdown */}
          <div className="relative avatar-dropdown">
            <button
              className="flex items-center justify-center bg-[#f8f5f1] hover:bg-[#f0e6d6] text-[#d4a6a6] rounded-full size-16 transition-colors"
              onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
              aria-expanded={avatarDropdownOpen}
              aria-label="User menu"
            >
              <FaUser className="size-8" />
            </button>

            {/* Dropdown Menu */}
            {avatarDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-[#e5e0d5]">
                {authUser ? (
                  <>
                    {userMenuOptions.map((option) => (
                      <Link
                        key={option.href}
                        href={option.href}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#f8f5f1]"
                        onClick={() => setAvatarDropdownOpen(false)}
                      >
                        {option.icon}
                        {option.label}
                      </Link>
                    ))}
                    <button
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#f8f5f1]"
                      onClick={handleLogoutAndRedirect}
                    >
                      <FaSignOutAlt className="mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#f8f5f1]"
                    onClick={() => setAvatarDropdownOpen(false)}
                  >
                    <FaSignOutAlt className="mr-2" />
                    Login
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Original ButtonLink */}
          <ButtonLink href="/cart" icon="cart" color="pink" aria-label="Cart" size="lg">
            {/* Keep original content structure for desktop */}
            <span className="hidden md:inline">Cart</span>
          </ButtonLink>
        </div>

        {/* Mobile Menu Button (Visible on Mobile Only) */}
        <div className="col-start-3 row-start-1 flex items-center justify-self-end md:hidden">
          {/* Mobile cart icon next to menu button */}

          <button
            className="z-50 p-2" // Added padding for easier clicking
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen} // Good for accessibility
          >
            {mobileMenuOpen ? (
              <FaX className="h-6 w-6" /> // Example size, adjust if needed
            ) : (
              <CgMenu className="h-6 w-6" /> // Example size, adjust if needed
            )}
          </button>
        </div>
      </div>

      {/* --- Mobile Menu Overlay --- */}
      {/* Appears only on mobile when mobileMenuOpen is true */}
      <div
        className={`fixed inset-0 z-40 bg-white bg-opacity-95 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex h-full flex-col items-center justify-center">
          <nav aria-label="Mobile navigation">
            <ul className="flex flex-col items-center justify-center gap-8 text-2xl">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:underline"
                    // Close menu on link click
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

              {/* User menu options for mobile */}
              <li className="w-full border-t border-[#e5e0d5] pt-8 mt-4"></li>

              {authUser ? (
                <>
                  {userMenuOptions.map((option) => (
                    <li key={option.href}>
                      <Link
                        href={option.href}
                        className="flex items-center hover:underline"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {React.cloneElement(option.icon, {
                          className: 'mr-2 h-5 w-5 text-[#d4a6a6]',
                        })}
                        {option.label}
                      </Link>
                    </li>
                  ))}

                  <li>
                    <button
                      className="flex items-center hover:underline"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        handleLogoutAndRedirect()
                      }}
                    >
                      <FaSignOutAlt className="mr-2 h-5 w-5 text-[#d4a6a6]" />
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    href="/login"
                    className="flex items-center hover:underline"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaSignOutAlt className="mr-2 h-5 w-5 text-[#d4a6a6]" />
                    Login
                  </Link>
                </li>
              )}

              {/* Mobile Cart Button Link */}
              <li className="mt-8">
                <ButtonLink
                  href="/cart"
                  icon="cart"
                  color="pink" // Keep original color
                  aria-label="Cart"
                  size="lg" // Keep original size
                  // Close menu on link click
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cart
                </ButtonLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
