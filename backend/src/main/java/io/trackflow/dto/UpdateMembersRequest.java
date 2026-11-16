package io.trackflow.dto;

import java.util.List;

public class UpdateMembersRequest {
    private List<ProjectMemberDto> members;

    public UpdateMembersRequest() {}

    public List<ProjectMemberDto> getMembers() { return members; }
    public void setMembers(List<ProjectMemberDto> members) { this.members = members; }
}
