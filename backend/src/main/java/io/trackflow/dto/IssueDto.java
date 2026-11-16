package io.trackflow.dto;

import io.trackflow.entity.Issue;
import io.trackflow.entity.IssuePriority;
import io.trackflow.entity.IssueStatus;
import io.trackflow.entity.IssueType;

import java.util.List;
import java.util.stream.Collectors;

public class IssueDto {
    private String id;
    private String key;
    private String projectId;
    private String title;
    private String description;
    private IssueType type;
    private IssuePriority priority;
    private IssueStatus status;
    private String assigneeId;
    private String reporterId;
    private Integer storyPoints;
    private String sprint;
    private List<String> labels;
    private List<String> components;
    private String dueDate;
    private String createdAt;
    private String updatedAt;
    private List<CommentDto> comments;
    private List<AttachmentDto> attachments;

    public IssueDto() {}

    public IssueDto(Issue issue) {
        this.id = issue.getId();
        this.key = issue.getKey();
        this.projectId = issue.getProject().getId();
        this.title = issue.getTitle();
        this.description = issue.getDescription();
        this.type = issue.getType();
        this.priority = issue.getPriority();
        this.status = issue.getStatus();
        this.assigneeId = issue.getAssignee() != null ? issue.getAssignee().getId() : null;
        this.reporterId = issue.getReporter().getId();
        this.storyPoints = issue.getStoryPoints();
        this.sprint = issue.getSprint();
        this.labels = issue.getLabels();
        this.components = issue.getComponents();
        this.dueDate = issue.getDueDate();
        this.createdAt = issue.getCreatedAt().toString();
        this.updatedAt = issue.getUpdatedAt().toString();
        this.comments = issue.getComments() != null
                ? issue.getComments().stream().map(CommentDto::new).collect(Collectors.toList())
                : List.of();
        this.attachments = issue.getAttachments() != null
                ? issue.getAttachments().stream().map(AttachmentDto::new).collect(Collectors.toList())
                : List.of();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public IssueType getType() { return type; }
    public void setType(IssueType type) { this.type = type; }

    public IssuePriority getPriority() { return priority; }
    public void setPriority(IssuePriority priority) { this.priority = priority; }

    public IssueStatus getStatus() { return status; }
    public void setStatus(IssueStatus status) { this.status = status; }

    public String getAssigneeId() { return assigneeId; }
    public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }

    public String getReporterId() { return reporterId; }
    public void setReporterId(String reporterId) { this.reporterId = reporterId; }

    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }

    public String getSprint() { return sprint; }
    public void setSprint(String sprint) { this.sprint = sprint; }

    public List<String> getLabels() { return labels; }
    public void setLabels(List<String> labels) { this.labels = labels; }

    public List<String> getComponents() { return components; }
    public void setComponents(List<String> components) { this.components = components; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public List<CommentDto> getComments() { return comments; }
    public void setComments(List<CommentDto> comments) { this.comments = comments; }

    public List<AttachmentDto> getAttachments() { return attachments; }
    public void setAttachments(List<AttachmentDto> attachments) { this.attachments = attachments; }
}
