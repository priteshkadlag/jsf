"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { login, type LoginState } from "@/app/admin/actions";
import { inputCls } from "./ui";

export default function LoginForm({ configured, siteName }: { configured: boolean; siteName: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(async (prev: LoginState, fd: FormData) => {
    const res = await login(prev, fd);
    if (!res.error) router.refresh();
    return res;
  }, {});

  return (
    <div className="flex min-h-svh items-center justify-center bg-neutral-100 p-4 font-sans">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{siteName}</p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Sign in to the admin</h1>
        {!configured ? (
          <div className="mt-6 space-y-2 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium">The admin password hasn’t been set up.</p>
            <p>
              Add <code>ADMIN_PASSWORD</code> (at least 8 characters) to the server’s environment variables, for example in <code>.env.local</code>, then restart
              the site.
            </p>
          </div>
        ) : (
          <form action={action} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-neutral-800">
                Password
              </label>
              <input id="password" name="password" type="password" required autoFocus autoComplete="current-password" className={inputCls} aria-describedby={state.error ? "login-error" : undefined} />
            </div>
            {state.error && (
              <p id="login-error" role="alert" className="text-sm text-red-700">
                {state.error}
              </p>
            )}
            <button type="submit" disabled={pending} className="w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:bg-neutral-400">
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
