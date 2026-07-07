export const swrKeys = {
  me: () => '/usuarios/me',
  cuidadorIdosos: () => '/cuidador/idosos',
  hoje: (idosoId?: number) =>
    idosoId ? `/idoso/hoje?idosoId=${idosoId}` : '/idoso/hoje',
  medicamentos: (idosoId: number) => `/medicamentos?idosoId=${idosoId}`,
  medicamento: (id: number) => `/medicamentos/${id}`,
  dashboard: (idosoId: number) => `/cuidador/dashboard/${idosoId}`,
  alertas: () => '/cuidador/alertas',
  idosoAlertas: () => '/idoso/alertas',
  buscaExterna: (q: string) => `/medicamentos/busca-externa?q=${encodeURIComponent(q)}`,
}
