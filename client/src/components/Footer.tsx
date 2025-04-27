"use client";
// components/Footer.tsx
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Logo } from "@/components/Logo";
import { Bounded } from "./Bounded";
import { FooterPhysics } from "./FooterPhysics";

// Example static data to replace Prismic
const footerImage = "/images/bgfooter.png"; // Replace with your actual image path
const footerPerfumes = [
  "/images/perfume-1.png",
  "/images/perfume-2.png",
  "/images/perfume-3.png",
  "/images/perfume-4.png",
  "/images/perfume-5.png",
  "/images/perfume-6.png",
  "/images/perfume-7.png",
  "/images/perfume-8.png",
  "/images/perfume-9.png",
]; // Replace with actual image paths

const navigation = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-texture bg-zinc-900 text-white overflow-hidden">
      <div className="relative h-[75vh] p-10">
        <Image
          src={footerImage}
          alt=""
          fill
          className="object-cover"
          priority
        />
        <FooterPhysics
          boardTextureURLs={footerPerfumes}
          className="absolute inset-0 overflow-hidden"
        />
        <Logo className="pointer-events-none relative h-20 mix-blend-exclusion md:h-28" />
      </div>

      <Bounded as="nav">
        <ul className="flex flex-wrap justify-center gap-8 text-lg">
          {navigation.map((item) => (
            <li key={item.label} className="hover:underline">
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </Bounded>
    </footer>
  );
}
