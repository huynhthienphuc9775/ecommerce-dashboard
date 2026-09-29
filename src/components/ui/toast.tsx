import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cn } from "cn"
import {
  CircleAlertIcon,
  CircleCheckBigIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toastManager } from "@/lib/toast"

const toastVariants = {
  success: {
    icon: CircleCheckBigIcon,
    bar: "before:bg-success",
    chip: "bg-success/12 text-success",
  },
  error: {
    icon: CircleAlertIcon,
    bar: "before:bg-destructive",
    chip: "bg-destructive/10 text-destructive",
  },
  warning: {
    icon: TriangleAlertIcon,
    bar: "before:bg-warning",
    chip: "bg-warning/12 text-warning",
  },
  info: {
    icon: InfoIcon,
    bar: "before:bg-info",
    chip: "bg-info/12 text-info",
  },
} as const

type ToastVariant = keyof typeof toastVariants

function resolveVariant(type: string | undefined): ToastVariant {
  return type && type in toastVariants ? (type as ToastVariant) : "info"
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toast) => {
    const { icon: Icon, bar, chip } = toastVariants[resolveVariant(toast.type)]

    return (
      <ToastPrimitive.Root
        key={toast.id}
        toast={toast}
        data-slot="toast"
        className={cn(
          "group relative flex w-full items-start gap-3 overflow-hidden rounded-xl bg-popover py-3.5 pr-10 pl-4 text-sm text-popover-foreground shadow-lg shadow-black/8 ring-1 ring-foreground/10 transition-all duration-200 dark:shadow-black/40",
          // dải màu dọc làm điểm nhấn thay cho nền phẳng
          "before:absolute before:inset-y-0 before:left-0 before:w-1",
          bar,
          "data-starting-style:translate-x-full data-starting-style:opacity-0",
          "data-ending-style:translate-x-full data-ending-style:opacity-0"
        )}
      >
        <span
          className={cn(
            "mt-px flex size-7 shrink-0 items-center justify-center rounded-full [&_svg]:size-4",
            chip
          )}
        >
          <Icon />
        </span>
        <ToastPrimitive.Content className="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5">
          <ToastPrimitive.Title className="font-heading text-sm leading-snug font-medium" />
          <ToastPrimitive.Description className="text-sm leading-snug text-muted-foreground" />
        </ToastPrimitive.Content>
        <ToastPrimitive.Close
          aria-label="Đóng"
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              className="absolute top-2.5 right-2.5 text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
            />
          }
        >
          <XIcon />
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
    )
  })
}

function Toaster() {
  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport
        data-slot="toast-viewport"
        className="fixed right-4 bottom-4 z-100 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 outline-none"
      >
        <ToastList />
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  )
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastPrimitive.Provider toastManager={toastManager}>
      {children}
      <Toaster />
    </ToastPrimitive.Provider>
  )
}

export { Toaster, ToastProvider }
