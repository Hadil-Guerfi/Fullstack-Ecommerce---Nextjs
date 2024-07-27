import React from 'react'
import { PageHeader } from '../../_components/PageHeader';
import { ProductForm } from '../_components/ProductForm';

function NewProduct() {
  return (
    <>
      <PageHeader>Add Prodcut</PageHeader>
      <ProductForm/>
    </>
  );
}

export default NewProduct;