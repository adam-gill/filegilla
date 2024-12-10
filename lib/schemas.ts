import * as z from "zod"

export const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Invalid URL"),
  description: z.string().optional(),
  
})

export type PasswordFormData = z.infer<typeof passwordSchema>

