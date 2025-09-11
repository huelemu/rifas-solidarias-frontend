import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprarNumerosPage } from './comprar-numeros-page';

describe('ComprarNumerosPage', () => {
  let component: ComprarNumerosPage;
  let fixture: ComponentFixture<ComprarNumerosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComprarNumerosPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComprarNumerosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
