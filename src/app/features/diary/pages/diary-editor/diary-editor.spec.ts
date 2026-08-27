import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiaryEditor } from './diary-editor';

describe('DiaryEditor', () => {
  let component: DiaryEditor;
  let fixture: ComponentFixture<DiaryEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiaryEditor],
    }).compileComponents();

    fixture = TestBed.createComponent(DiaryEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
