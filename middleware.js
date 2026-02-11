import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";

// Routes that require authentication
const protectedRoutes = [
    // "/",
    "/startups",
    "/evaluate",
    "/reports",
    "/settings",
];

// Routes that should redirect to dashboard if authenticated
const authRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/magic-link",
];

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Update session and get user
    const { user, supabaseResponse } = await updateSession(request);

    // Check if current path is a protected route
    const isProtectedRoute = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // Check if current path is an auth route
    const isAuthRoute = authRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // Redirect unauthenticated users from protected routes to login
    if (isProtectedRoute && !user) {
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
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
