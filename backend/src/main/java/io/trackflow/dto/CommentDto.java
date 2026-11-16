package io.trackflow.dto;

import io.trackflow.entity.Comment;

public class CommentDto {
    private String id;
    private String authorId;
    private String content;
    private String createdAt;
    private String updatedAt;

    public CommentDto() {}

    public CommentDto(Comment comment) {
        this.id = comment.getId();
        this.authorId = comment.getAuthor().getId();
        this.content = comment.getContent();
        this.createdAt = comment.getCreatedAt().toString();
        this.updatedAt = comment.getUpdatedAt() != null ? comment.getUpdatedAt().toString() : null;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
