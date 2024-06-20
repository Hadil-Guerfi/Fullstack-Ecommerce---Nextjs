"use client";

import React, { useCallback, useEffect, useState } from "react";
import CardWrapper from "./card-wrapper";
import { BeatLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { newVerification } from "../../../actions/new-verification";
import FormSuccess from "../ui/form-success";
import FormError from "../ui/form-error";

function NewVerificationForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error,setError]=useState<string|undefined>()
  const [success, setSuccess] = useState<string | undefined>();

  const onSubmit = useCallback(() => {
    if(!token){
      setError("Missing token!")
      return ;
    }

    newVerification(token).then((data)=>{
      setSuccess(data.success)
      setError(data.error)
    }).catch(()=>{
      setError("Somthing went wrong!")
    })

  }, [token]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login">
      <div className="flex flex-col items-center w-full justify-center">
        {!success && !error && <BeatLoader />}
        <div className="pt-4">
          <FormSuccess message={success} />
          <FormError message={error} />
        </div>
      </div>
    </CardWrapper>
  );
}

export default NewVerificationForm;
