import { db } from "@/db"
import { notFound } from "next/navigation"
import DesignConfigurator from "./DesignConfigurator"


interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}


const Page = async({ searchParams }: PageProps ) => {

  const { id } = searchParams
  if(!id || typeof id !== "string"){
    return notFound()
  }

  const configuration = await db.configuration.findUnique({   // Paso 2: Obtenemos la configuration de la bd
    where: { id },
  });

  if(!configuration){
    return notFound()
  };

  const { imageUrl, width, height } = configuration;          // Estos parámetros provienen de uploadThing

  return <DesignConfigurator                                  // La pasamos a DesignConfigurator
            configId={configuration.id}                     
            imageUrl={imageUrl} 
            imageDimensions={{ width, height }}
          />
}

export default Page