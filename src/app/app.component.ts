export class AppComponent implements OnInit {
  title = 'rifas-solidarias-frontend';
  currentUser$ = this.authService.currentUser$;     // Observable<User | null>
  isAuthenticated$ = this.authService.isAuthenticated$; // Observable<boolean>
  isLoading = true;
  showNavigation = true;

  private hiddenNavRoutes = ['/login', '/register', '/dashboard'];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupRouterEvents();
  }

  private setupRouterEvents(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateNavigationVisibility(event.url);
      });
  }

  private updateNavigationVisibility(url: string): void {
    this.showNavigation = !this.hiddenNavRoutes.some(route => url.startsWith(route));
  }

  logout(): void {
    this.authService.logout();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getRoleIcon(role: string): string {
    const roleIcons: { [key: string]: string } = {
      'admin_global': '👑',
      'admin_institucion': '🏢',
      'vendedor': '💼',
      'comprador': '🛒'
    };
    return roleIcons[role] || '👤';
  }
}
