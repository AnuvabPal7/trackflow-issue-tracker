package io.trackflow.service;

import io.trackflow.dto.CommentDto;
import io.trackflow.dto.CreateCommentRequest;
import io.trackflow.entity.Comment;
import io.trackflow.entity.Issue;
import io.trackflow.entity.Role;
import io.trackflow.entity.User;
import io.trackflow.exception.AccessDeniedException;
import io.trackflow.exception.ResourceNotFoundException;
import io.trackflow.repository.CommentRepository;
import io.trackflow.repository.IssueRepository;
import io.trackflow.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final ProjectAccessService projectAccessService;

    public CommentService(CommentRepository commentRepository,
                          IssueRepository issueRepository,
                          UserRepository userRepository,
                          ProjectAccessService projectAccessService) {
        this.commentRepository = commentRepository;
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.projectAccessService = projectAccessService;
    }

    @Transactional(readOnly = true)
    public List<CommentDto> getCommentsByIssueId(String issueId, String userEmail) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found: " + issueId));
        projectAccessService.assertMember(issue.getProject().getId(), userEmail);

        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId).stream()
                .map(CommentDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentDto addComment(String issueId, CreateCommentRequest request, String userEmail) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found: " + issueId));

        projectAccessService.assertMember(issue.getProject().getId(), userEmail);

        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found: " + userEmail));

        Comment comment = new Comment(issue, author, request.getContent().trim());
        Comment saved = commentRepository.save(comment);
        return new CommentDto(saved);
    }

    @Transactional
    public void deleteComment(String commentId, String userEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        projectAccessService.assertMember(comment.getIssue().getProject().getId(), userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        // Admin, Manager, or the original comment author can delete
        boolean isAuthor = comment.getAuthor().getId().equals(user.getId());
        boolean isPrivileged = user.getRole() == Role.ADMIN || user.getRole() == Role.MANAGER;

        if (!isAuthor && !isPrivileged) {
            throw new AccessDeniedException("You are not authorized to delete this comment.");
        }

        commentRepository.delete(comment);
    }
}
