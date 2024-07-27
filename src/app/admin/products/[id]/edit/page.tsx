import { PageHeader } from "@/app/admin/_components/PageHeader";
import React from "react";
import { ProductForm } from "../../_components/ProductForm";
import db from "@/lib/db";

async function EditProduct({params:{id} }:{params:{id:string}}) {
  
    const product =await db.product.findUnique({
        where:{id}
    }) 

    return (
    <>
      <PageHeader>Edit Prodcut</PageHeader>
      <ProductForm product={product}/>
    </>
  );
}

export default EditProduct;


