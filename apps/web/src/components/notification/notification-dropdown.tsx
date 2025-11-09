import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KbdSequence } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { shortcuts } from "@/constants/shortcuts";
import useClearNotifications from "@/hooks/mutations/notification/use-clear-notifications";
import useMarkAllNotificationsAsRead from "@/hooks/mutations/notification/use-mark-all-notifications-as-read";
import useMarkNotificationAsRead from "@/hooks/mutations/notification/use-mark-notification-as-read";
import useGetNotifications from "@/hooks/queries/notification/use-get-notifications";
import { useRegisterShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { cn } from "@/lib/cn";
import type { Notification } from "@/types/notification";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface NotificationDropdownRef {
  toggle: () => void;
}

const NotificationDropdown = forwardRef<NotificationDropdownRef>(
  (_props, ref) => {
    const { data: notifications } = useGetNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);

    const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();
    const { mutate: markAsRead } = useMarkNotificationAsRead();
    const { mutate: clearAll } = useClearNotifications();

    const unreadNotifications = notifications?.filter((n) => !n.isRead) || [];
    const hasNotifications = notifications && notifications.length > 0;

    const getNotificationPath = (notification: Notification) => {
      const n = notification as Notification & {
        projectId?: string | null;
        workspaceId?: string | null;
      };

      if (n.resourceType === "task" && n.projectId && n.workspaceId) {
        return `/dashboard/workspace/${n.workspaceId}/project/${n.projectId}/task/${n.resourceId}`;
      }
      if (n.resourceType === "workspace" && n.resourceId) {
        return `/dashboard/workspace/${n.resourceId}`;
      }
      return undefined;
    };

    useImperativeHandle(ref, () => ({
      toggle: () => setIsOpen(!isOpen),
    }));

    const handleClearAll = () => {
      clearAll();
      setShowClearDialog(false);
    };

    useRegisterShortcuts({
      sequentialShortcuts: {
        [shortcuts.notification.prefix]: {
          [shortcuts.notification.open]: () => setIsOpen(!isOpen),
        },
      },
    });

    return (
      <>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-9 w-9 p-0"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadNotifications.length > 0 && (
                      <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                    )}
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p className="flex items-center gap-2">
                  Notifications
                  <KbdSequence
                    keys={[
                      shortcuts.notification.prefix,
                      shortcuts.notification.open,
                    ]}
                  />
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <h3 className="font-medium text-sm">Notifications</h3>
              {unreadNotifications.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {unreadNotifications.length} new
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsRead()}
                    className="text-xs h-6 px-2"
                  >
                    Mark all read
                  </Button>
                </div>
              )}
            </div>

            <div className="relative max-h-96 overflow-y-auto">
              {!hasNotifications ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <Bell className="mx-auto h-12 w-12 opacity-50 mb-2" />
                  <p>No notifications yet</p>
                  <p className="text-xs mt-1">
                    You'll see updates and activity here.
                  </p>
                </div>
              ) : (
                <>
                  {notifications.map((notification) => {
                    const path = getNotificationPath(notification);
                    const Component = path ? Link : "div";

                    return (
                      <Component
                        key={notification.id}
                        to={path}
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsRead(notification.id);
                          }
                          setIsOpen(false);
                        }}
                        className={cn(
                          "px-3 py-3 border-b border-border/50 transition-colors",
                          path && "cursor-pointer hover:bg-accent/50",
                          !notification.isRead && "bg-accent/20",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-foreground">
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                              )}
                            </div>
                            {notification.content && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.content}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(notification.createdAt, {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      </Component>
                    );
                  })}
                </>
              )}
            </div>
            {hasNotifications && (
              <div className="border-t border-border p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClearDialog(true)}
                  className="w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Clear all notifications
                </Button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove all notifications. You can't undo
                this action.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearAll}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear all
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  },
);

NotificationDropdown.displayName = "NotificationDropdown";

export default NotificationDropdown;
