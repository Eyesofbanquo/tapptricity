"use client";

import { useState } from "react";

interface ShareButtonProps {
  code: string;
}

export function ShareButton({ code }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${window.location.origin}/expense-comparison/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 border border-silver rounded hover:bg-gray-100 transition-colors"
    >
      {copied ? "Copied!" : "Share Link"}
    </button>
  );
}
