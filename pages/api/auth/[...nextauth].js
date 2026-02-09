import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      const allowedEmails = [
        "brianstoker@gmail.com",
        "b@stokedconsulting.com",
        "b@brianstoker.com",
      ];
      
      if (account.provider === "google" && allowedEmails.includes(profile.email)) {
        return true;
      }
      return false; // Do not allow sign-in if email is not in the list
    },
  },
};

export default NextAuth(authOptions);