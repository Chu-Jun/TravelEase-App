import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = cookies(); // No need for `await`

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value || "";
        },
        async set(name: string, value: string, options?: any) {
          try {
            (await cookieStore).set(name, value, options);
          } catch (error) {
            // Ignore errors from setting cookies in a Server Component
          }
        },
        async remove(name: string, options?: any) {
          try {
            (await cookieStore).set(name, "", { ...options, maxAge: -1 });
          } catch (error) {
            // Ignore errors from setting cookies in a Server Component
          }
        },
      },
    }
  );
};
