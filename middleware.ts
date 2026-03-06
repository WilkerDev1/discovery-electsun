import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl, auth: session } = req;
    const isLoggedIn = !!session;
    const role = session?.user?.role;

    const isAdminRoute = nextUrl.pathname.startsWith("/admin");
    const isTechnicianRoute = nextUrl.pathname.startsWith("/technician");
    const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);

    // Redirect authenticated users away from auth routes
    if (isLoggedIn && isAuthRoute) {
        const destination =
            role === "ADMIN" ? "/admin/dashboard" : "/technician/dashboard";
        return NextResponse.redirect(new URL(destination, nextUrl));
    }

    // Protect private routes
    if (!isLoggedIn && (isAdminRoute || isTechnicianRoute)) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // Verify correct role for route
    if (isLoggedIn && isAdminRoute && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/technician/dashboard", nextUrl));
    }

    if (isLoggedIn && isTechnicianRoute && role !== "TECHNICIAN") {
        return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
