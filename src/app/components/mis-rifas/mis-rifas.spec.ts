import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisRifas } from './mis-rifas';

describe('MisRifas', () => {
  let component: MisRifas;
  let fixture: ComponentFixture<MisRifas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisRifas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisRifas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
