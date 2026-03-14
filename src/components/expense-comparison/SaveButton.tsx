"use client";

interface SaveButtonProps {
  saving: boolean;
  onSave: () => void;
}

export function SaveButton({ saving, onSave }: SaveButtonProps) {
  return (
    <button
      onClick={onSave}
      disabled={saving}
      className="px-4 py-2 border border-silver rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {saving ? (
        <svg
          className="animate-spin h-5 w-5 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        "Save"
      )}
    </button>
  );
}
