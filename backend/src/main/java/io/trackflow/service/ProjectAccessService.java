package io.trackflow.service;

import io.trackflow.entity.Project;
import io.trackflow.entity.Role;
import io.trackflow.entity.User;
import io.trackflow.exception.AccessDeniedException;
import io.trackflow.exception.ResourceNotFoundException;
import io.trackflow.repository.ProjectRepository;
import io.trackflow.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectAccessService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectAccessService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public User assertMember(String projectId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        // ADMIN role bypasses membership checks and can access everything
        if (user.getRole() == Role.ADMIN) {
            return user;
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        boolean isLead = project.getLead() != null && project.getLead().getId().equals(user.getId());
        boolean isMember = project.getMembers() != null && project.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(user.getId()));

        if (!isLead && !isMember) {
            throw new AccessDeniedException("Access Denied: You are not a member of project " + project.getKey());
        }

        return user;
    }

    @Transactional(readOnly = true)
    public boolean isMember(Project project, User user) {
        if (user.getRole() == Role.ADMIN) {
            return true;
        }
        if (project.getLead() != null && project.getLead().getId().equals(user.getId())) {
            return true;
        }
        return project.getMembers() != null && project.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(user.getId()));
    }
}
