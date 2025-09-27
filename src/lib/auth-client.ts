import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins"; // 👈 No longer need customSessionClient
import { ac, admin, pastor, servant, member } from "./permissions";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000",
  plugins: [
    adminClient({
      ac,
      roles: {
        Admin: admin,
        Pastor: pastor,
        Servant: servant,
        Member: member,
      },
    }),
  ],
});

export const { signIn, signOut, useSession, signUp } = authClient;
