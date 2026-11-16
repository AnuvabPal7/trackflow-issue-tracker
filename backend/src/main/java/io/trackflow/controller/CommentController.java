package io.trackflow.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.trackflow.dto.CommentDto;
import io.trackflow.dto.CreateCommentRequest;
import io.trackflow.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/issues/{issueId}/comments")
@Tag(name = "Comments", description = "Endpoints for ticket collaboration and discussion comments")
@SecurityRequirement(name = "BearerAuth")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    @Operation(summary = "Get all comments for an issue")
    public ResponseEntity<List<CommentDto>> getComments(
            @PathVariable String issueId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(commentService.getCommentsByIssueId(issueId, userDetails.getUsername()));
    }

    @PostMapping
    @Operation(summary = "Add a collaboration comment to a ticket thread")
    public ResponseEntity<CommentDto> addComment(
            @PathVariable String issueId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        CommentDto created = commentService.addComment(issueId, request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{commentId}")
    @Operation(summary = "Delete a comment")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String issueId,
            @PathVariable String commentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        commentService.deleteComment(commentId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
