"use client";

import Link from "next/link";

interface Props {
  slug: string;
  stepIndex: number;
  totalSteps: number;
  canProceed: boolean;
  skippable?: boolean;
  onSkip?: () => void;
}

export function StepNav({ slug, stepIndex, totalSteps, canProceed, skippable, onSkip }: Props) {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  return (
    <div className="flex items-center justify-between pt-6 border-t border-silver mt-6">
      {!isFirst ? (
        <Link
          href={`/workflow/${slug}/step/${stepIndex - 1}`}
          className="px-4 py-2 border border-steel text-steel rounded hover:bg-steel hover:text-white transition-colors"
        >
          Previous
        </Link>
      ) : (
        <div />
      )}

      <div className="flex gap-2">
        {skippable && !canProceed && (
          <button
            onClick={onSkip}
            className="px-4 py-2 border border-silver text-gray-500 rounded hover:bg-silver/50 transition-colors"
          >
            Skip
          </button>
        )}

        {!isLast ? (
          <Link
            href={canProceed ? `/workflow/${slug}/step/${stepIndex + 1}` : "#"}
            className={`px-4 py-2 rounded transition-colors ${
              canProceed
                ? "bg-crimson text-snow hover:bg-crimson/90"
                : "bg-silver text-gray-400 cursor-not-allowed"
            }`}
            onClick={(e) => !canProceed && e.preventDefault()}
          >
            Next
          </Link>
        ) : (
          <Link
            href={`/workflow/${slug}/step/0`}
            className={`px-4 py-2 rounded transition-colors ${
              canProceed
                ? "bg-crimson text-snow hover:bg-crimson/90"
                : "bg-silver text-gray-400 cursor-not-allowed"
            }`}
            onClick={(e) => !canProceed && e.preventDefault()}
          >
            Finish
          </Link>
        )}
      </div>
    </div>
  );
}
