interface Props {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: Props) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-silver rounded-full overflow-hidden">
        <div
          className="h-full bg-crimson rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm text-gray-500 whitespace-nowrap">
        {pct}% complete
      </span>
    </div>
  );
}
