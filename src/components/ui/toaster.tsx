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
import { CheckCircle2, AlertCircle, Bell } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-4">
              <div className="mt-0.5 shrink-0">
                {variant === 'destructive' ? (
                  <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="grid gap-1 py-1">
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
