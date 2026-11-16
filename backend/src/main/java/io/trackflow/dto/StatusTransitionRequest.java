package io.trackflow.dto;

import io.trackflow.entity.IssueStatus;
import jakarta.validation.constraints.NotNull;

public class StatusTransitionRequest {

    @NotNull(message = "Status is required")
    private IssueStatus status;

    public StatusTransitionRequest() {}

    public StatusTransitionRequest(IssueStatus status) {
        this.status = status;
    }

    public IssueStatus getStatus() { return status; }
    public void setStatus(IssueStatus status) { this.status = status; }
}
