import { EmptyState } from "./EmptyState";
import "./EmptyState.css";

export interface ErrorStateProps {
  /** What went wrong, e.g. "Couldn’t Load Messages". */
  title: string;
  /** What the person can do about it. */
  description?: string;
  /** Title of the retry button; the button shows only with `onRetry`. */
  retryLabel?: string;
  onRetry?: () => void;
  /** Disable the retry button while a new attempt runs (it shows a spinner). */
  retrying?: boolean;
  testId?: string;
}

/** Error placeholder: EmptyState styling with exclamationmark.triangle and an optional retry action. */
export function ErrorState({ title, description, retryLabel, onRetry, retrying, testId }: ErrorStateProps) {
  return (
    <div className="dph-error" role="alert" data-testid={testId}>
      <EmptyState
        icon="exclamationmark.triangle"
        title={title}
        description={description}
        actions={onRetry && retryLabel ? [{ label: retryLabel, onPress: onRetry, loading: retrying }] : undefined}
      />
    </div>
  );
}
