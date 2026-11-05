export const texto = (d: FormData, nombre: string) => String(d.get(nombre) ?? '').trim()
