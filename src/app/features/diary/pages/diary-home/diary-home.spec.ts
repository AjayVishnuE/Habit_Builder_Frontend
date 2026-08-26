import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiaryHome } from './diary-home';

describe('DiaryHome', () => {
  let component: DiaryHome;
  let fixture: ComponentFixture<DiaryHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiaryHome],
    }).compileComponents();

    fixture = TestBed.createComponent(DiaryHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
