import { async, TestBed } from '@angular/core/testing';
import { SandboxModule } from './sandbox.module';

describe('SandboxModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SandboxModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(SandboxModule).toBeDefined();
  });
});
