package io.trackflow.dto;

import io.trackflow.entity.ProjectMember;
import io.trackflow.entity.Role;

public class ProjectMemberDto {
    private String userId;
    private Role role;
    private String joinedAt;

    public ProjectMemberDto() {}

    public ProjectMemberDto(ProjectMember member) {
        this.userId = member.getUser().getId();
        this.role = member.getRole();
        this.joinedAt = member.getJoinedAt().toString();
    }

    public ProjectMemberDto(String userId, Role role, String joinedAt) {
        this.userId = userId;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getJoinedAt() { return joinedAt; }
    public void setJoinedAt(String joinedAt) { this.joinedAt = joinedAt; }
}
