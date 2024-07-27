"use client";

import { FaUser } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ExitIcon } from "@radix-ui/react-icons";
import LogoutButton from "./logout-button";
import { User2Icon } from "lucide-react";
import Link from "next/link";

function UserButton({ hrefProfil }: { hrefProfil :string}) {
  const user = useCurrentUser();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback className="bg-sky-500">
            <FaUser className="text-white" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuItem>
          <ExitIcon className="h-4 w-4 mr-2" />
          <LogoutButton>Logout</LogoutButton>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <User2Icon className="h-4 w-4 mr-2" />

          <Link href={hrefProfil}>Profil</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserButton;
