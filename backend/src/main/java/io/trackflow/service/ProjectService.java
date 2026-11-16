package io.trackflow.service;

import io.trackflow.dto.CreateProjectRequest;
import io.trackflow.dto.ProjectDto;
import io.trackflow.dto.ProjectMemberDto;
import io.trackflow.entity.Project;
import io.trackflow.entity.ProjectMember;
import io.trackflow.entity.Role;
import io.trackflow.entity.User;
import io.trackflow.exception.BadRequestException;
import io.trackflow.exception.ResourceNotFoundException;
import io.trackflow.repository.ProjectRepository;
import io.trackflow.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectAccessService projectAccessService;

    public ProjectService(ProjectRepository projectRepository,
                          UserRepository userRepository,
                          ProjectAccessService projectAccessService) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.projectAccessService = projectAccessService;
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getAllProjects(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return projectRepository.findAll().stream()
                .filter(p -> projectAccessService.isMember(p, user))
                .map(ProjectDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDto getProjectByKey(String key, String userEmail) {
        Project project = projectRepository.findByKeyIgnoreCase(key)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with key: " + key));
        projectAccessService.assertMember(project.getId(), userEmail);
        return new ProjectDto(project);
    }

    @Transactional
    public ProjectDto createProject(CreateProjectRequest request, String userEmail) {
        String cleanKey = request.getKey().toUpperCase().trim();
        if (projectRepository.existsByKeyIgnoreCase(cleanKey)) {
            throw new BadRequestException("Project key already exists: " + cleanKey);
        }

        User lead = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Lead user not found"));

        Project project = new Project(cleanKey, request.getName(), request.getDescription(), lead);
        project.setIssueCountSequence(0);

        // Add lead as Admin project member
        ProjectMember leadMember = new ProjectMember(project, lead, Role.ADMIN);
        project.getMembers().add(leadMember);

        Project saved = projectRepository.save(project);
        return new ProjectDto(saved);
    }

    @Transactional
    public void deleteProject(String id) {
        if (!projectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Project not found: " + id);
        }
        projectRepository.deleteById(id);
    }

    @Transactional
    public ProjectDto updateMembers(String projectId, List<ProjectMemberDto> memberDtos, String userEmail) {
        projectAccessService.assertMember(projectId, userEmail);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        project.getMembers().clear();

        for (ProjectMemberDto dto : memberDtos) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + dto.getUserId()));
            ProjectMember member = new ProjectMember(project, user, dto.getRole());
            project.getMembers().add(member);
        }

        Project updated = projectRepository.save(project);
        return new ProjectDto(updated);
    }
}