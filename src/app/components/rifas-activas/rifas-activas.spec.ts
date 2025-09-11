import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RifasActivas } from './rifas-activas';

describe('RifasActivas', () => {
  let component: RifasActivas;
  let fixture: ComponentFixture<RifasActivas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RifasActivas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RifasActivas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
