/**
 * Возвращаемое состояние Server Action для форм через `useActionState`.
 * `errorKey` — ключ перевода в `messages/{locale}.json` под `auth.errors.*`.
 */
export type AuthFormState =
  | { status: "idle" }
  | { status: "error"; errorKey: string }
  | { status: "success"; messageKey?: string };

export const idleState: AuthFormState = { status: "idle" };
