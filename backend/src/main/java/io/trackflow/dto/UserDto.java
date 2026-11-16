package io.trackflow.dto;

import io.trackflow.entity.Role;
import io.trackflow.entity.User;

public class UserDto {
    private String id;
    private String name;
    private String email;
    private Role role;
    private String avatar;
    private String title;
    private String department;

    public UserDto() {}

    public UserDto(User user) {
        this.id = user.getId();
        this.name = user.getFullName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.avatar = user.getAvatar();
        this.title = user.getTitle();
        this.department = user.getDepartment();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}
