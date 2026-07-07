import { Request, Response, NextFunction } from 'express'
import { getDashboard, getAlertas } from '../services/dashboard.service'
import { gerarRelatorio } from '../services/relatorio.service'
import { zodErrorResponse, zIntParam } from '../lib/validation'

export async function dashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  const paramResult = zIntParam.safeParse(req.params.idosoId)
  if (!paramResult.success) {
    res.status(400).json(zodErrorResponse(paramResult.error))
    return
  }
  try {
    const data = await getDashboard(req.user!.id, paramResult.data)
    res.json(data)
  } catch (err) { next(err) }
}

export async function alertas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getAlertas(req.user!.id)
    res.json(data)
  } catch (err) { next(err) }
}

export async function relatorio(req: Request, res: Response, next: NextFunction): Promise<void> {
  const paramResult = zIntParam.safeParse(req.params.idosoId)
  if (!paramResult.success) {
    res.status(400).json(zodErrorResponse(paramResult.error))
    return
  }

  const periodoRaw = req.query.periodo
  const periodo = periodoRaw === '30' ? 30 : 7

  try {
    const buffer = await gerarRelatorio(req.user!.id, paramResult.data, periodo)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-${paramResult.data}-${new Date().toISOString().slice(0, 10)}.pdf"`)
    res.send(buffer)
  } catch (err) { next(err) }
}
