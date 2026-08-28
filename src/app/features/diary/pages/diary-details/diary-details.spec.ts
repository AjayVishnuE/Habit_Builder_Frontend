import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiaryDetails } from './diary-details';

describe('DiaryDetails', () => {
  let component: DiaryDetails;
  let fixture: ComponentFixture<DiaryDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiaryDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(DiaryDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
