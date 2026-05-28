import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { NgForm, FormsModule } from '@angular/forms';
import { EmployeeService } from './employee.service';
import { Employee } from './employee';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public employees: Employee[] = [];
  private allEmployees: Employee[] = [];
  public newEmployee: Employee = {} as Employee;
  public editEmployee: Employee = {} as Employee;
  public selectedEmployee: Employee = {} as Employee;
  public searchKey: string = '';
  public isDarkTheme: boolean = false;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.getEmployees();
    this.loadTheme(); // Load theme preference on page load
  }

  // Fetch all employees
  public getEmployees(): void {
    this.employeeService.getEmployee().subscribe({
      next: (response: Employee[]) => {
        this.employees = response;
        this.allEmployees = response; // backup list for search
      },
      error: (error: HttpErrorResponse) => {
        alert(error.message);
      }
    });
  }

  // Add new employee
  public onAddEmployee(addForm: NgForm): void {
    this.employeeService.addEmployee(addForm.value).subscribe({
      next: (response: Employee) => {
        console.log(response);
        document.getElementById('add-employee-close')?.click();
        this.getEmployees();
        addForm.reset();
      },
      error: (error: HttpErrorResponse) => {
        alert(error.message);
        addForm.reset();
      }
    });
  }

  // Update employee
  public onUpdateEmployee(editForm: NgForm): void {
    this.employeeService.updateEmployee(this.editEmployee).subscribe({
      next: (response: Employee) => {
        console.log(response);
        document.getElementById('update-employee-close')?.click();
        this.getEmployees();
      },
      error: (error: HttpErrorResponse) => {
        alert(error.message);
      }
    });
  }

  // Delete employee
  public onDeleteEmployee(): void {
    this.employeeService.deleteEmployee(this.selectedEmployee.id).subscribe({
      next: () => {
        console.log('Deleted successfully');
        document.getElementById('delete-employee-close')?.click();
        this.getEmployees();
      },
      error: (error: HttpErrorResponse) => {
        alert(error.message);
      }
    });
  }

  // Search employees
  public searchEmployees(key: string): void {
    console.log(key);
    if (!key.trim()) {
      this.employees = [...this.allEmployees];
      return;
    }

    const results: Employee[] = this.allEmployees.filter((employee) =>
      employee.name.toLowerCase().includes(key.toLowerCase()) ||
      employee.email.toLowerCase().includes(key.toLowerCase()) ||
      employee.phone.toLowerCase().includes(key.toLowerCase()) ||
      employee.jobTitle.toLowerCase().includes(key.toLowerCase())
    );

    this.employees = results;
  }

  // Theme toggle logic
  public toggleTheme(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isDarkTheme = isChecked;
    if (isChecked) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme === 'dark';
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
    }
  }

  // Open modal dynamically
  public onOpenModal(employee: Employee | null, mode: string): void {
    const container = document.getElementById('main-container');
    const button = document.createElement('button');
    button.type = 'button';
    button.style.display = 'none';
    button.setAttribute('data-toggle', 'modal');

    if (mode === 'add') {
      this.newEmployee = {} as Employee;
      button.setAttribute('data-target', '#addEmployeeModal');
    } else if (mode === 'edit') {
      this.editEmployee = { ...employee! };
      button.setAttribute('data-target', '#updateEmployeeModal');
    } else if (mode === 'delete') {
      this.selectedEmployee = { ...employee! };
      button.setAttribute('data-target', '#deleteEmployeeModal');
    }

    container?.appendChild(button);
    button.click();
  }
}
