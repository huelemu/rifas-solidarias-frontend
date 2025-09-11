import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprarNumeros } from './comprar-numeros.component';

describe('ComprarNumeros', () => {
  let component: ComprarNumeros;
  let fixture: ComponentFixture<ComprarNumeros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComprarNumeros]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComprarNumeros);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
