"use client";

import { useState } from "react";

interface SaveButtonProps {
  onSave: () => void;
}

export function SaveButton({ onSave }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <button
      onClick={handleSave}
      className="px-4 py-2 border border-silver rounded hover:bg-gray-100 transition-colors"
    >
      {saved ? "Saved!" : "Save"}
    </button>
  );
}
