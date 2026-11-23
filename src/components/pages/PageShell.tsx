import { ReactNode } from "react";

interface PageShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

// Shared layout for internal pages (history, downloads, bookmarks, settings).
export function PageShell({ title, description, actions, children }: PageShellProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-zinc-950 px-6 py-8 text-zinc-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
            {description && <p className="mt-1 text-xs text-zinc-400">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 px-6 py-12 text-center text-sm text-zinc-500">
      {message}
    </div>
  );
}

export const SECONDARY_BUTTON_CLASS =
  "rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-zinc-900/70";