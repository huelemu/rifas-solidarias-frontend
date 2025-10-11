// src/app/legal/components/terminos-condiciones.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terminos-condiciones',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-container">
      <div class="legal-content">
        
        <!-- Header compacto -->
        <div class="header">
          <a routerLink="/" class="back-btn">← Volver</a>
          <div class="icon">📜</div>
          <h1>Términos y Condiciones</h1>
          <p class="date">🕒 Octubre 2025</p>
        </div>

        <!-- Contenido compacto -->
        <div class="body">
          
          <section class="highlight">
            <h2>🎯 1. Aceptación</h2>
            <p>Al usar Rifas Solidarias, aceptas estos términos. Si no estás de acuerdo, no uses el servicio.</p>
          </section>

          <section>
            <h2>📱 2. Nuestro Servicio</h2>
            <p>Plataforma para gestión de rifas solidarias que incluye:</p>
            <div class="features">
              <span>🎲 Creación de rifas</span>
              <span>🎫 Venta de números</span>
              <span>🔮 Sorteos transparentes</span>
              <span>🏆 Gestión de premios</span>
            </div>
          </section>

          <section>
            <h2>👤 3. Tu Cuenta</h2>
            <p><strong>Requisitos:</strong> Información precisa y confidencialidad de contraseña.</p>
            <div class="user-types">
              <div class="type admin">
                <span class="icon">👑</span>
                <strong>Admin</strong>
                <small>Gestión total</small>
              </div>
              <div class="type institution">
                <span class="icon">🏛️</span>
                <strong>Institución</strong>
                <small>Crear rifas</small>
              </div>
              <div class="type participant">
                <span class="icon">🎫</span>
                <strong>Participante</strong>
                <small>Comprar números</small>
              </div>
            </div>
          </section>

          <section>
            <h2>⚙️ 4. Uso de la Plataforma</h2>
            <p><strong>Rifas:</strong> Deben cumplir legislación vigente.</p>
            <p><strong>Compras:</strong> Solo +18 años. Aceptas bases específicas.</p>
            <div class="warning">
              <strong>⛔ Prohibido:</strong>
              <ul>
                <li>Actividades ilegales</li>
                <li>Cuentas fraudulentas</li>
                <li>Manipular sorteos</li>
                <li>Uso no autorizado</li>
              </ul>
            </div>
          </section>

          <section>
            <h2>💳 5. Pagos</h2>
            <p>Procesamiento seguro. Comisión informada claramente.</p>
          </section>

          <section>
            <h2>🎲 6. Sorteos</h2>
            <p>Métodos verificables. Ganadores notificados.</p>
          </section>

          <section>
            <h2>🏆 7. Premios</h2>
            <p>Responsabilidad de instituciones. Somos facilitadores.</p>
          </section>

          <section>
            <h2>⚖️ 8. Responsabilidades</h2>
            <div class="responsibilities">
              <div class="resp">
                <strong>Plataforma:</strong>
                <p>Mantenemos el servicio operativo y seguro.</p>
                <small>No respondemos por fallas técnicas, terceros o incumplimientos.</small>
              </div>
              <div class="resp">
                <strong>Usuarios:</strong>
                <p>Responsables de sus acciones y cumplimiento legal.</p>
              </div>
            </div>
          </section>

          <section>
            <h2>©️ 9. Propiedad Intelectual</h2>
            <p>Todo el contenido es propiedad de Rifas Solidarias.</p>
          </section>

          <section>
            <h2>🔄 10. Modificaciones</h2>
            <p>Podemos modificar estos términos. Cambios efectivos al publicarse.</p>
          </section>

          <section>
            <h2>🚫 11. Cancelación</h2>
            <p>Podemos suspender cuentas que violen términos. Puedes cancelar desde tu perfil.</p>
          </section>

          <section>
            <h2>⚖️ 12. Legislación</h2>
            <p>Leyes de Argentina. Disputas en tribunales competentes.</p>
          </section>

          <section class="contact">
            <h2>📧 13. Contacto</h2>
            <div class="contacts">
              <div>📧 info@huelemu.com.ar</div>
          
            </div>
          </section>

        </div>

        <!-- Footer -->
        <div class="footer">
          <p>Al usar Rifas Solidarias, aceptas estos términos.</p>
          <a routerLink="/politica-privacidad">🔒 Política de Privacidad</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .legal-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 1rem;
      border-radius: 8px;
      border-left: 3px solid #667eea;
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

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.5rem;
      margin: 0.75rem 0;
    }

    .features span {
      background: #f8f9fa;
      padding: 0.5rem;
      border-radius: 6px;
      font-size: 0.9rem;
      text-align: center;
    }

    .user-types {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.75rem;
      margin: 0.75rem 0;
    }

    .type {
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      color: white;
    }

    .type.admin {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .type.institution {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .type.participant {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .type .icon {
      font-size: 2rem;
      margin-bottom: 0.25rem;
    }

    .type strong {
      display: block;
      color: white;
      margin: 0.25rem 0;
    }

    .type small {
      font-size: 0.8rem;
      opacity: 0.9;
    }

    .warning {
      background: #fff3cd;
      padding: 1rem;
      border-radius: 8px;
      border-left: 3px solid #ffc107;
      margin: 0.75rem 0;
    }

    .warning ul {
      margin: 0.5rem 0 0 0;
      padding-left: 1.5rem;
    }

    .warning li {
      margin: 0.25rem 0;
    }

    .responsibilities {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 0.75rem;
      margin: 0.75rem 0;
    }

    .resp {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
    }

    .resp strong {
      display: block;
      margin-bottom: 0.5rem;
    }

    .resp p {
      margin: 0 0 0.5rem 0;
    }

    .resp small {
      color: #666;
      font-size: 0.85rem;
    }

    .contact {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 1rem;
      border-radius: 8px;
    }

    .contacts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.5rem;
      margin: 0.75rem 0 0 0;
    }

    .contacts div {
      background: white;
      padding: 0.75rem;
      border-radius: 6px;
      text-align: center;
      font-size: 0.9rem;
    }

    .footer {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1.5rem;
      text-align: center;
      color: white;
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

      .user-types, .features, .responsibilities, .contacts {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TerminosCondicionesComponent {}