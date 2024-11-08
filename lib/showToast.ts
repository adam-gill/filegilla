import { toast } from "@/hooks/use-toast";

type variant = "good" | "destructive" | "default" | null | undefined

export function showToast(title: string, description: string, variant: variant) {
    toast({
      title: title,
      description: description,
      variant: variant,
    })
  }