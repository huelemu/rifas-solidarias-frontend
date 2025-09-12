// =====================================================
// ARCHIVO INDEX PARA SERVICIOS
// src/app/services/index.ts
// =====================================================

// Exportar todos los servicios desde un solo archivo
export * from './auth.service';
export * from './rifas.service';
export * from './instituciones.service';
export * from './usuarios.service';

// También puedes exportar interfaces específicas si las necesitas
export type { Rifa, RifaDetalle, Participacion, EstadisticasRifa, NumeroRifa } from './rifas.service';
export type { Institucion, InstitucionConfig } from './instituciones.service';
export type { Usuario, CrearUsuario, ActualizarUsuario } from './usuarios.service';