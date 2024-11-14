export const authOptions = {
  providers: [
    {
      id: "osf",
      name: "osf RDM",
      type: "oauth",
      clientId: process.env.OSF_CLIENT_ID,
      clientSecret: process.env.OSF_CLIENT_SECRET,
      authorization: {
        url: "https://accounts.osf.io/oauth2/authorize",
        params: {
          scope: "osf.full_read osf.full_write",
          response_type: "code",
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/osf`,
        },
      },
      token: "https://accounts.osf.io/oauth2/token",
      userinfo: {
        url: "https://api.osf.io/v2/users/me/",
        async request({ tokens }) {
          const res = await fetch("https://api.osf.io/v2/users/me/", {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
              Accept: "application/json",
            },
          });
          return await res.json();
        },
      },
      profile(profile) {
        return {
          id: profile.id, // osf RDM のユーザー ID
          name: profile.full_name,
          email: profile.email,
        };
      },
    },
  ],
  callbacks: {
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.id = token.id; // osf ID をセッションに追加
      return session;
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = user.id; // ユーザー ID をトークンに保存
      }
      return token;
    },
  },
};