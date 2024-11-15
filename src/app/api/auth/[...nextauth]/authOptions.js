export const authOptions = {
  providers: [
    {
      id: "osf",
      name: "Open Science Framework",
      type: "oauth",
      clientId: process.env.OSF_CLIENT_ID,
      clientSecret: process.env.OSF_CLIENT_SECRET,
      authorization: {
        url: "https://accounts.osf.io/oauth2/authorize",
        params: {
          scope: process.env.OSF_SCOPE || "osf.full_read osf.full_write", // 環境変数でスコープを管理
          response_type: "code",
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/osf`, // 環境変数からリダイレクトURIを構築
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
          id: profile.data.id, // GakuNin RDM のユーザー ID
          name: profile.data.attributes.full_name, // attributesの中からfull_nameを取得
          email: profile.data.attributes.email,    // attributesの中からemailを取得
        };
      }
    },
  ],
  callbacks: {
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken; // リフレッシュトークンをセッションに保存
      session.user.id = token.id; // osf ID をセッションに追加
      return session;
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token; // リフレッシュトークンを保存
      }
      if (user) {
        token.id = user.id; // ユーザー ID をトークンに保存
      }
      return token;
    },
  },
  events: {
    async signIn({ user, account }) {
      console.log("User signed in:", user);
      console.log("Account details:", account);
    },
    async error({ error }) {
      console.error("An error occurred during the authentication process:", error);
    },
  },
};
