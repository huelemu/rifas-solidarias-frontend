import { UserRole } from '../services/auth.service';

export function getRoleDisplayName(role: string): string {
  const roleNames: { [key: string]: string } = {
    [UserRole.ADMIN_GLOBAL]: 'Administrador Global',
    [UserRole.ADMIN_INSTITUCION]: 'Administrador de Institución',
    [UserRole.VENDEDOR]: 'Vendedor',
    [UserRole.COMPRADOR]: 'Comprador'
  };
  return roleNames[role] || role;
}