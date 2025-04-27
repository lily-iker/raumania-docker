import { Header } from "@/components/Header";
import { NormalFooter } from "@/components/NormalFooter";

import ProductSearch from "@/components/search/product-search";

export default function SearchPage() {
  return (
    <>
    <Header/>

    <div className="h-24 md:h-32 bg-brand-gray" /> 

    <div className="bg-brand-gray min-h-screen">
      <ProductSearch />
    </div>

      <NormalFooter/>
    </>
  )
}
