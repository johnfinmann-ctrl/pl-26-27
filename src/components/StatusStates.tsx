export function LoadingState({ label }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 py-16 text-elp-muted"
    >
      <div
        className="h-8 w-8 rounded-full border-2 border-elp-muted border-t-elp-green animate-spin motion-reduce:animate-none"
        aria-hidden="true"
      />
      <p>{label ?? "Indlæser data …"}</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="mx-4 my-8 rounded-xl border border-elp-danger/40 bg-elp-danger/10 p-4"
    >
      <h2 className="font-semibold text-elp-danger mb-1">
        Data kunne ikke indlæses
      </h2>
      <p className="text-sm text-elp-text/90 mb-1">
        Hvad der mangler: gyldigt liga-datasæt (hold/kampprogram).
      </p>
      <p className="text-sm text-elp-text/90 mb-1">Datakilde: demo</p>
      <p className="text-sm text-elp-text/90 mb-3 break-words">
        Detaljer: {message}
      </p>
      <button
        onClick={onRetry}
        className="focus-ring min-h-touch min-w-touch rounded-lg bg-elp-green px-4 py-2 font-medium text-elp-bg"
      >
        Prøv igen
      </button>
    </div>
  );
}
