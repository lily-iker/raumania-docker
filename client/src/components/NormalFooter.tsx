"use client";

import React from "react";

export function NormalFooter() {
  return (
    <footer className="bg-black py-16 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div>
            <h3 className="mb-4 font-serif text-xl font-light tracking-wide text-white">
              RAUMANIA
            </h3>
            <p className="text-sm font-light text-gray-400">
              Discover the art of fragrance with our curated collection of premium scents.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-white">
              Shop
            </h4>
            <ul className="space-y-2 text-sm font-light text-gray-400">
              {["All Fragrances", "New Arrivals", "Best Sellers", "Gift Sets"].map((item) => (
                <li key={item}>
                  <a href="#" className="transition-colors hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-white">
              Support
            </h4>
            <ul className="space-y-2 text-sm font-light text-gray-400">
              {["Contact Us", "FAQs", "Shipping & Returns", "Track Order"].map((item) => (
                <li key={item}>
                  <a href="#" className="transition-colors hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-white">
              Newsletter
            </h4>
            <p className="mb-4 text-sm font-light text-gray-400">
              Subscribe to receive updates on new arrivals and special offers.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="w-full rounded-l-full bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-pink-300"
              />
              <button className="rounded-r-full bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-pink-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm font-light text-gray-500">
          <p>© {new Date().getFullYear()} Raumania Fragrance. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
