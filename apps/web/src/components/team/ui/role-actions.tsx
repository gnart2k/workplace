import { Check, Trash2, X } from "lucide-react";
import type React from "react";

export type ActionConfig = {
  key: string;
  title: string;
  icon: React.ReactElement;
  variant?: "default" | "destructive";
};

export const roleActions = {
  owner: [
    {
      key: "remove",
      title: "Remove member",
      icon: <Trash2 className="w-4 h-4 text-red-500" />,
      variant: "destructive",
      style: { color: "#ef4444" }, // Tailwind red-500
      textClass: "text-red-500",
    },
  ],
  member: [
    // Add member actions here if needed
  ],
  invitedPending: [
    {
      key: "acceptInvite",
      title: "Accept invitation",
      icon: <Check className="w-4 h-4 text-green-500" />,
      variant: "default",
      style: { color: "#22c55e" }, // Tailwind green-500
      textClass: "text-green-500",
    },
    {
      key: "rejectInvite",
      title: "Reject invitation",
      icon: <X className="w-4 h-4 text-red-500" />,
      variant: "destructive",
      style: { color: "#ef4444" }, // Tailwind red-500
      textClass: "text-red-500",
    },
  ],
} as const;

export type Role = keyof typeof roleActions;
export type ActionKey = (typeof roleActions)[Role][number]["key"];
