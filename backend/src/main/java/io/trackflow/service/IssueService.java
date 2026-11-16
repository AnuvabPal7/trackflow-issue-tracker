package io.trackflow.service;

import io.trackflow.dto.CreateIssueRequest;
import io.trackflow.dto.IssueDto;
import io.trackflow.dto.UpdateIssueRequest;
import io.trackflow.entity.*;
import io.trackflow.exception.AccessDeniedException;
import io.trackflow.exception.BadRequestException;
import io.trackflow.exception.ResourceNotFoundException;
import io.trackflow.repository.IssueRepository;
import io.trackflow.repository.ProjectRepository;
import io.trackflow.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectAccessService projectAccessService;

    public IssueService(IssueRepository issueRepository,
                        ProjectRepository projectRepository,
                        UserRepository userRepository,
                        ProjectAccessService projectAccessService) {
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.projectAccessService = projectAccessService;
    }

    @Transactional(readOnly = true)
    public List<IssueDto> getIssuesByProjectId(String projectId, String userEmail) {
        projectAccessService.assertMember(projectId, userEmail);
        return issueRepository.findByProjectId(projectId).stream()
                .map(IssueDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<IssueDto> getIssuesWithFilters(String projectId, IssueStatus status, IssuePriority priority,
                                               String assigneeId, String search, Pageable pageable, String userEmail) {
        projectAccessService.assertMember(projectId, userEmail);
        return issueRepository.findWithFilters(projectId, status, priority, assigneeId, search, pageable)
                .map(IssueDto::new);
    }

    @Transactional(readOnly = true)
    public IssueDto getIssueById(String id, String userEmail) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found: " + id));
        projectAccessService.assertMember(issue.getProject().getId(), userEmail);
        return new IssueDto(issue);
    }

    @Transactional
    public IssueDto createIssue(CreateIssueRequest request, String reporterEmail) {
        projectAccessService.assertMember(request.getProjectId(), reporterEmail);

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + request.getProjectId()));

        User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter user not found"));

        User assignee = null;
        if (request.getAssigneeId() != null && !request.getAssigneeId().isBlank()) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found: " + request.getAssigneeId()));

            if (!projectAccessService.isMember(project, assignee)) {
                throw new BadRequestException("Assignee must be a member of project: " + project.getKey());
            }
        }

        int nextSequence = project.getIssueCountSequence() + 1;
        project.setIssueCountSequence(nextSequence);
        projectRepository.save(project);

        String issueKey = project.getKey() + "-" + nextSequence;

        Issue issue = new Issue();
        issue.setKey(issueKey);
        issue.setProject(project);
        issue.setTitle(request.getTitle().trim());
        issue.setDescription(request.getDescription());
        issue.setType(request.getType());
        issue.setPriority(request.getPriority());
        issue.setStatus(request.getStatus());
        issue.setReporter(reporter);
        issue.setAssignee(assignee);
        issue.setStoryPoints(request.getStoryPoints());
        issue.setSprint(request.getSprint() != null ? request.getSprint() : "Sprint 14");
        if (request.getLabels() != null) issue.setLabels(request.getLabels());
        if (request.getComponents() != null) issue.setComponents(request.getComponents());
        issue.setDueDate(request.getDueDate());
        issue.setCreatedAt(Instant.now());
        issue.setUpdatedAt(Instant.now());

        Issue saved = issueRepository.save(issue);
        return new IssueDto(saved);
    }

    @Transactional
    public IssueDto updateIssue(String id, UpdateIssueRequest request, String userEmail) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found: " + id));

        projectAccessService.assertMember(issue.getProject().getId(), userEmail);

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        // Enforce RBAC: DEVELOPER can edit ONLY issues assigned to or reported by them
        if (currentUser.getRole() == Role.DEVELOPER) {
            boolean isAssignee = issue.getAssignee() != null && issue.getAssignee().getId().equals(currentUser.getId());
            boolean isReporter = issue.getReporter().getId().equals(currentUser.getId());
            if (!isAssignee && !isReporter) {
                throw new AccessDeniedException("Developers can edit only issues assigned to or reported by them.");
            }
        }

        if (request.getTitle() != null) issue.setTitle(request.getTitle().trim());
        if (request.getDescription() != null) issue.setDescription(request.getDescription());
        if (request.getType() != null) issue.setType(request.getType());
        if (request.getPriority() != null) issue.setPriority(request.getPriority());
        if (request.getStatus() != null) issue.setStatus(request.getStatus());
        if (request.getStoryPoints() != null) issue.setStoryPoints(request.getStoryPoints());
        if (request.getSprint() != null) issue.setSprint(request.getSprint());
        if (request.getLabels() != null) issue.setLabels(request.getLabels());
        if (request.getComponents() != null) issue.setComponents(request.getComponents());
        if (request.getDueDate() != null) issue.setDueDate(request.getDueDate());

        if (request.getAssigneeId() != null) {
            if (request.getAssigneeId().isBlank()) {
                issue.setAssignee(null);
            } else {
                User newAssignee = userRepository.findById(request.getAssigneeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found: " + request.getAssigneeId()));

                if (!projectAccessService.isMember(issue.getProject(), newAssignee)) {
                    throw new BadRequestException("Assignee must be a member of project: " + issue.getProject().getKey());
                }

                issue.setAssignee(newAssignee);
            }
        }

        issue.setUpdatedAt(Instant.now());
        Issue updated = issueRepository.save(issue);
        return new IssueDto(updated);
    }

    @Transactional
    public void transitionStatus(String id, IssueStatus newStatus, String userEmail) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found: " + id));

        projectAccessService.assertMember(issue.getProject().getId(), userEmail);

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (currentUser.getRole() == Role.DEVELOPER) {
            boolean isAssignee = issue.getAssignee() != null && issue.getAssignee().getId().equals(currentUser.getId());
            boolean isReporter = issue.getReporter().getId().equals(currentUser.getId());
            if (!isAssignee && !isReporter) {
                throw new AccessDeniedException("Developers can transition status only for issues assigned to or reported by them.");
            }
        }

        issue.setStatus(newStatus);
        issue.setUpdatedAt(Instant.now());
        issueRepository.save(issue);
    }

    @Transactional
    public void deleteIssue(String id, String userEmail) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found: " + id));

        projectAccessService.assertMember(issue.getProject().getId(), userEmail);

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (currentUser.getRole() == Role.DEVELOPER) {
            throw new AccessDeniedException("Developers cannot delete issues. Only Admin and Manager are authorized.");
        }

        issueRepository.delete(issue);
    }
}
