"use client";

import { InfoStep as InfoStepType } from "@/types/workflow";

interface Props {
  step: InfoStepType;
  completed: boolean;
  onMarkRead: () => void;
}

export function InfoStep({ step, completed, onMarkRead }: Props) {
  return (
    <div>
      {step.description && (
        <p className="text-gray-600 mb-4">{step.description}</p>
      )}
      <div className="prose prose-sm max-w-none mb-6">
        {step.content.split("\n\n").map((paragraph, i) => (
          <p key={i} className="mb-3 leading-relaxed">
            {paragraph.split("\n").map((line, j) => (
              <span key={j}>
                {line.startsWith("- **") ? (
                  <>
                    <br />
                    <span
                      dangerouslySetInnerHTML={{
                        __html: line
                          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                          .replace(/^- /, ""),
                      }}
                    />
                  </>
                ) : (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: line.replace(
                        /\*\*(.+?)\*\*/g,
                        "<strong>$1</strong>"
                      ),
                    }}
                  />
                )}
                {j < paragraph.split("\n").length - 1 && !line.startsWith("- ") && <br />}
              </span>
            ))}
          </p>
        ))}
      </div>
      <button
        onClick={onMarkRead}
        className={`px-4 py-2 rounded transition-colors ${
          completed
            ? "bg-sky-light/50 text-steel border border-steel"
            : "bg-crimson text-snow hover:bg-crimson/90"
        }`}
      >
        {completed ? "Marked as Read" : "Mark as Read"}
      </button>
    </div>
  );
}
