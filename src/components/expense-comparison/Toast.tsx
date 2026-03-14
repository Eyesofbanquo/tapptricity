export function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg transition-opacity">
      {message}
    </div>
  );
}
