import { memo } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "../ui/dialog";
import { useCopyToClipboard } from "~/hooks/useCopyToClipboard";
import { cn } from "~/lib/utils";
import type { WorkLogRawResult } from "../../session-logic";

interface ToolResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  result: WorkLogRawResult;
}

export const ToolResultDialog = memo(function ToolResultDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  result,
}: ToolResultDialogProps) {
  const { copyToClipboard, isCopied } = useCopyToClipboard({ timeout: 1500 });

  const hasExitCode = result.exitCode !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup
        className="max-h-[min(80vh,720px)] max-w-[min(960px,calc(100vw-2rem))] sm:max-w-[min(960px,calc(100vw-2rem))]"
        showCloseButton={true}
      >
        <DialogHeader className="pb-2">
          <div className="flex items-start justify-between gap-3 pr-10">
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-base">{title}</DialogTitle>
              {subtitle && (
                <DialogDescription className="mt-1 max-w-full break-all font-mono text-xs">
                  {subtitle}
                </DialogDescription>
              )}
              {hasExitCode && (
                <p
                  className={cn(
                    "mt-1 text-[10px] uppercase tracking-[0.12em]",
                    result.exitCode === 0 ? "text-muted-foreground/70" : "text-rose-300/80",
                  )}
                >
                  exit {result.exitCode}
                </p>
              )}
            </div>
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => copyToClipboard(result.text, undefined)}
              className="shrink-0"
              aria-label={isCopied ? "Copied" : "Copy output"}
            >
              {isCopied ? <CheckIcon /> : <CopyIcon />}
              <span>{isCopied ? "Copied" : "Copy"}</span>
            </Button>
          </div>
        </DialogHeader>
        <DialogPanel className="pt-0">
          <pre
            className={cn(
              "whitespace-pre-wrap break-words font-mono text-[11px] leading-[1.55] text-foreground/92",
              result.kind === "json" && "text-foreground/80",
            )}
          >
            {result.text}
          </pre>
          {result.truncated && (
            <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60">
              Output truncated — exceeds viewer limit
            </p>
          )}
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
});
