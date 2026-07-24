import { NextRequest } from "next/server";
import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

const authMiddleware = convexAuthNextjsMiddleware(undefined, {
  shouldHandleCode: false,
});

export async function POST(request: NextRequest) {
  const response = await authMiddleware(request, {} as never);
  return response instanceof Response ? response : new Response(null, { status: 204 });
}
