import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { EmployeeService } from './employee.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let mockEmployeeService: any;

  beforeEach(async () => {
    mockEmployeeService = jasmine.createSpyObj('EmployeeService', ['getEmployee', 'addEmployee', 'updateEmployee', 'deleteEmployee']);
    mockEmployeeService.getEmployee.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EmployeeService, useValue: mockEmployeeService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render navbar brand', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar-brand')?.textContent).toContain('Employee Manager');
  });
});
