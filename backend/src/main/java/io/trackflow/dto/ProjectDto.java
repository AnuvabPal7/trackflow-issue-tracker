package io.trackflow.dto;

import io.trackflow.entity.Project;
import java.util.List;
import java.util.stream.Collectors;

public class ProjectDto {
    private String id;
    private String key;
    private String name;
    private String description;
    private String leadId;
    private int issueCountSequence;
    private String createdAt;
    private List<ProjectMemberDto> members;

    public ProjectDto() {}

    public ProjectDto(Project project) {
        this.id = project.getId();
        this.key = project.getKey();
        this.name = project.getName();
        this.description = project.getDescription();
        this.leadId = project.getLead().getId();
        this.issueCountSequence = project.getIssueCountSequence();
        this.createdAt = project.getCreatedAt().toString();
        this.members = project.getMembers() != null
                ? project.getMembers().stream().map(ProjectMemberDto::new).collect(Collectors.toList())
                : List.of();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLeadId() { return leadId; }
    public void setLeadId(String leadId) { this.leadId = leadId; }

    public int getIssueCountSequence() { return issueCountSequence; }
    public void setIssueCountSequence(int issueCountSequence) { this.issueCountSequence = issueCountSequence; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public List<ProjectMemberDto> getMembers() { return members; }
    public void setMembers(List<ProjectMemberDto> members) { this.members = members; }
}
