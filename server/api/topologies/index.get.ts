import { useDrizzle, tables } from '~/server/utils/useDrizzle'

export default defineEventHandler(async (event) => {
  try {

    // Instanciamos la base de datos
    const db = useDrizzle()
    
    // Sacamos las topologias
    const topologies = await db.select().from(tables.topologies)
    
    // Regresamos las topologias
    return {
      success: true,
      data: topologies
    }

  } catch (error) {

    throw createError({
      statusCode: 500,
      statusMessage: 'Error consiguiendo topologias'
    })
  }
})
