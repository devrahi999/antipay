"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, AlertCircle, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-center gap-3 pr-2 w-full">
              <div className="shrink-0">
                {variant === 'destructive' ? (
                  <div className="h-9 w-9 rounded-full bg-red-400/20 flex items-center justify-center text-red-400">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="h-9 w-9 rounded-full bg-green-400/20 flex items-center justify-center text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}