// ====================================
// src/app/components/layout/footer/footer.component.ts
// ====================================
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <footer class="app-footer">
      <div class="footer-content">
        
        <!-- Footer main content -->
        <div class="footer-main">
          
          <!-- Company info -->
          <div class="footer-section">
            <h4>Rifas Solidarias</h4>
            <p>Plataforma digital para rifas benéficas y solidarias</p>
            <div class="social-links">
              <button mat-icon-button>
                <mat-icon>facebook</mat-icon>
              </button>
              <button mat-icon-button>
                <mat-icon>twitter</mat-icon>
              </button>
              <button mat-icon-button>
                <mat-icon>instagram</mat-icon>
              </button>
            </div>
          </div>

          <!-- Quick links -->
          <div class="footer-section">
            <h4>Enlaces Rápidos</h4>
            <ul class="footer-links">
              <li><a href="/rifas">Ver Rifas</a></li>
              <li><a href="/como-funciona">Cómo Funciona</a></li>
              <li><a href="/preguntas-frecuentes">FAQ</a></li>
              <li><a href="/contacto">Contacto</a></li>
            </ul>
          </div>

          <!-- Legal -->
          <div class="footer-section">
            <h4>Legal</h4>
            <ul class="footer-links">
              <li><a href="/terminos">Términos y Condiciones</a></li>
              <li><a href="/privacidad">Política de Privacidad</a></li>
              <li><a href="/cookies">Política de Cookies</a></li>
            </ul>
          </div>

          <!-- Contact info -->
          <div class="footer-section">
            <h4>Contacto</h4>
            <div class="contact-info">
              <div class="contact-item">
                <mat-icon>email</mat-icon>
                <span>info@rifassolidarias.com</span>
              </div>
              <div class="contact-item">
                <mat-icon>phone</mat-icon>
                <span>+54 11 1234-5678</span>
              </div>
              <div class="contact-item">
                <mat-icon>location_on</mat-icon>
                <span>Buenos Aires, Argentina</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer bottom -->
        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <p>&copy; {{ currentYear }} Rifas Solidarias. Todos los derechos reservados.</p>
            <div class="footer-badges">
              <span class="badge">Seguro</span>
              <span class="badge">Confiable</span>
              <span class="badge">Transparente</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      color: white;
      margin-top: auto;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .footer-main {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      padding: 3rem 0 2rem 0;
    }

    .footer-section h4 {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #3498db;
    }

    .footer-section p {
      margin: 0 0 1rem 0;
      line-height: 1.6;
      color: #bdc3c7;
    }

    .social-links {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .social-links button {
      color: #bdc3c7;
      transition: color 0.2s;
    }

    .social-links button:hover {
      color: #3498db;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 0.5rem;
    }

    .footer-links a {
      color: #bdc3c7;
      text-decoration: none;
      transition: color 0.2s;
      font-size: 0.9rem;
    }

    .footer-links a:hover {
      color: #3498db;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #bdc3c7;
      font-size: 0.9rem;
    }

    .contact-item mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
      color: #3498db;
    }

    .footer-bottom {
      border-top: 1px solid #34495e;
      padding: 1.5rem 0;
    }

    .footer-bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .footer-bottom p {
      margin: 0;
      color: #95a5a6;
      font-size: 0.9rem;
    }

    .footer-badges {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .badge {
      background: #3498db;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .footer-main {
        grid-template-columns: 1fr;
        gap: 2rem;
        padding: 2rem 0 1.5rem 0;
      }

      .footer-bottom-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .social-links {
        justify-content: center;
      }

      .footer-badges {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .footer-content {
        padding: 0 0.5rem;
      }

      .footer-main {
        padding: 1.5rem 0 1rem 0;
      }

      .footer-section {
        text-align: center;
      }

      .contact-info {
        align-items: center;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
} 