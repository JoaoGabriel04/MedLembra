import type { FieldValues, Resolver, ResolverResult } from 'react-hook-form'

type ZodIssue = {
  path: readonly (string | number | symbol)[]
  message: string
}

type ZodSafeResult =
  | { success: true; data: unknown; error?: undefined }
  | { success: false; data?: undefined; error: { issues: ZodIssue[] } }

type ZodLike = {
  safeParse: (data: unknown) => ZodSafeResult
}

export function zodResolver<T extends FieldValues>(schema: ZodLike): Resolver<T> {
  return (data) => {
    const result = schema.safeParse(data)
    if (result.success) {
      return { values: result.data as T, errors: {} } as ResolverResult<T>
    }
    const errors: Record<string, { type: string; message: string }> = {}
    for (const issue of result.error.issues) {
      const key = issue.path
        .filter((k): k is string | number => typeof k !== 'symbol')
        .join('.')
      if (key && !errors[key]) {
        errors[key] = { type: 'validation', message: issue.message }
      }
    }
    return { values: {}, errors } as ResolverResult<T>
  }
}
