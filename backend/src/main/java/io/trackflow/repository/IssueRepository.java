package io.trackflow.repository;

import io.trackflow.entity.Issue;
import io.trackflow.entity.IssuePriority;
import io.trackflow.entity.IssueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IssueRepository extends JpaRepository<Issue, String> {

    List<Issue> findByProjectId(String projectId);

    Optional<Issue> findByKey(String key);

    @Query("SELECT i FROM Issue i WHERE i.project.id = :projectId " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:priority IS NULL OR i.priority = :priority) " +
           "AND (:assigneeId IS NULL OR (i.assignee IS NOT NULL AND i.assignee.id = :assigneeId)) " +
           "AND (:search IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(i.key) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Issue> findWithFilters(
            @Param("projectId") String projectId,
            @Param("status") IssueStatus status,
            @Param("priority") IssuePriority priority,
            @Param("assigneeId") String assigneeId,
            @Param("search") String search,
            Pageable pageable
    );
}
