import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleRifa } from './detalle-rifa';

describe('DetalleRifa', () => {
  let component: DetalleRifa;
  let fixture: ComponentFixture<DetalleRifa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleRifa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleRifa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
