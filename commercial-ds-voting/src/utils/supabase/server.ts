import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createClient() {
  const cookieStore = cookies();

  // Next.js cookieStore API differs by version.
  // Some versions have getAll(); others require manual access.
  const getAllCookies = () => {
    // @ts-expect-error - runtime feature detection
    if (typeof cookieStore.getAll === "function") return cookieStore.getAll();

    // Fallback: best-effort for older cookie store implementations
    // @ts-expect-error - runtime feature detection
    const all = typeof cookieStore.get === "function" ? cookieStore : null;

    // If we can't enumerate, return empty (Supabase will still work for unauth flows)
    if (!all) return [];

    // We can't reliably list all cookies without getAll(), so return empty.
    // Session will still be set via setAll below after OAuth callback.
    return [];
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return getAllCookies();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
