import useAcceptWorkspaceUser from "@/hooks/mutations/workspace-user/use-accept-workspace-user";
import { useWorkspacePermission } from "@/hooks/useWorkspacePermission";
import { getStatusIcon, getStatusText } from "@/lib/status";
import type WorkspaceUser from "@/types/workspace-user";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import useAuth from "../providers/auth-provider/hooks/use-auth";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import TeamMemberModal from "./delete-team-member-modal";
import ActionDropdownMenuItem from "./ui/action-dropdown-menu-item";
import { type ActionKey, type Role, roleActions } from "./ui/role-actions";

function MembersTable({ users }: { users: WorkspaceUser[] }) {
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<WorkspaceUser | null>(
    null,
  );
  const [isDeclineInvitationModalOpen, setIsDeclineInvitationModalOpen] =
    useState(false);

  const { user } = useAuth();
  const { isOwner } = useWorkspacePermission();
  const queryClient = useQueryClient();
  const { mutateAsync: acceptWorkspaceInvitation } = useAcceptWorkspaceUser();

  const actionHandlers: Record<ActionKey, (member: WorkspaceUser) => void> = {
    remove: (member) => {
      setIsRemoveMemberModalOpen(true);
      setSelectedMember(member);
    },
    acceptInvite: async (member) => {
      await acceptWorkspaceInvitation({
        userId: member.userId || "",
        status: "active",
      });

      queryClient.invalidateQueries({
        queryKey: ["workspace-users"],
      });
    },
    rejectInvite: (member) => {
      setIsDeclineInvitationModalOpen(true);
      setSelectedMember(member);
    },
  };

  if (users?.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-xl bg-muted flex items-center justify-center">
            <span className="text-2xl">👥</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No team members yet</h3>
            <p className="text-muted-foreground">
              Invite your first team member to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-foreground font-medium">
              Member
            </TableHead>
            <TableHead className="text-foreground font-medium">Role</TableHead>
            <TableHead className="text-foreground font-medium">
              Status
            </TableHead>
            <TableHead className="text-foreground font-medium">
              Joined
            </TableHead>
            <TableHead className="text-foreground font-medium">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((member) => {
            let currentRole: Role = "member";
            if (isOwner) {
              currentRole = "owner";
            } else if (!isOwner && user?.id === member.userId) {
              if (member.status === "pending") {
                currentRole = "invitedPending";
              } else {
                currentRole = "member";
              }
            } else {
              currentRole = "member";
            }
            const actions = roleActions[currentRole] ?? [];

            return (
              <TableRow key={member.userId} className="cursor-pointer">
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="bg-muted text-muted-foreground font-medium text-xs">
                        {member.userId?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{member.userName}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                    {member.role.charAt(0).toUpperCase() +
                      member.role.slice(1).toLowerCase()}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(member.status as "active" | "pending")}
                    <span className="text-sm text-muted-foreground">
                      {getStatusText(member.status as "active" | "pending")}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <span className="text-sm text-muted-foreground">
                    {member.joinedAt &&
                      new Date(member.joinedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  {member.role === "owner" ? (
                    <span className="text-xs text-muted-foreground italic">
                      Workspace owner
                    </span>
                  ) : (
                    actions.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="p-1 hover:bg-accent rounded"
                          >
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action) => (
                            <ActionDropdownMenuItem
                              key={action.key}
                              icon={action.icon}
                              title={action.title}
                              variant={action.variant}
                              onClick={() => actionHandlers[action.key](member)}
                            />
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedMember && (
        <TeamMemberModal
          action="remove"
          userId={selectedMember.userId ?? ""}
          open={isRemoveMemberModalOpen}
          userName={selectedMember.userName ?? ""}
          onClose={() => {
            setIsRemoveMemberModalOpen(false);
            setSelectedMember(null);
          }}
        />
      )}
      {selectedMember && (
        <TeamMemberModal
          action="decline"
          userId={selectedMember.userId ?? ""}
          open={isDeclineInvitationModalOpen}
          userName={selectedMember.userName ?? ""}
          onClose={() => {
            setIsDeclineInvitationModalOpen(false);
            setSelectedMember(null);
          }}
        />
      )}
    </>
  );
}

export default MembersTable;
