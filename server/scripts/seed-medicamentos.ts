import { seedMedicamentosAnvisa } from '../src/lib/seed-medicamentos'
import { prisma } from '../src/lib/prisma'

seedMedicamentosAnvisa()
  .then(() => prisma.$disconnect())
  .catch(err => { console.error(err); process.exit(1) })
