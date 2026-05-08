export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[40vh] w-full max-w-6xl items-center justify-center px-6">
      <span
        aria-hidden
        className="border-foreground/15 size-8 animate-spin rounded-full border-2 border-t-foreground"
      />
      <span className="sr-only">Загрузка…</span>
    </div>
  );
}
