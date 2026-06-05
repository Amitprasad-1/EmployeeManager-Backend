package tech.getarrays.employeemanager.model;

import jakarta.persistence.*;
import java.io.Serializable;
@Entity
public class Employee implements Serializable   {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false,updatable = false)
    private Long id;
    private String name;
    private String email;
    private String jobTitle;
    private String phone;
    @Column(columnDefinition = "LONGTEXT")
    private String imageUrl;
    @Column(nullable = false,updatable = false)
    private String employeeCode;
    private String department;
    private String status;
    private String dateOfJoining;
    private String contractType;

    public Employee(){}
    public Employee(String name,String email,String jobTitle,String phone,String imageUrl,String employeeCode){
        this.name=name;
        this.email=email;
        this.jobTitle=jobTitle;
        this.phone=phone;
        this.imageUrl=imageUrl;
        this.employeeCode=employeeCode;

    }

    public Long getId()
    {
        return id;
    }
    public void setId(Long id)
    {
        this.id=id;
    }

    public String getName()
    {
        return name;
    }
    public void setName(String name)
    {
        this.name=name;
    }

    public String getEmail()
    {
        return email;
    }
    public void setEmail(String email)
    {
        this.email=email;
    }

    public String getJobTitle(){
        return jobTitle;
    }
    public void setJobTitle(String jobTitle)
    {
        this.jobTitle=jobTitle;
    }

    public String getPhone(){
        return phone;
    }
    public void setPhone(String phone)
    {
        this.phone=phone;
    }

    public String getImageUrl(){
        return imageUrl;
    }
    public void setImageUrl(String imageUrl)
    {
        this.imageUrl=imageUrl;
    }

    public String getEmployeeCode(){
        return employeeCode;
    }
    public void setEmployeeCode(String employeeCode)
    {
        this.employeeCode=employeeCode;
    }

    public String getDepartment() {
        return department;
    }
    public void setDepartment(String department) {
        this.department = department;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    public String getDateOfJoining() {
        return dateOfJoining;
    }
    public void setDateOfJoining(String dateOfJoining) {
        this.dateOfJoining = dateOfJoining;
    }

    public String getContractType() {
        return contractType;
    }
    public void setContractType(String contractType) {
        this.contractType = contractType;
    }

    @Override
    public String toString() {
        return "Employee{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", jobTitle='" + jobTitle + '\'' +
                ", phone='" + phone + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", department='" + department + '\'' +
                ", status='" + status + '\'' +
                ", dateOfJoining='" + dateOfJoining + '\'' +
                ", contractType='" + contractType + '\'' +
                '}';
    }
}
