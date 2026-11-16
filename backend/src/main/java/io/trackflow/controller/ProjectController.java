package io.trackflow.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.trackflow.dto.CreateProjectRequest;
import io.trackflow.dto.ProjectDto;
import io.trackflow.dto.UpdateMembersRequest;
import io.trackflow.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@Tag(name = "Projects", description = "Endpoints for project lifecycle and team member roster management")
@SecurityRequirement(name = "BearerAuth")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    @Operation(summary = "List all engineering projects where user is member or admin")
    public ResponseEntity<List<ProjectDto>> getAllProjects(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(projectService.getAllProjects(userDetails.getUsername()));
    }

    @GetMapping("/{key}")
    @Operation(summary = "Get project details by project key (e.g. CORE, AUTH)")
    public ResponseEntity<ProjectDto> getProjectByKey(
            @PathVariable String key,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(projectService.getProjectByKey(key, userDetails.getUsername()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create a new project workspace (Admin/Manager only)")
    public ResponseEntity<ProjectDto> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ProjectDto project = projectService.createProject(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(project);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Permanently delete a project and all associated issues (Admin only)")
    public ResponseEntity<Void> deleteProject(@PathVariable String id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update team member roster and roles for a project (Admin/Manager only)")
    public ResponseEntity<ProjectDto> updateMembers(
            @PathVariable String id,
            @RequestBody UpdateMembersRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ProjectDto updated = projectService.updateMembers(id, request.getMembers(), userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }
}
