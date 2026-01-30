import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Use this in Server Components / Route Handlers when you need Supabase on the server.
 * Note: In some Next versions, cookies() is async, so this client must be async too.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Some Next cookie stores have getAll(); if not, return empty.
          const anyStore = cookieStore as unknown as { getAll?: () => any[] };
          return typeof anyStore.getAll === "function" ? anyStore.getAll() : [];
        },
        setAll(cookiesToSet) {
          // cookieStore in Next supports set() for mutating cookies
          const anyStore = cookieStore as unknown as {
            set?: (name: string, value: string, options?: any) => void;
          };

          cookiesToSet.forEach(({ name, value, options }) => {
            anyStore.set?.(name, value, options);
          });
        },
      },
    }
  );
}
