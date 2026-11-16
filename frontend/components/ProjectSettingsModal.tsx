import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { X, UserPlus, Trash2 } from 'lucide-react';

export const ProjectSettingsModal: React.FC = () => {
  const {
    isProjectSettingsOpen,
    setIsProjectSettingsOpen,
    currentProject,
    users,
    updateProjectMembers,
    currentUser,
    canManageProject,
    showToast,
  } = useApp();

  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');
  const [roleToAdd, setRoleToAdd] = useState<UserRole>('DEVELOPER');
  const [permissionAlert, setPermissionAlert] = useState<string | null>(null);

  if (!isProjectSettingsOpen || !currentProject) return null;

  const canManage = canManageProject();
  const isAdmin = currentUser?.role === 'ADMIN';

  const handleAddMember = async () => {
    if (!canManage) {
      setPermissionAlert(`Only ADMIN or MANAGER can add team members. Active role: ${currentUser?.role}`);
      setTimeout(() => setPermissionAlert(null), 3000);
      return;
    }
    if (!selectedUserToAdd) return;

    if (currentProject.members.some((m) => m.userId === selectedUserToAdd)) {
      showToast('This user is already a member of this project.', 'error');
      return;
    }

    const updated = [
      ...currentProject.members,
      {
        userId: selectedUserToAdd,
        role: roleToAdd,
        joinedAt: new Date().toISOString(),
      },
    ];
    await updateProjectMembers(currentProject.id, updated);
    setSelectedUserToAdd('');
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    if (!isAdmin) {
      setPermissionAlert(`Only ADMIN can change member roles. Active role: ${currentUser?.role}`);
      setTimeout(() => setPermissionAlert(null), 3000);
      return;
    }
    const updated = currentProject.members.map((m) =>
      m.userId === userId ? { ...m, role: newRole } : m
    );
    await updateProjectMembers(currentProject.id, updated);
  };

  const handleRemoveMember = async (userId: string) => {
    if (!canManage) {
      setPermissionAlert(`Only ADMIN or MANAGER can remove members.`);
      setTimeout(() => setPermissionAlert(null), 3000);
      return;
    }
    if (currentProject.members.length <= 1) {
      showToast('A project must have at least one member.', 'error');
      return;
    }
    const updated = currentProject.members.filter((m) => m.userId !== userId);
    await updateProjectMembers(currentProject.id, updated);
  };

  const nonMembers = users.filter(
    (u) => !currentProject.members.some((m) => m.userId === u.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Project Settings &amp; Team</h2>
            <p className="text-xs text-slate-500 font-mono">
              {currentProject.name} ({currentProject.key})
            </p>
          </div>
          <button
            onClick={() => setIsProjectSettingsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {permissionAlert && (
          <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-medium">
            {permissionAlert}
          </div>
        )}

        <div className="p-6 space-y-6 text-xs">
          {/* Project Details */}
          <div className="space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
            <h3 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
              Project Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500">Project Key:</span>
                <span className="font-mono font-bold text-slate-800 ml-2">{currentProject.key}</span>
              </div>
              <div>
                <span className="text-slate-500">Created:</span>
                <span className="font-mono text-slate-700 ml-2">
                  {new Date(currentProject.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Description:</span>
              <p className="text-slate-700">{currentProject.description}</p>
            </div>
          </div>

          {/* Team Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
                Assigned Team Members ({currentProject.members.length})
              </h3>
              {!canManage && (
                <span className="text-[11px] text-slate-400 font-mono">
                  (View-only: role is {currentUser?.role})
                </span>
              )}
            </div>

            {/* Add Member Bar */}
            {canManage && nonMembers.length > 0 && (
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <select
                  value={selectedUserToAdd}
                  onChange={(e) => setSelectedUserToAdd(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select team member to add...</option>
                  {nonMembers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.title})
                    </option>
                  ))}
                </select>

                <select
                  value={roleToAdd}
                  onChange={(e) => setRoleToAdd(e.target.value as UserRole)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="DEVELOPER">Developer</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>

                <button
                  type="button"
                  onClick={handleAddMember}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            )}

            {/* Members table */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {currentProject.members.map((member) => {
                const user = users.find((u) => u.id === member.userId);
                if (!user) return null;

                return (
                  <div
                    key={member.userId}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="truncate">
                        <div className="font-semibold text-slate-800 truncate">{user.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAdmin ? (
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleUpdateRole(member.userId, e.target.value as UserRole)
                          }
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono text-slate-800 focus:outline-none cursor-pointer"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="MANAGER">MANAGER</option>
                          <option value="DEVELOPER">DEVELOPER</option>
                        </select>
                      ) : (
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {member.role}
                        </span>
                      )}

                      {canManage && (
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Remove from project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <button
            onClick={() => setIsProjectSettingsOpen(false)}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
