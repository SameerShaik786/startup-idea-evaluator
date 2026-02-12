import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";

// Routes that require authentication
const protectedRoutes = [
    "/",
    "/startups",
    "/evaluate",
    "/reports",
    "/discover",
    "/interests",
    "/settings",
];

// Routes that should redirect to dashboard if authenticated
const authRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/magic-link",
    "/verify-email",
];

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Skip auth callback entirely
    if (pathname.startsWith("/auth/callback")) {
        return NextResponse.next();
    }

    // Check route types BEFORE hitting Supabase
    const isProtectedRoute = protectedRoutes.some(
        (route) => pathname === route || (route !== "/" && pathname.startsWith(route + "/"))
    );
    // Special case: "/" is only exact match, not a prefix
    const isRootExact = pathname === "/";

    const isAuthRoute = authRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // If the route isn't protected or auth, skip middleware entirely
    if (!isProtectedRoute && !isRootExact && !isAuthRoute) {
        return NextResponse.next();
    }

    // Only call Supabase when we actually need to check auth
    const { user, supabaseResponse } = await updateSession(request);

    // Redirect unauthenticated users from protected routes to login
    if ((isProtectedRoute || isRootExact) && !user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    // Redirect authenticated users from auth routes to dashboard
    if (isAuthRoute && user) {
        const url = request.nextUrl.clone();
        const redirectTo = url.searchParams.get("redirect") || "/";
        url.pathname = redirectTo;
        url.searchParams.delete("redirect");
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next (static files, chunks, HMR)
         * - favicon.ico
         * - static assets (images, fonts, etc.)
         * - api routes
         */
        "/((?!_next|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
    ],
};
