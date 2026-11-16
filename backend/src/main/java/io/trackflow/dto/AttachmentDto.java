package io.trackflow.dto;

import io.trackflow.entity.Attachment;

public class AttachmentDto {
    private String id;
    private String name;
    private String size;
    private String url;
    private String type;
    private String uploadedBy;
    private String uploadedAt;

    public AttachmentDto() {}

    public AttachmentDto(Attachment attachment) {
        this.id = attachment.getId();
        this.name = attachment.getFileName();
        this.size = attachment.getFileSize();
        this.url = attachment.getFileUrl();
        this.type = attachment.getFileType();
        this.uploadedBy = attachment.getUploadedBy();
        this.uploadedAt = attachment.getUploadedAt().toString();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public String getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(String uploadedAt) { this.uploadedAt = uploadedAt; }
}
