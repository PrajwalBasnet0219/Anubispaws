"use client";
import React from "react"; 
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import BlurryBlob from "../background/blurry-blob"; // adjust path
import FooterEmailInput from "../footer/FooterEmailInput"; 

export default function Footer() {
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;

      setShowFooter(scrollPosition >= pageHeight - 200);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: showFooter ? 1 : 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden text-gray-200"
    >
<div className="absolute -top-30 left-1/2 -translate-x-1/2 z-0">
  <BlurryBlob
    className="animate-pop-blob"
    firstBlobColor="bg-blue-400"
    secondBlobColor="bg-purple-400"
  />
</div>
      {/* Footer Content */}
      <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-6 px-6 py-20">
        {/* Left Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Image src="/images/logo.png" alt="Logo" width={40} height={40} />
            <span className="font-bold text-lg">AnubisPaws</span>
          </div>
          <ul className="flex flex-col gap-4">
            {["Company FAQ", "Recent Updates", "About Us"].map((item) => (
              <li
                key={item}
                className="hover:text-white hover:drop-shadow-[0_0_3px_white] transition-all duration-300 cursor-pointer"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Middle Section */}
        {/* <div className="flex flex-col gap-4">
          <span className="font-semibold">Support</span>
          <ul className="flex flex-col gap-4">
            {["Messenger", "Facebook", "Discord"].map((item) => (
              <li
                key={item}
                className="hover:text-white hover:drop-shadow-[0_0_3px_white] transition-all duration-300 cursor-pointer"
              >
                {item}
              </li>
            ))}
          </ul>
        </div> */}
            <div className="flex flex-col gap-4">
          <span className="font-semibold">About your pets</span>
          <ul className="flex flex-col gap-4">
            {[ "Marketplace", "Features"].map((item) => (
              <li
                key={item}
                className="hover:text-white hover:drop-shadow-[0_0_3px_white] transition-all duration-300 cursor-pointer"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        {/* Right Section */}
        <div className="flex flex-col gap-4">
          <span className="font-semibold">Navigation</span>
          <ul className="flex flex-col gap-4">
            {["Features", "Marketplace", "Adoption",].map((item) => (
              <li
                key={item}
                className="hover:text-white hover:drop-shadow-[0_0_3px_white] transition-all duration-300 cursor-pointer"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <FooterEmailInput />
      {/* Bottom Bar */}
<div className="mt-8 flex flex-col py-10 md:flex-row justify-center items-center border-t border-gray-500 pt-4">
  <div className="flex gap-4 items-center">
    {/* Social links */}
    <Link href="https://twitter.com" target="_blank" className="hover:text-white hover:drop-shadow-[0_0_3px_white] transition-all duration-300">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4 0c-.9.54-1.9.92-3 .98A4.52 4.52 0 0016.3 0a4.48 4.48 0 00-4.48 4.48c0 .35.04.7.12 1.03A12.78 12.78 0 013 1.6a4.48 4.48 0 001.38 5.97 4.41 4.41 0 01-2.03-.56v.06a4.48 4.48 0 003.6 4.39c-.54.14-1.12.17-1.71.06a4.48 4.48 0 004.18 3.12A9 9 0 010 19.54 12.72 12.72 0 006.92 21c8.3 0 12.85-6.88 12.85-12.85 0-.2 0-.4-.01-.6A9.2 9.2 0 0023 3z"/>
      </svg>
    </Link>

    <Link href="https://www.facebook.com/rei.kuozaki/" target="_blank" className="hover:text-white hover:drop-shadow-[0_0_3px_white] transition-all duration-300">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12a10 10 0 10-11.5 9.95v-7.05h-2.8v-2.9h2.8V9.8c0-2.77 1.65-4.3 4.18-4.3 1.21 0 2.48.22 2.48.22v2.72h-1.39c-1.37 0-1.8.86-1.8 1.74v2.07h3.07l-.49 2.9h-2.58v7.05A10 10 0 0022 12z"/>
      </svg>
    </Link>

    <Link href="https://www.instagram.com/rei.kuozaki" target="_blank" className="hover:text-white hover:drop-shadow-[0_0_3px_white] transition-all duration-300">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.16c3.2 0 3.584.012 4.85.07 1.17.055 1.97.24 2.43.403a4.92 4.92 0 011.78 1.04 4.92 4.92 0 011.04 1.78c.163.46.348 1.26.403 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.055 1.17-.24 1.97-.403 2.43a4.92 4.92 0 01-1.04 1.78 4.92 4.92 0 01-1.78 1.04c-.46.163-1.26.348-2.43.403-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.055-1.97-.24-2.43-.403a4.92 4.92 0 01-1.78-1.04 4.92 4.92 0 01-1.04-1.78c-.163-.46-.348-1.26-.403-2.43C2.172 15.584 2.16 15.2 2.16 12s.012-3.584.07-4.85c.055-1.17.24-1.97.403-2.43a4.92 4.92 0 011.04-1.78 4.92 4.92 0 011.78-1.04c.46-.163 1.26-.348 2.43-.403C8.416 2.172 8.8 2.16 12 2.16zm0-2.16C8.736 0 8.332.014 7.052.072 5.74.13 4.663.35 3.78.69a7.078 7.078 0 00-2.55 1.66 7.078 7.078 0 00-1.66 2.55c-.34.883-.56 1.96-.618 3.272C-.014 8.332 0 8.736 0 12s.014 3.668.072 4.948c.058 1.312.278 2.389.618 3.272a7.078 7.078 0 001.66 2.55 7.078 7.078 0 002.55 1.66c.883.34 1.96.56 3.272.618C8.332 23.986 8.736 24 12 24s3.668-.014 4.948-.072c1.312-.058 2.389-.278 3.272-.618a7.078 7.078 0 002.55-1.66 7.078 7.078 0 001.66-2.55c.34-.883.56-1.96.618-3.272C23.986 15.668 24 15.264 24 12s-.014-3.668-.072-4.948c-.058-1.312-.278-2.389-.618-3.272a7.078 7.078 0 00-1.66-2.55 7.078 7.078 0 00-2.55-1.66c-.883-.34-1.96-.56-3.272-.618C15.668.014 15.264 0 12 0z"/>
        <path d="M12 5.838a6.162 6.162 0 106.162 6.162A6.162 6.162 0 0012 5.838zm0 10.162a3.999 3.999 0 113.999-3.999A4.004 4.004 0 0112 16z"/>
        <circle cx="18.406" cy="5.594" r="1.44"/>
      </svg>
    </Link>

    {/* <Link
  href="https://discord.com"
  target="_blank"
  className="hover:text-white hover:drop-shadow-[0_0_3px_white] transition-all duration-300"
>
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 245 240"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M104.4 104.9c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.2-5 10.2-11.1s-4.5-11.1-10.2-11.1zM140.9 104.9c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.2-5 10.2-11.1s-4.5-11.1-10.2-11.1z"/>
    <path d="M189.5 20h-134C44.2 20 35 29.2 35 40.6v158.8c0 11.4 9.2 20.6 20.5 20.6h113.4l-5.3-18.6 12.8 11.9 12.1 11.1 21.5 18.9V40.6c0-11.4-9.2-20.6-20.5-20.6zm-38.6 135.8s-3.6-4.3-6.6-8.1c13.1-3.7 18.1-11.9 18.1-11.9-4.1 2.7-8 4.6-11.6 5.9-5 2.1-9.8 3.5-14.5 4.3-9.6 1.8-18.4 1.3-25.9-.1-5.7-1.1-10.6-2.7-14.7-4.3-2.3-.9-4.9-2.1-7.5-3.7-.3-.2-.6-.3-.9-.5-.2-.1-.3-.2-.4-.3-1.8-1-2.8-1.7-2.8-1.7s4.8 8 17.5 11.8c-3 3.8-6.7 8.2-6.7 8.2-22.1-.7-30.5-15.2-30.5-15.2 0-32.2 14.4-58.3 14.4-58.3 14.4-10.8 28.1-10.5 28.1-10.5l1 1.2c-18 5.2-26.3 13.2-26.3 13.2s2.2-1.2 5.9-2.9c10.7-4.7 19.2-6 22.7-6.3.6-.1 1.1-.2 1.7-.2 6.1-.8 13-1 20.2-.2 9.5 1.1 19.7 3.9 30.1 9.6 0 0-7.9-7.5-24.9-12.7l1.4-1.6s13.7-.3 28.1 10.5c0 0 14.4 26.1 14.4 58.3 0-.1-8.4 14.4-30.6 15.1z"/>
  </svg>
</Link> */}

    {/* Policies / Support */}
    <Link href="#" className="hover:text-white hover:drop-shadow-[0_0_3px_white] transition-all duration-300">Privacy Policy</Link>
    <Link href="#" className="hover:text-white hover:drop-shadow-[0_0_3px_white] transition-all duration-300">Terms & Conditions</Link>
    <Link href="#" className="hover:text-white hover:drop-shadow-[0_0_3px_white] transition-all duration-300">Support</Link>
  </div>

  <div className="mt-4 md:mt-0">© 2025, All rights reserved</div>
</div>
    </motion.footer>
  );
}
