package io.trackflow.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.trackflow.dto.CreateIssueRequest;
import io.trackflow.dto.IssueDto;
import io.trackflow.dto.StatusTransitionRequest;
import io.trackflow.dto.UpdateIssueRequest;
import io.trackflow.entity.IssuePriority;
import io.trackflow.entity.IssueStatus;
import io.trackflow.service.IssueService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/issues")
@Tag(name = "Issues & Bugs", description = "Endpoints for creating, filtering, transitioning, and managing tickets")
@SecurityRequirement(name = "BearerAuth")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @GetMapping
    @Operation(summary = "List and filter issues by project, status, priority, or search term")
    public ResponseEntity<List<IssueDto>> getIssues(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) IssueStatus status,
            @RequestParam(required = false) IssuePriority priority,
            @RequestParam(required = false) String assigneeId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (projectId != null && (status != null || priority != null || assigneeId != null || search != null)) {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
            Page<IssueDto> paged = issueService.getIssuesWithFilters(projectId, status, priority, assigneeId, search, pageable, userDetails.getUsername());
            return ResponseEntity.ok(paged.getContent());
        }

        if (projectId != null) {
            return ResponseEntity.ok(issueService.getIssuesByProjectId(projectId, userDetails.getUsername()));
        }

        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get full issue details by ID")
    public ResponseEntity<IssueDto> getIssueById(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(issueService.getIssueById(id, userDetails.getUsername()));
    }

    @PostMapping
    @Operation(summary = "Create a new bug report, user story, task, or epic")
    public ResponseEntity<IssueDto> createIssue(
            @Valid @RequestBody CreateIssueRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        IssueDto created = issueService.createIssue(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update ticket fields (Developers can edit only their assigned/reported issues)")
    public ResponseEntity<IssueDto> updateIssue(
            @PathVariable String id,
            @RequestBody UpdateIssueRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        IssueDto updated = issueService.updateIssue(id, request, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Transition issue status across Kanban workflow (TO_DO -> IN_PROGRESS -> DONE)")
    public ResponseEntity<Void> transitionStatus(
            @PathVariable String id,
            @Valid @RequestBody StatusTransitionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        issueService.transitionStatus(id, request.getStatus(), userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Permanently delete an issue (Admin/Manager only)")
    public ResponseEntity<Void> deleteIssue(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        issueService.deleteIssue(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
