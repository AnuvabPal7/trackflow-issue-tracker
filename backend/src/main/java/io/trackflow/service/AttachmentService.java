package io.trackflow.service;

import io.trackflow.dto.AttachmentDto;
import io.trackflow.entity.Attachment;
import io.trackflow.entity.Issue;
import io.trackflow.entity.User;
import io.trackflow.exception.BadRequestException;
import io.trackflow.exception.ResourceNotFoundException;
import io.trackflow.repository.AttachmentRepository;
import io.trackflow.repository.IssueRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class AttachmentService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "png", "jpg", "jpeg", "gif", "webp", "txt", "log"
    );

    private final AttachmentRepository attachmentRepository;
    private final IssueRepository issueRepository;
    private final ProjectAccessService projectAccessService;
    private final Path uploadLocation;

    public AttachmentService(AttachmentRepository attachmentRepository,
                             IssueRepository issueRepository,
                             ProjectAccessService projectAccessService,
                             @Value("${trackflow.upload.dir:${UPLOAD_DIR:./uploads}}") String uploadDir) {
        this.attachmentRepository = attachmentRepository;
        this.issueRepository = issueRepository;
        this.projectAccessService = projectAccessService;
        this.uploadLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.uploadLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + this.uploadLocation, e);
        }
    }

    @Transactional
    public AttachmentDto saveAttachment(String issueId, MultipartFile file, String userEmail) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds 5 MB limit (size: " + file.getSize() + " bytes)");
        }

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found: " + issueId));

        // Enforce project membership: user must be a member of the issue's project
        User user = projectAccessService.assertMember(issue.getProject().getId(), userEmail);

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "attachment.dat";
        }
        originalFilename = Paths.get(originalFilename).getFileName().toString(); // Strip any directory paths

        String extension = "";
        int lastDotIndex = originalFilename.lastIndexOf('.');
        if (lastDotIndex >= 0 && lastDotIndex < originalFilename.length() - 1) {
            extension = originalFilename.substring(lastDotIndex + 1).toLowerCase(Locale.ROOT);
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Unsupported file type ." + extension + ". Allowed extensions: " + ALLOWED_EXTENSIONS);
        }

        String contentType = file.getContentType();
        if (contentType != null && !isValidContentType(contentType, extension)) {
            throw new BadRequestException("Invalid content type for attachment: " + contentType);
        }

        String storedFilename = UUID.randomUUID() + "." + extension;
        Path targetPath = this.uploadLocation.resolve(storedFilename).normalize();

        // Prevent path traversal
        if (!targetPath.startsWith(this.uploadLocation)) {
            throw new BadRequestException("Invalid file storage path");
        }

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store attachment file on disk", e);
        }

        long sizeKb = Math.max(1, file.getSize() / 1024);
        String formattedSize = sizeKb + " KB";
        String fileType = (contentType != null && contentType.startsWith("image/")) ? "image" : "log";

        Attachment attachment = new Attachment(
                issue,
                originalFilename,
                formattedSize,
                "/api/v1/attachments/files/" + storedFilename,
                fileType,
                user.getFullName()
        );

        Attachment saved = attachmentRepository.save(attachment);
        return new AttachmentDto(saved);
    }

    @Transactional
    public void deleteAttachment(String issueId, String attachmentId, String userEmail) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + attachmentId));

        // Verify attachment belongs to the issue in URL
        if (!attachment.getIssue().getId().equals(issueId)) {
            throw new BadRequestException("Attachment " + attachmentId + " does not belong to issue " + issueId);
        }

        // Verify project membership
        projectAccessService.assertMember(attachment.getIssue().getProject().getId(), userEmail);

        // Delete disk file
        String fileUrl = attachment.getFileUrl();
        if (fileUrl != null && fileUrl.contains("/files/")) {
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/files/") + 7);
            try {
                Path filePath = this.uploadLocation.resolve(filename).normalize();
                if (filePath.startsWith(this.uploadLocation)) {
                    Files.deleteIfExists(filePath);
                }
            } catch (IOException ignored) {
            }
        }

        attachmentRepository.delete(attachment);
    }

    public Resource loadFileAsResource(String filename) {
        if (filename == null || filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            throw new BadRequestException("Invalid filename");
        }

        try {
            Path filePath = this.uploadLocation.resolve(filename).normalize();
            if (!filePath.startsWith(this.uploadLocation)) {
                throw new BadRequestException("Path traversal attempt detected");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File not found: " + filename);
        }
    }

    private boolean isValidContentType(String contentType, String extension) {
        String lower = contentType.toLowerCase(Locale.ROOT);
        return lower.startsWith("image/") ||
               lower.equals("text/plain") ||
               lower.equals("text/x-log") ||
               lower.equals("application/octet-stream");
    }
}
