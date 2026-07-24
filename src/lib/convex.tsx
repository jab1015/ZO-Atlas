import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ReactNode } from "react";

export async function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider shouldHandleCode={false}>
      {children}
    </ConvexAuthNextjsServerProvider>
  );
}
