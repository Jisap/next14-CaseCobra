import { db } from "@/db"
import { notFound } from "next/navigation"
import DesignPreview from "./DesignPreview"


interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

const Page = async({ searchParams }: PageProps) => {

  const { id } = searchParams

  if (!id || typeof id !== 'string') {
    return notFound()
  }

  const configuration = await db.configuration.findUnique({ // Se obtiene el objeto de la configuration a partir del id que viene en la url
    where: { id },
  })

  if (!configuration) {
    return notFound()
  }

  return <DesignPreview configuration={configuration} />

  
}

export default Page