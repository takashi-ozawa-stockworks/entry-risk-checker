"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AccordionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Accordion({
  title,
  defaultOpen = false,
  children,
  className = "",
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between font-bold text-gray-700 hover:bg-gray-100 transition"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && (
        <div className="p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
