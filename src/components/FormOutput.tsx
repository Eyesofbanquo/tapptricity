"use client";

import { useState } from "react";

interface Props {
  title: string;
  text: string;
}

export function FormOutput({ title, text }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-silver rounded-lg p-4 mt-4">
      <h3 className="font-semibold text-steel mb-2">{title}</h3>
      <pre className="bg-snow border border-silver rounded p-3 text-sm whitespace-pre-wrap font-serif mb-3">
        {text}
      </pre>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-sm bg-crimson text-snow rounded hover:bg-crimson/90 transition-colors"
        >
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
        <button
          onClick={handleDownload}
          className="px-3 py-1.5 text-sm border border-steel text-steel rounded hover:bg-steel hover:text-white transition-colors"
        >
          Download
        </button>
      </div>
    </div>
  );
}
