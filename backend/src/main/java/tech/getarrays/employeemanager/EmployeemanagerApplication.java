package tech.getarrays.employeemanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter; // ✅ Spring's CorsFilter

import java.util.Arrays;
import java.util.List;


@SpringBootApplication
public class EmployeemanagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(EmployeemanagerApplication.class, args);
	}

	@Bean
	public org.springframework.boot.CommandLineRunner alterTableColumn(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE employee MODIFY image_url LONGTEXT");
				System.out.println("--- image_url column successfully altered to LONGTEXT ---");
			} catch (Exception e) {
				System.out.println("--- Column alter failed or already altered: " + e.getMessage() + " ---");
			}
		};
	}
}
