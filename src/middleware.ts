import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

async function appMiddleware(
  request: NextRequest,
  _context: { event: NextFetchEvent },
) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret) {
    return new NextResponse("Server configuration error", { status: 500 });
  }

  const encodedSecret = new TextEncoder().encode(secret);
  const tokenParam = request.nextUrl.searchParams.get("token");

  if (tokenParam) {
    try {
      await jwtVerify(tokenParam, encodedSecret);
      const url = request.nextUrl.clone();
      url.searchParams.delete("token");
      const response = NextResponse.redirect(url);
      response.cookies.set("admin_token", tokenParam, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/admin",
        maxAge: 3600,
      });
      return response;
    } catch {
      return new NextResponse("Invalid token", { status: 401 });
    }
  }

  const cookieToken = request.cookies.get("admin_token")?.value;
  if (cookieToken) {
    try {
      await jwtVerify(cookieToken, encodedSecret);
      return NextResponse.next();
    } catch {
      const response = new NextResponse(
        "Session expired. Please re-open this page from the MadeThis platform.",
        { status: 401 },
      );
      response.cookies.delete("admin_token");
      return response;
    }
  }

  return new NextResponse(
    "Unauthorized — access this page from the MadeThis platform.",
    { status: 401 },
  );
}

export default convexAuthNextjsMiddleware(appMiddleware, {
  shouldHandleCode: false,
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
