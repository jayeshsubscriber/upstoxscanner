import { ChevronUp } from "lucide-react";

interface Props {
  signalCount: number;
  onTap: () => void;
}

export function StickyActionPill({ signalCount, onTap }: Props) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
      <button
        type="button"
        onClick={onTap}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background shadow-lg shadow-foreground/15 hover:shadow-xl transition-all active:scale-95"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
        </span>
        <span className="text-xs font-bold">
          {signalCount} stocks moving
        </span>
        <ChevronUp className="w-3.5 h-3.5 opacity-60" />
      </button>
    </div>
  );
}
