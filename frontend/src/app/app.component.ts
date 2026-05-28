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
  
  // Upload and Cropping state
  public showUrlInputAdd: boolean = false;
  public showUrlInputEdit: boolean = false;
  public cropImageSrc: string | null = null;
  public croppingMode: 'add' | 'edit' | null = null;
  public zoom: number = 1;
  public panX: number = 0;
  public panY: number = 0;
  private isDragging = false;
  private startX = 0;
  private startY = 0;

  // Dashboard statistics fields
  public totalEmployeesCount: number = 0;
  public totalJobTitlesCount: number = 0;
  public activeContractsCount: number = 0;

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
        this.calculateStats();
      },
      error: (error: HttpErrorResponse) => {
        alert(error.message);
      }
    });
  }

  private calculateStats(): void {
    this.totalEmployeesCount = this.allEmployees.length;
    
    const uniqueTitles = new Set(
      this.allEmployees
        .filter(e => e.jobTitle)
        .map(e => e.jobTitle.trim().toLowerCase())
    );
    this.totalJobTitlesCount = uniqueTitles.size;
    
    this.activeContractsCount = this.allEmployees.filter(e => e.phone && e.email).length;
  }

  // Add new employee
  public onAddEmployee(addForm: NgForm): void {
    this.employeeService.addEmployee(this.newEmployee).subscribe({
      next: (response: Employee) => {
        console.log(response);
        document.getElementById('add-employee-close')?.click();
        this.getEmployees();
        addForm.reset();
        this.newEmployee = {} as Employee;
      },
      error: (error: HttpErrorResponse) => {
        alert(error.message);
        addForm.reset();
        this.newEmployee = {} as Employee;
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
      this.cancelCrop();
      this.showUrlInputAdd = false;
      this.newEmployee = {} as Employee;
      button.setAttribute('data-target', '#addEmployeeModal');
    } else if (mode === 'edit') {
      this.cancelCrop();
      this.showUrlInputEdit = false;
      this.editEmployee = { ...employee! };
      button.setAttribute('data-target', '#updateEmployeeModal');
    } else if (mode === 'delete') {
      this.selectedEmployee = { ...employee! };
      button.setAttribute('data-target', '#deleteEmployeeModal');
    }

    container?.appendChild(button);
    button.click();
  }

  // File selection event handler
  public onFileSelected(event: Event, mode: 'add' | 'edit'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.cropImageSrc = reader.result as string;
        this.croppingMode = mode;
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
      };
      reader.readAsDataURL(file);
    }
  }

  // Centering & scaling image when loaded
  public onImageLoaded(img: HTMLImageElement, container: HTMLDivElement): void {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // Minimum zoom to cover the 180px crop box
    const scaleX = 180 / imgWidth;
    const scaleY = 180 / imgHeight;
    const minZoom = Math.max(scaleX, scaleY);
    this.zoom = Math.max(minZoom, 1);

    // Initial center position
    this.panX = (containerWidth - imgWidth) / 2;
    this.panY = (containerHeight - imgHeight) / 2;
  }

  // Drag handlers
  public startDrag(event: MouseEvent | TouchEvent): void {
    this.isDragging = true;
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    this.startX = clientX - this.panX;
    this.startY = clientY - this.panY;
  }

  public drag(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;
    event.preventDefault();
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    this.panX = clientX - this.startX;
    this.panY = clientY - this.startY;
  }

  public endDrag(): void {
    this.isDragging = false;
  }

  public cancelCrop(): void {
    this.cropImageSrc = null;
    this.croppingMode = null;
  }

  // Crop image using canvas drawImage
  public applyCrop(img: HTMLImageElement, container: HTMLDivElement): void {
    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const cropBoxWidth = 180;
    const cropBoxHeight = 180;
    const cropBoxLeft = containerRect.left + (containerRect.width - cropBoxWidth) / 2;
    const cropBoxTop = containerRect.top + (containerRect.height - cropBoxHeight) / 2;

    // Relative offset to scaled screen image
    const cropX = cropBoxLeft - imgRect.left;
    const cropY = cropBoxTop - imgRect.top;

    // Scale mapping factor
    const scaleFactor = img.naturalWidth / imgRect.width;

    const sourceX = cropX * scaleFactor;
    const sourceY = cropY * scaleFactor;
    const sourceWidth = cropBoxWidth * scaleFactor;
    const sourceHeight = cropBoxHeight * scaleFactor;

    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background fill to ensure clean edges
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 180, 180);
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        180,
        180
      );
      
      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85);
      
      if (this.croppingMode === 'add') {
        this.newEmployee.imageUrl = croppedBase64;
      } else if (this.croppingMode === 'edit') {
        this.editEmployee.imageUrl = croppedBase64;
      }
    }
    this.cancelCrop();
  }
}
