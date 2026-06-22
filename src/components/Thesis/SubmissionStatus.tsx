"use client";

interface SubmissionStatusProps {
  isSubmitted: boolean;
}

export function SubmissionStatus({ isSubmitted }: SubmissionStatusProps) {
  return (
    <div className="flex justify-center items-center">
      <span className="text-2xl">{isSubmitted ? "🏆" : "📋"}</span>
    </div>
  );
}
