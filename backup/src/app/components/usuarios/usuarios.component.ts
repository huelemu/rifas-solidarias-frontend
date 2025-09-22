// ✅ IMPORTS CORREGIDOS - usando ambos servicios
import { InstitucionesService, Institucion } from '../../services/instituciones.service';
import { UsuariosService, Usuario } from '../../services/usuarios.service';
import { AuthService } from '../../services/auth.service';

// =====================================================
// COMPONENTE USUARIOS COMPLETO
// =====================================================

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit, OnDestroy {
  
  usuarios: Usuario[] = [];
  instituciones: Institucion[] = [];
  currentUser: any;
  loading = false;
  error: string | null = null;
  
  // Filtros
  filtroRol = '';
  filtroInstitucion = '';
  filtroEstado = '';
  filtroTexto = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private institucionesService: InstitucionesService,
    private usuariosService: UsuariosService, // ✅ Servicio de usuarios agregado
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarDatos(): void {
    this.loading = true;
    
    // Cargar instituciones
    this.institucionesService.listarInstituciones().subscribe({
      next: (instituciones: Institucion[]) => {
        this.instituciones = instituciones;
      },
      error: (error: any) => {
        console.error('Error al cargar instituciones:', error);
      }
    });

    // ✅ Cargar usuarios
    this.usuariosService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data.usuarios;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Error al cargar usuarios';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  // Métodos del componente...
}