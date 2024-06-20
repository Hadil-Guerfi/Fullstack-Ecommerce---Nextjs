import { auth } from "@/auth";
import { currentUser } from "@/lib/auth";
import React from "react";
import UserInfo from "../_components/user-info";

async function ServerPage() {
  const user = await currentUser();
  return <UserInfo label="Server Component" user={user} />;
}

export default ServerPage;
