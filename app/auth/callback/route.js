import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = searchParams.get("next") ?? "/";

    const supabase = await createClient();
    let authResult = null;

    // Handle PKCE flow (OAuth, etc.) — has "code" param
    if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) authResult = data;
    }

    // Handle email link flow (magic link, email verification) — has "token_hash" + "type"
    if (!authResult && token_hash && type) {
        const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type, // "magiclink", "signup", "email", etc.
        });
        if (!error) authResult = data;
    }

    // If we got a valid session, ensure profile exists and redirect
    if (authResult?.user) {
        const user = authResult.user;
        const role = user.user_metadata?.role || "INVESTOR";

        const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single();

        if (!existingProfile) {
            await supabase.from("profiles").insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
                avatar_url: user.user_metadata?.avatar_url || null,
                role: role.toUpperCase(),
            });
        }

        return NextResponse.redirect(`${origin}${next}`);
    }

    // Auth failed — redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth`);
}
