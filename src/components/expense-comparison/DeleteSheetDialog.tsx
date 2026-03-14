"use client";

interface DeleteSheetDialogProps {
  open: boolean;
  sheetName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteSheetDialog({ open, sheetName, onConfirm, onCancel }: DeleteSheetDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg border border-silver p-6 max-w-sm w-full mx-4 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Sheet</h2>
        <p className="text-gray-600 mb-6">
          Delete the entire sheet &ldquo;{sheetName}&rdquo;? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-silver rounded hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-crimson text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
