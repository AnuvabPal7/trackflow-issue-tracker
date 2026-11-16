package io.trackflow.config;

import io.trackflow.entity.*;
import io.trackflow.repository.CommentRepository;
import io.trackflow.repository.IssueRepository;
import io.trackflow.repository.ProjectRepository;
import io.trackflow.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
@Profile("dev")
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final CommentRepository commentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(UserRepository userRepository,
                      ProjectRepository projectRepository,
                      IssueRepository issueRepository,
                      CommentRepository commentRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.issueRepository = issueRepository;
        this.commentRepository = commentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Already initialized
        }

        String encodedPass = passwordEncoder.encode("password123");

        // 1. Seed Users
        User sarah = userRepository.save(new User(
                "sarah.connor@enterprise.io",
                encodedPass,
                "Sarah Connor",
                Role.ADMIN,
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
                "Director of Engineering",
                "Platform Architecture"
        ));

        User alex = userRepository.save(new User(
                "alex.rivera@enterprise.io",
                encodedPass,
                "Alex Rivera",
                Role.MANAGER,
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
                "Engineering Sprint Lead",
                "Cloud Core Services"
        ));

        User maya = userRepository.save(new User(
                "maya.chen@enterprise.io",
                encodedPass,
                "Maya Chen",
                Role.DEVELOPER,
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
                "Senior Java / Spring Engineer",
                "Backend API Team"
        ));

        User leo = userRepository.save(new User(
                "leo.kim@enterprise.io",
                encodedPass,
                "Leo Kim",
                Role.DEVELOPER,
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
                "Full Stack Developer",
                "Web Applications Team"
        ));

        User devon = userRepository.save(new User(
                "devon.vance@enterprise.io",
                encodedPass,
                "Devon Vance",
                Role.DEVELOPER,
                "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
                "DevOps & Reliability Engineer",
                "Infrastructure"
        ));

        // 2. Seed Projects
        Project coreProj = new Project(
                "CORE",
                "Cloud Core Platform",
                "Central microservices hub handling distributed ticketing, event publishing, and high-throughput transaction routing.",
                alex
        );
        coreProj.setIssueCountSequence(105);
        coreProj.getMembers().add(new ProjectMember(coreProj, sarah, Role.ADMIN));
        coreProj.getMembers().add(new ProjectMember(coreProj, alex, Role.MANAGER));
        coreProj.getMembers().add(new ProjectMember(coreProj, maya, Role.DEVELOPER));
        coreProj.getMembers().add(new ProjectMember(coreProj, leo, Role.DEVELOPER));
        coreProj.getMembers().add(new ProjectMember(coreProj, devon, Role.DEVELOPER));
        coreProj = projectRepository.save(coreProj);

        Project authProj = new Project(
                "AUTH",
                "Security & Auth Gateway",
                "Spring Security 6 with stateless JWT access/refresh token rotation and RBAC policy enforcement.",
                sarah
        );
        authProj.setIssueCountSequence(45);
        authProj.getMembers().add(new ProjectMember(authProj, sarah, Role.ADMIN));
        authProj.getMembers().add(new ProjectMember(authProj, maya, Role.DEVELOPER));
        projectRepository.save(authProj);

        // 3. Seed Issues
        Issue iss1 = new Issue();
        iss1.setKey("CORE-101");
        iss1.setProject(coreProj);
        iss1.setTitle("Fix HikariCP connection pool starvation during bulk issue export");
        iss1.setDescription("Hibernate session was kept open during CSV streaming serialization instead of using a read-only cursor.");
        iss1.setType(IssueType.BUG);
        iss1.setPriority(IssuePriority.HIGHEST);
        iss1.setStatus(IssueStatus.IN_PROGRESS);
        iss1.setAssignee(maya);
        iss1.setReporter(alex);
        iss1.setStoryPoints(5);
        iss1.setSprint("Sprint 14");
        iss1.setLabels(List.of("backend", "spring-boot", "performance", "database"));
        iss1.setDueDate("2026-11-14");
        iss1 = issueRepository.save(iss1);

        Comment c1 = new Comment(iss1, maya, "Investigated the thread dump. Switching to JDBC streaming query solves the retention leak.");
        commentRepository.save(c1);

        Issue iss2 = new Issue();
        iss2.setKey("CORE-102");
        iss2.setProject(coreProj);
        iss2.setTitle("Implement drag-and-drop Kanban card transitions with optimistic updates");
        iss2.setDescription("Cards animate smoothly with drop indicators across agile stages.");
        iss2.setType(IssueType.STORY);
        iss2.setPriority(IssuePriority.HIGH);
        iss2.setStatus(IssueStatus.IN_REVIEW);
        iss2.setAssignee(leo);
        iss2.setReporter(alex);
        iss2.setStoryPoints(8);
        iss2.setSprint("Sprint 14");
        iss2.setLabels(List.of("frontend", "kanban", "ux"));
        iss2.setDueDate("2026-11-12");
        issueRepository.save(iss2);

        Issue iss3 = new Issue();
        iss3.setKey("CORE-103");
        iss3.setProject(coreProj);
        iss3.setTitle("Add multipart screenshot file upload with thumbnail preview");
        iss3.setDescription("Support drag-and-drop file upload for issue reproduction screenshots.");
        iss3.setType(IssueType.TASK);
        iss3.setPriority(IssuePriority.MEDIUM);
        iss3.setStatus(IssueStatus.TO_DO);
        iss3.setAssignee(leo);
        iss3.setReporter(sarah);
        iss3.setStoryPoints(3);
        iss3.setSprint("Sprint 14");
        iss3.setLabels(List.of("attachments", "ui", "storage"));
        iss3.setDueDate("2026-11-16");
        issueRepository.save(iss3);

        Issue iss4 = new Issue();
        iss4.setKey("CORE-104");
        iss4.setProject(coreProj);
        iss4.setTitle("JWT access token refresh endpoint fails when header contains lowercase bearer prefix");
        iss4.setDescription("Resolved by using case-insensitive region match on authorization header.");
        iss4.setType(IssueType.BUG);
        iss4.setPriority(IssuePriority.HIGH);
        iss4.setStatus(IssueStatus.DONE);
        iss4.setAssignee(maya);
        iss4.setReporter(maya);
        iss4.setStoryPoints(2);
        iss4.setSprint("Sprint 14");
        iss4.setLabels(List.of("security", "jwt", "auth"));
        iss4.setDueDate("2026-11-08");
        issueRepository.save(iss4);
    }
}
