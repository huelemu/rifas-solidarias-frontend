// src/app/legal/components/politica-privacidad.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-politica-privacidad',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-container">
      <div class="legal-content">
        
        <!-- Header compacto -->
        <div class="header">
          <a routerLink="/" class="back-btn">← Volver</a>
          <div class="icon">🔒</div>
          <h1>Política de Privacidad</h1>
          <p class="date">🕒 Octubre 2025</p>
        </div>

        <!-- Contenido compacto -->
        <div class="body">
          
          <section class="highlight">
            <h2>🛡️ 1. Compromiso</h2>
            <p>Protegemos tu privacidad y datos personales con los más altos estándares.</p>
          </section>

          <section>
            <h2>📊 2. Información que Recopilamos</h2>
            <div class="info-grid">
              <div class="info-card">
                <span>👤</span>
                <strong>Registro</strong>
                <small>Nombre, email, teléfono, DNI</small>
              </div>
              <div class="info-card">
                <span>🏛️</span>
                <strong>Instituciones</strong>
                <small>CUIT, dirección, contacto</small>
              </div>
              <div class="info-card">
                <span>💳</span>
                <strong>Transacciones</strong>
                <small>Compra de números</small>
              </div>
              <div class="info-card">
                <span>🌐</span>
                <strong>Automático</strong>
                <small>IP, navegador, cookies</small>
              </div>
            </div>
          </section>

          <section>
            <h2>🎯 3. Uso de la Información</h2>
            <div class="usage-grid">
              <span>⚙️ Servicios</span>
              <span>💰 Transacciones</span>
              <span>📧 Comunicación</span>
              <span>⚖️ Legal</span>
              <span>🔐 Seguridad</span>
              <span>🔔 Notificaciones</span>
            </div>
          </section>

          <section>
            <h2>🤝 4. Compartir Información</h2>
            <p><strong>No vendemos tus datos.</strong> Compartimos con:</p>
            <div class="sharing">
              <div class="share-item">
                <span>🏛️</span>
                <strong>Instituciones</strong>
                <p>Para gestión de premios</p>
              </div>
              <div class="share-item">
                <span>🔧</span>
                <strong>Proveedores</strong>
                <p>Hosting, pagos, análisis</p>
              </div>
              <div class="share-item">
                <span>⚖️</span>
                <strong>Legal</strong>
                <p>Si es requerido por ley</p>
              </div>
            </div>
          </section>

          <section class="security">
            <h2>🔐 5. Seguridad</h2>
            <div class="security-grid">
              <div><span>🔒</span> Encriptación SSL/TLS</div>
              <div><span>🔑</span> Contraseñas hasheadas</div>
              <div><span>🚪</span> Acceso restringido</div>
              <div><span>👁️</span> Monitoreo continuo</div>
              <div><span>💾</span> Backups regulares</div>
              <div><span>🖥️</span> Servidores seguros</div>
            </div>
          </section>

          <section>
            <h2>🍪 6. Cookies</h2>
            <p>Usamos cookies para:</p>
            <div class="cookies">
              <span>🔐 Mantener sesión</span>
              <span>⚙️ Recordar preferencias</span>
              <span>📊 Analizar uso</span>
              <span>🎨 Personalizar</span>
            </div>
            <p class="note">💡 Puedes rechazarlas, pero afectará la funcionalidad.</p>
          </section>

          <section class="rights">
            <h2>✊ 7. Tus Derechos</h2>
            <div class="rights-grid">
              <div><span>📂</span> <strong>Acceso</strong> a tus datos</div>
              <div><span>✏️</span> <strong>Rectificación</strong> de datos</div>
              <div><span>🗑️</span> <strong>Eliminación</strong> de datos</div>
              <div><span>📦</span> <strong>Portabilidad</strong> de datos</div>
              <div><span>🚫</span> <strong>Oposición</strong> al procesamiento</div>
              <div><span>↩️</span> <strong>Revocación</strong> de consentimiento</div>
            </div>
            <p class="contact-info">✉️ privacidad@rifassolidarias.com</p>
          </section>

          <section>
            <h2>⏳ 8. Retención</h2>
            <p>Conservamos datos mientras tu cuenta esté activa. Transacciones: 10 años (legal).</p>
          </section>

          <section class="warning">
            <h2>👶 9. Menores</h2>
            <p><strong>Servicio no dirigido a -18 años.</strong> Si detectamos menores, eliminamos datos inmediatamente.</p>
          </section>

          <section>
            <h2>🌎 10. Transferencias Internacionales</h2>
            <p>Datos pueden procesarse fuera de Argentina cumpliendo normativas aplicables.</p>
          </section>

          <section>
            <h2>🔄 11. Cambios</h2>
            <p>Podemos actualizar esta política. Notificamos cambios significativos por email.</p>
          </section>

          <section class="compliance">
            <h2>📋 12. Cumplimiento Legal</h2>
            <div class="compliance-items">
              <div><span>🇦🇷</span> Ley 25.326 (Argentina)</div>
              <div><span>📜</span> Disposición 10/2019 AAIP</div>
            </div>
            <p><strong>Registro AAIP:</strong> [Pendiente]</p>
          </section>

          <section class="contact">
            <h2>📧 13. Contacto</h2>
            <div class="contacts">
              <div>📧 info@huelemu.com.ar</div>
              <div>👤 Juan Manuel Lacy</div>
            </div>
            <p class="response">⏱️ Respuesta en <strong>10 días hábiles</strong></p>
          </section>

          <section class="consent">
            <h2>✅ 14. Consentimiento</h2>
            <p>Al usar Rifas Solidarias, consientes el procesamiento según esta política.</p>
          </section>

        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-icon">🛡️</div>
          <p>Tu privacidad es nuestra prioridad</p>
          <a routerLink="/terminos-condiciones">📜 Términos y Condiciones</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .legal-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #e0f7fa 0%, #80deea 100%);
      padding: 1.5rem 1rem;
    }

    .legal-content {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .header {
      background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);
      padding: 2rem 1.5rem;
      text-align: center;
      color: white;
    }

    .back-btn {
      display: inline-block;
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 0.4rem 0.8rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      transition: background 0.2s;
    }

    .back-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
    }

    .date {
      font-size: 0.85rem;
      opacity: 0.9;
      margin: 0;
    }

    .body {
      padding: 2rem 1.5rem;
      line-height: 1.6;
      color: #444;
    }

    section {
      margin-bottom: 1.5rem;
    }

    .highlight {
      background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);
      padding: 1rem;
      border-radius: 8px;
      border-left: 3px solid #00bcd4;
    }

    h2 {
      color: #2c3e50;
      font-size: 1.2rem;
      margin: 0 0 0.75rem 0;
    }

    p {
      margin: 0.5rem 0;
    }

    strong {
      color: #2c3e50;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.75rem;
      margin: 0.75rem 0;
    }

    .info-card {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }

    .info-card span {
      font-size: 2rem;
      display: block;
      margin-bottom: 0.25rem;
    }

    .info-card strong {
      display: block;
      margin: 0.25rem 0;
      font-size: 0.95rem;
    }

    .info-card small {
      font-size: 0.8rem;
      color: #666;
    }

    .usage-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 0.5rem;
      margin: 0.75rem 0;
    }

    .usage-grid span {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 0.85rem;
      text-align: center;
      font-weight: 500;
    }

    .usage-grid span:nth-child(2) {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .usage-grid span:nth-child(3) {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .usage-grid span:nth-child(4) {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .usage-grid span:nth-child(5) {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }

    .usage-grid span:nth-child(6) {
      background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
    }

    .sharing {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.75rem;
      margin: 0.75rem 0;
    }

    .share-item {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }

    .share-item span {
      font-size: 2rem;
      display: block;
      margin-bottom: 0.25rem;
    }

    .share-item strong {
      display: block;
      margin: 0.25rem 0;
    }

    .share-item p {
      margin: 0;
      font-size: 0.85rem;
      color: #666;
    }

    .security {
      background: linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%);
      padding: 1rem;
      border-radius: 8px;
    }

    .security-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.5rem;
      margin: 0.75rem 0;
    }

    .security-grid div {
      background: white;
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 0.85rem;
      text-align: center;
    }

    .security-grid span {
      font-size: 1.5rem;
      display: block;
      margin-bottom: 0.25rem;
    }

    .cookies {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.5rem;
      margin: 0.75rem 0;
    }

    .cookies span {
      background: #fff9c4;
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 0.85rem;
      text-align: center;
    }

    .note {
      background: #e3f2fd;
      padding: 0.75rem;
      border-radius: 6px;
      border-left: 3px solid #2196f3;
      margin: 0.75rem 0 0 0;
      font-style: italic;
      font-size: 0.9rem;
    }

    .rights {
      background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%);
      padding: 1rem;
      border-radius: 8px;
    }

    .rights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.5rem;
      margin: 0.75rem 0;
    }

    .rights-grid div {
      background: white;
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 0.85rem;
      text-align: center;
    }

    .rights-grid span {
      font-size: 1.5rem;
      display: block;
      margin-bottom: 0.25rem;
    }

    .contact-info {
      background: white;
      padding: 0.75rem;
      border-radius: 6px;
      text-align: center;
      margin: 0.75rem 0 0 0;
      font-weight: 500;
    }

    .warning {
      background: #fff3cd;
      padding: 1rem;
      border-radius: 8px;
      border-left: 3px solid #ffc107;
    }

    .compliance {
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
      padding: 1rem;
      border-radius: 8px;
    }

    .compliance-items {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.5rem;
      margin: 0.75rem 0;
    }

    .compliance-items div {
      background: white;
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .compliance-items span {
      font-size: 1.3rem;
      margin-right: 0.5rem;
    }

    .contact {
      background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);
      padding: 1rem;
      border-radius: 8px;
    }

    .contacts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.5rem;
      margin: 0.75rem 0;
    }

    .contacts div {
      background: white;
      padding: 0.75rem;
      border-radius: 6px;
      text-align: center;
      font-size: 0.9rem;
    }

    .response {
      background: white;
      padding: 0.75rem;
      border-radius: 6px;
      text-align: center;
      margin: 0.75rem 0 0 0;
    }

    .consent {
      background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
      padding: 1rem;
      border-radius: 8px;
      border-left: 3px solid #9c27b0;
    }

    .footer {
      background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);
      padding: 1.5rem;
      text-align: center;
      color: white;
    }

    .footer-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .footer p {
      margin: 0 0 0.75rem 0;
    }

    .footer a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      display: inline-block;
      transition: background 0.2s;
    }

    .footer a:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    @media (max-width: 768px) {
      .header {
        padding: 1.5rem 1rem;
      }

      .header h1 {
        font-size: 1.5rem;
      }

      .body {
        padding: 1.5rem 1rem;
      }

      .info-grid, .usage-grid, .sharing, .security-grid, 
      .cookies, .rights-grid, .compliance-items, .contacts {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PoliticaPrivacidadComponent {}