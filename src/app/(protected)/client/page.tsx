"use client"
import React from "react";
import UserInfo from "../_components/user-info";
import { useCurrentUser } from "@/hooks/use-current-user";


function ClientPage() {
  const user =useCurrentUser();
  return <UserInfo label="Client Component" user={user} />;
}

export default ClientPage;
