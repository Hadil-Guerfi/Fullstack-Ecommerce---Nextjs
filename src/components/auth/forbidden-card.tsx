import React from "react";
import CardWrapper from "./card-wrapper";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

function ForbiddenCard() {
  return (
    <CardWrapper
      headerLabel="Not authorized!"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login">
      <div className="w-fumm flex justify-center items-center">
        <ExclamationTriangleIcon className="text-destructive" />
      </div>
    </CardWrapper>
  );
}

export default ForbiddenCard;
