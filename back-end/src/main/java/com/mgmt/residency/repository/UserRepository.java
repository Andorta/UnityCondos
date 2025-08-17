package com.mgmt.residency.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mgmt.residency.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

	User findByEmail(String email);

	boolean existsByEmail(String email);

	boolean existsByRole(String role);

	User findByIdAndRoleNot(String userId, String name);

	User findByIdAndRole(String userId, String name);

	@Query("SELECT u FROM User u " + "WHERE LOWER(u.role) <> 'role_admin' "
			+ "AND (:roleType IS NULL OR LOWER(u.role) = LOWER(:roleType)) "
			+ "AND (:status IS NULL OR LOWER(u.status) = LOWER(:status)) " + "AND ("
			+ "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchText, '%')) OR "
			+ "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchText, '%')) OR "
			+ "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchText, '%')) OR "
			+ "LOWER(u.designation) LIKE LOWER(CONCAT('%', :searchText, '%'))" + ")")
	List<User> searchUsers(@Param("searchText") String searchText, @Param("roleType") String roleType,
			@Param("status") String status);

	@Query("""
			    SELECT u FROM User u
			    WHERE u.status = 'ACTIVE'
			    AND u.role <> 'ROLE_ADMIN'
			    AND (:searchText IS NULL OR LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :searchText, '%')))
			    AND (:role IS NULL OR u.role = :role)
			    AND (:designation IS NULL OR u.designation = :designation)
			""")
	List<User> searchActiveUsersByKey(@Param("searchText") String searchText, @Param("role") String role,
			@Param("designation") String designation);

	List<User> findAllByRoleNot(String name);

	List<User> findAllByRole(String name);

	List<User> findAllByRoleAndStatus(String name, String name2);

	List<User> findAllByRoleNotAndStatus(String name, String name2);

	List<User> findAllByCreatedAtAfter(LocalDateTime tenDaysAgo);

}
