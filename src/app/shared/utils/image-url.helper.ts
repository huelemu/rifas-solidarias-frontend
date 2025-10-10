// src/app/shared/utils/image-url.helper.ts

export class ImageUrlHelper {
  private static readonly BACKEND_URL = this.getBackendUrl();

  private static getBackendUrl(): string {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3100';
    } else {
      return 'https://apirifas.huelemu.com.ar';
    }
  }

  /**
   * Convierte una URL relativa en una URL completa del backend
   */
  static getFullImageUrl(relativePath: string | null | undefined): string | null {
    if (!relativePath) return null;

    // Si ya es una URL completa, devolverla tal cual
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }

    // Si es una URL relativa, agregar el backend URL
    if (relativePath.startsWith('/uploads/')) {
      return `${this.BACKEND_URL}${relativePath}`;
    }

    // Si no tiene /uploads/ al inicio, agregarlo
    return `${this.BACKEND_URL}/uploads/${relativePath}`;
  }

  /**
   * Obtiene URL del logo de institución
   */
  static getLogoUrl(logoPath: string | null | undefined): string | null {
    return this.getFullImageUrl(logoPath);
  }

  /**
   * Obtiene URL de imagen de rifa
   */
  static getRifaImageUrl(imagePath: string | null | undefined): string | null {
    return this.getFullImageUrl(imagePath);
  }

  /**
   * Obtiene el backend URL base
   */
  static getBackendBaseUrl(): string {
    return this.BACKEND_URL;
  }
}