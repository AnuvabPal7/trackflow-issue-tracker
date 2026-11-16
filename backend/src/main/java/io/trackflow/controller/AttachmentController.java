package io.trackflow.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.trackflow.dto.AttachmentDto;
import io.trackflow.service.AttachmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/issues/{issueId}/attachments")
@Tag(name = "Attachments", description = "Endpoints for multipart screenshot and error log file uploads")
@SecurityRequirement(name = "BearerAuth")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a screenshot or log file attachment")
    public ResponseEntity<AttachmentDto> uploadAttachment(
            @PathVariable String issueId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        AttachmentDto uploaded = attachmentService.saveAttachment(issueId, file, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(uploaded);
    }

    @DeleteMapping("/{attachmentId}")
    @Operation(summary = "Delete an attachment")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable String issueId,
            @PathVariable String attachmentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        attachmentService.deleteAttachment(issueId, attachmentId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
