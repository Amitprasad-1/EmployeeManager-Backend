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
			try (java.sql.Connection connection = java.util.Objects.requireNonNull(jdbcTemplate.getDataSource()).getConnection()) {
				String dbName = connection.getMetaData().getDatabaseProductName().toLowerCase();
				if (dbName.contains("mysql")) {
					jdbcTemplate.execute("ALTER TABLE employee MODIFY image_url LONGTEXT");
					System.out.println("--- MySQL: image_url column successfully altered to LONGTEXT ---");
				} else if (dbName.contains("postgresql")) {
					jdbcTemplate.execute("ALTER TABLE employee ALTER COLUMN image_url TYPE TEXT");
					System.out.println("--- PostgreSQL: image_url column successfully altered to TEXT ---");
				} else if (dbName.contains("h2")) {
					jdbcTemplate.execute("ALTER TABLE employee ALTER COLUMN image_url CLOB");
					System.out.println("--- H2: image_url column successfully altered to CLOB ---");
				} else {
					try {
						jdbcTemplate.execute("ALTER TABLE employee MODIFY image_url LONGTEXT");
						System.out.println("--- Generic MySQL-style: image_url column successfully altered ---");
					} catch (Exception ex) {
						jdbcTemplate.execute("ALTER TABLE employee ALTER COLUMN image_url TYPE TEXT");
						System.out.println("--- Generic PostgreSQL-style: image_url column successfully altered ---");
					}
				}
			} catch (Exception e) {
				System.out.println("--- Column alter failed or already altered: " + e.getMessage() + " ---");
			}
		};
	}
}
