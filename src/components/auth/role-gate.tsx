"use client";

import { UserRole } from "@prisma/client";
import FormError from "../ui/form-error";
import { useCurrentRole } from "@/hooks/use-current-role";

type RoleGateProps = {
  children: React.ReactNode;
  allowedRole: UserRole;
};

export const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
  const role = useCurrentRole();
  if (role !== allowedRole) {
    return <FormError message="Not authorized" />;
  }

  return <> {children}</>;
};
