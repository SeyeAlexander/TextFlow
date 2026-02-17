import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { getRandomGradient } from "@/lib/avatars";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure user has a gradient avatar (not a Google photo URL)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const currentAvatar = user.user_metadata?.avatar_url;
        const needsGradient = !currentAvatar || currentAvatar.startsWith("http");

        if (needsGradient) {
          try {
            // Check if profile already has a gradient
            const [profile] = await db
              .select({ avatarUrl: profiles.avatarUrl })
              .from(profiles)
              .where(eq(profiles.id, user.id))
              .limit(1);

            const gradient =
              profile?.avatarUrl && !profile.avatarUrl.startsWith("http")
                ? profile.avatarUrl
                : getRandomGradient(user.id);

            await db.update(profiles).set({ avatarUrl: gradient }).where(eq(profiles.id, user.id));
            await supabase.auth.updateUser({
              data: { avatar_url: gradient },
            });
          } catch {
            // Non-critical
          }
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
