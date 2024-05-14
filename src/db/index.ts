import { PrismaClient} from '@prisma/client'


declare global {
  var cachedPrisma: PrismaClient                 // Esta declaración global asegura que TypeScript sepa sobre la existencia de esta variable global y su tipo.
}                                                // global.cachedPrisma se utiliza para almacenar la instancia de PrismaClient de forma global en el entorno de desarrollo, evitando que se creen múltiples instancias cada vez que se recarga el código. 

let prisma: PrismaClient                         // Se declara una variable local prisma que será de tipo PrismaClient.

if (process.env.NODE_ENV === "production") {     // Se verifica si el entorno de ejecución es de producción
  prisma = new PrismaClient()                    // Si lo es se crea una nueva instancia de PrismaClient y se asigna a la variable prisma.

}else{

  if (!global.cachedPrisma) {                     // Si no es un entorno de producción (por lo tanto, es de desarrollo):
    global.cachedPrisma = new PrismaClient()      // Si global.cachedPrisma no está definido, se crea una nueva instancia de PrismaClient y se asigna a global.cachedPrisma.
  }

  prisma = global.cachedPrisma                    // Asignación de Instancia: La variable prisma se asigna a global.cachedPrisma.
}

export const db = prisma;

// El código se asegura de que solo haya una instancia de PrismaClient