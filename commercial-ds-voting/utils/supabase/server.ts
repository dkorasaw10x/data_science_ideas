import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createClient() {
  const cookieStore = await cookies();

  const storeAny = cookieStore as unknown as {
    getAll?: () => Array<{ name: string; value: string }>;
    set?: (name: string, value: string, options?: any) => void;
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return typeof storeAny.getAll === "function" ? storeAny.getAll() : [];
        },
        setAll(cookiesToSet) {
          if (typeof storeAny.set !== "function") return;
          cookiesToSet.forEach(({ name, value, options }) => {
            storeAny.set!(name, value, options);
          });
        },
      },
    }
  );
}
