"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function MyData() {
  const { data: session } = useSession() as {
    data: {
      user: {
        id: string;
        name?: string | null;
      };
      accessToken: string;
    } | null;
  };

  return (
    <div>
      {!session ? (
        <button onClick={() => signIn("osf")}>Sign in</button>
      ) : (
        <>
          <p>Welcome, {session?.user?.name}</p>
          <p>ID: {session?.user?.id}</p>
          <p>Access Token: {session?.accessToken}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
    </div>
  );
}
