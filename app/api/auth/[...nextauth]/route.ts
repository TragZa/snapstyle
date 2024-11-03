import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { sql } from "@vercel/postgres";

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {
          label: "Email",
          type: "text",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email) {
          throw new Error("Email cannot be empty");
        }

        if (!credentials?.password) {
          throw new Error("Password cannot be empty");
        }

        const response =
          await sql`SELECT * FROM users WHERE email=${credentials.email}`;
        const user = response.rows[0];

        if (!user) {
          throw new Error("No user found with this email");
        }

        const passwordCorrect = await compare(
          credentials.password,
          user.password
        );

        if (!passwordCorrect) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],
});

export { handler as GET, handler as POST };
