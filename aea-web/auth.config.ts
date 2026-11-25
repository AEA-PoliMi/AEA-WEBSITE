import type { NextAuthConfig } from "next-auth";
import AzureAD from "next-auth/providers/azure-ad";

export const authConfig: NextAuthConfig = {
  providers: [
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope: "openid profile email offline_access User.Read GroupMember.Read.All Mail.Read Sites.Read.All",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const emailDomain = user.email.split("@")[1]?.toLowerCase();
      const allowedDomain = process.env.ALLOWED_DOMAIN?.toLowerCase();

      if (emailDomain !== allowedDomain) {
        console.warn(`Accesso negato per dominio non autorizzato: ${user.email}`);
        return false;
      }
      return true;
    },
  },
};