import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForm, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EmployeeService } from '../employee.service';
import { Employee } from '../employee';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public employees: Employee[] = [];
  private allEmployees: Employee[] = [];
  public newEmployee: Employee = {} as Employee;
  public editEmployee: Employee = {} as Employee;
  public selectedEmployee: Employee = {} as Employee;
  public searchKey: string = '';
  public isDarkTheme: boolean = false;
  public isLoading: boolean = true;

  // Filter and Sorting state
  public filterDepartment: string = 'All';
  public filterStatus: string = 'All';
  public sortBy: string = 'nameAsc';
  public departments: string[] = [];
  
  // Toast notifications state
  public toasts: Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }> = [];
  private toastIdCounter = 0;

  // Upload and Cropping state
  public showUrlInputAdd: boolean = false;
  public showUrlInputEdit: boolean = false;
  public cropImageSrc: string | null = null;
  public croppingMode: 'add' | 'edit' | null = null;
  public zoom: number = 1;
  public minZoom: number = 0.1;
  public maxZoom: number = 4;
  public panX: number = 0;
  public panY: number = 0;
  private isDragging = false;
  private startX = 0;
  private startY = 0;

  // Dashboard statistics fields
  public totalEmployeesCount: number = 0;
  public totalJobTitlesCount: number = 0;
  public activeContractsCount: number = 0;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getEmployees();
    this.loadTheme(); // Load theme preference on page load
  }

  // Auth Helpers
  public isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  public isGuest(): boolean {
    return this.authService.isGuest();
  }

  public getUsername(): string {
    return this.authService.getUsername();
  }

  public getRoleName(): string {
    const role = this.authService.getRole();
    if (role === 'ROLE_ADMIN') return 'Administrator';
    if (role === 'ROLE_USER') return 'User';
    return 'Guest';
  }

  public logout(): void {
    this.authService.logout();
    this.showToast('Logged out successfully', 'info');
    this.router.navigate(['/login']);
  }

  public goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Show toast notification
  public showToast(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    const id = this.toastIdCounter++;
    this.toasts.push({ id, message, type });
    setTimeout(() => {
      this.removeToast(id);
    }, 4000);
  }

  // Remove toast notification
  public removeToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  // Fetch all employees
  public getEmployees(): void {
    this.isLoading = true;
    this.employeeService.getEmployee().subscribe({
      next: (response: Employee[]) => {
        this.employees = response;
        this.allEmployees = response; // backup list for search
        this.calculateStats();
        this.updateDepartmentsList(); // update dropdown choices
        this.applyFilters(); // run active search/filter/sort
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.showToast('Failed to load team members.', 'error');
        this.isLoading = false;
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
    if (!this.isAdmin()) {
      this.showToast('Access denied: Administrator privileges required.', 'error');
      return;
    }
    this.employeeService.addEmployee(this.newEmployee).subscribe({
      next: (response: Employee) => {
        console.log(response);
        document.getElementById('add-employee-close')?.click();
        this.getEmployees();
        addForm.reset();
        this.newEmployee = {} as Employee;
        this.showToast('Employee added successfully!', 'success');
      },
      error: (error: HttpErrorResponse) => {
        this.showToast('Failed to add employee: ' + error.message, 'error');
        addForm.reset();
        this.newEmployee = {} as Employee;
      }
    });
  }

  // Update employee
  public onUpdateEmployee(editForm: NgForm): void {
    if (!this.isAdmin()) {
      this.showToast('Access denied: Administrator privileges required.', 'error');
      return;
    }
    this.employeeService.updateEmployee(this.editEmployee).subscribe({
      next: (response: Employee) => {
        console.log(response);
        document.getElementById('update-employee-close')?.click();
        this.getEmployees();
        this.showToast('Employee details updated successfully!', 'success');
      },
      error: (error: HttpErrorResponse) => {
        this.showToast('Failed to update employee details.', 'error');
      }
    });
  }

  // Delete employee
  public onDeleteEmployee(): void {
    if (!this.isAdmin()) {
      this.showToast('Access denied: Administrator privileges required.', 'error');
      return;
    }
    this.employeeService.deleteEmployee(this.selectedEmployee.id).subscribe({
      next: () => {
        console.log('Deleted successfully');
        document.getElementById('delete-employee-close')?.click();
        this.getEmployees();
        this.showToast('Employee deleted successfully.', 'success');
      },
      error: (error: HttpErrorResponse) => {
        this.showToast('Failed to delete employee.', 'error');
      }
    });
  }

  // Search employees
  public searchEmployees(key: string): void {
    this.searchKey = key;
    this.applyFilters();
  }

  // Extract unique departments from loaded employees list
  private updateDepartmentsList(): void {
    const depts = this.allEmployees
      .map(e => e.department)
      .filter((dept): dept is string => !!dept && dept.trim() !== '');
    this.departments = Array.from(new Set(depts)).sort();
  }

  // Filter and sort core logic
  public applyFilters(): void {
    let filtered = [...this.allEmployees];

    // 1. Search filter
    const search = this.searchKey.trim().toLowerCase();
    if (search) {
      filtered = filtered.filter(e =>
        (e.name || '').toLowerCase().includes(search) ||
        (e.email || '').toLowerCase().includes(search) ||
        (e.phone || '').toLowerCase().includes(search) ||
        (e.jobTitle || '').toLowerCase().includes(search) ||
        (e.department || '').toLowerCase().includes(search)
      );
    }

    // 2. Department filter
    if (this.filterDepartment !== 'All') {
      filtered = filtered.filter(e => e.department === this.filterDepartment);
    }

    // 3. Status filter
    if (this.filterStatus !== 'All') {
      filtered = filtered.filter(e => e.status === this.filterStatus);
    }

    // 4. Sort selection
    if (this.sortBy === 'nameAsc') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (this.sortBy === 'nameDesc') {
      filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else if (this.sortBy === 'dateNewest') {
      filtered.sort((a, b) => (b.dateOfJoining || '').localeCompare(a.dateOfJoining || ''));
    } else if (this.sortBy === 'dateOldest') {
      filtered.sort((a, b) => (a.dateOfJoining || '').localeCompare(b.dateOfJoining || ''));
    }

    this.employees = filtered;
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
      this.newEmployee = {
        status: 'Active',
        contractType: 'Full-time',
        department: 'Engineering',
        dateOfJoining: new Date().toISOString().slice(0, 10)
      } as Employee;
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
    if (!img || !container) return;
    
    // setTimeout avoids layout race conditions during view initialization
    setTimeout(() => {
      const containerWidth = container.clientWidth || 350;
      const containerHeight = container.clientHeight || 280;
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      // Minimum zoom to cover the 180px crop box
      const scaleX = 180 / imgWidth;
      const scaleY = 180 / imgHeight;
      this.minZoom = Math.max(scaleX, scaleY);
      this.maxZoom = this.minZoom * 4;
      this.zoom = this.minZoom;

      // Initial center position (centered relative to 0 0 origin)
      this.panX = (containerWidth - imgWidth * this.zoom) / 2;
      this.panY = (containerHeight - imgHeight * this.zoom) / 2;
    }, 50);
  }

  // Drag handlers
  public startDrag(event: MouseEvent | TouchEvent): void {
    this.isDragging = true;
    let clientX = 0;
    let clientY = 0;
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      return;
    }
    this.startX = clientX - this.panX;
    this.startY = clientY - this.panY;
  }

  public drag(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;
    let clientX = 0;
    let clientY = 0;
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      return;
    }
    event.preventDefault();
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

  public adjustZoom(amount: number): void {
    const newZoom = this.zoom + amount;
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
  }

  public onWheel(event: WheelEvent): void {
    event.preventDefault();
    const amount = event.deltaY < 0 ? 0.05 : -0.05;
    this.adjustZoom(amount);
  }

  // Crop image using canvas drawImage
  public applyCrop(img: HTMLImageElement, container: HTMLDivElement): void {
    if (!img || !container) return;
    const containerWidth = container.clientWidth || 350;
    const containerHeight = container.clientHeight || 280;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    const cropBoxWidth = 180;
    const cropBoxHeight = 180;
    const cropBoxLeft = (containerWidth - cropBoxWidth) / 2;
    const cropBoxTop = (containerHeight - cropBoxHeight) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background fill to ensure clean edges under transparent areas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 180, 180);

      // Calculate relative drawing offset from crop box top-left
      const drawX = this.panX - cropBoxLeft;
      const drawY = this.panY - cropBoxTop;

      ctx.drawImage(
        img,
        drawX,
        drawY,
        imgWidth * this.zoom,
        imgHeight * this.zoom
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

  // Export employees list to CSV format
  public exportToCSV(): void {
    if (this.employees.length === 0) {
      this.showToast('No employee records to export.', 'info');
      return;
    }

    const headers = ['Employee ID', 'Name', 'Email', 'Job Title', 'Phone', 'Employee Code'];
    const csvRows = [headers.join(',')];

    for (const employee of this.employees) {
      const row = [
        employee.id || '',
        `"${(employee.name || '').replace(/"/g, '""')}"`,
        `"${(employee.email || '').replace(/"/g, '""')}"`,
        `"${(employee.jobTitle || '').replace(/"/g, '""')}"`,
        `"${(employee.phone || '').replace(/"/g, '""')}"`,
        `"${(employee.employeeCode || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Employee list exported to CSV successfully!', 'success');
  }
}
