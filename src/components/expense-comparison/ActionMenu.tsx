"use client";

import { useState, useRef, useEffect } from "react";

interface ActionMenuProps {
  saving: boolean;
  onSave: () => void;
  onShare: () => void;
  onUploadClick: () => void;
  onDownload: () => void;
  onDelete: () => void;
  hasRows: boolean;
}

export function ActionMenu({
  saving,
  onSave,
  onShare,
  onUploadClick,
  onDownload,
  onDelete,
  hasRows,
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const itemClass =
    "block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-sm";

  const firstItemClass = `${itemClass} rounded-t-lg`;

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 border border-silver rounded hover:bg-gray-100 transition-colors"
        aria-label="Actions menu"
      >
        <svg
          className="h-5 w-5 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-silver rounded-lg shadow-lg z-50">
          {hasRows && (
            <button
              onClick={() => { onSave(); setOpen(false); }}
              disabled={saving}
              className={`${firstItemClass} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          )}
          {!hasRows && (
            <button
              onClick={() => { onUploadClick(); setOpen(false); }}
              className={firstItemClass}
            >
              Upload Spreadsheet
            </button>
          )}
          <button
            onClick={() => { onShare(); setOpen(false); }}
            className={itemClass}
          >
            Share Link
          </button>
          {hasRows && (
            <button
              onClick={() => { onDownload(); setOpen(false); }}
              className={itemClass}
            >
              Download .xlsx
            </button>
          )}
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className={`${itemClass} rounded-b-lg text-crimson hover:bg-red-50`}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
