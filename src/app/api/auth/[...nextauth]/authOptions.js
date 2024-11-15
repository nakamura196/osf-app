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
      token: {
        url: "https://accounts.osf.io/oauth2/token",
        async request({ clientId, clientSecret, params }) {
          try {
            const res = await fetch("https://accounts.osf.io/oauth2/token", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                ...params,
                client_id: clientId,
                client_secret: clientSecret,
              }),
            });
            const tokens = await res.json();

            if (!res.ok) {
              throw new Error(tokens.error || "Failed to fetch token");
            }

            return { tokens };
          } catch (error) {
            console.error("Token request failed:", error);
            throw error;
          }
        },
      },
      userinfo: {
        url: "https://api.osf.io/v2/users/me/",
        async request({ tokens }) {
          try {
            const res = await fetch("https://api.osf.io/v2/users/me/", {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                Accept: "application/json",
              },
            });

            if (!res.ok) {
              throw new Error(`Failed to fetch user info: ${res.status}`);
            }

            return await res.json();
          } catch (error) {
            console.error("User info request failed:", error);
            throw error;
          }
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
