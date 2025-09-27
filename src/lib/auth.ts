import { betterAuth, type User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "../db";
import * as schema from "../db/schema";
import { admin } from "better-auth/plugins"; // 👈 No longer need customSession
import {
  ac,
  admin as adminRole,
  pastor,
  servant,
  member as memberRole,
} from "./permissions";

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is required");
}

if (!process.env.AUTH_URL) {
  throw new Error("AUTH_URL environment variable is required");
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    admin({
      ac,
      roles: {
        Admin: adminRole,
        Pastor: pastor,
        Servant: servant,
        Member: memberRole,
      },
      defaultRole: "Member", // This will now correctly set the role on the user table
    }),
    nextCookies(), // Next.js cookie handling
  ],
  secret: process.env.AUTH_SECRET,
  baseURL: process.env.AUTH_URL,
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          console.log(
            `User created: ${user.id}. Creating corresponding member row.`
          );
          try {
            await db.insert(schema.members).values({
              userId: user.id,
            });
            console.log(`Successfully created member row for user: ${user.id}`);
          } catch (error) {
            console.error("Failed to create member row:", error);
          }
        },
      },
    },
  },
});

export type Auth = typeof auth;
