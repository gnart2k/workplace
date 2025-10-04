import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { ReactNode } from "react";

type ActionDropdownMenuItemProps = {
  onClick: () => void;
  icon: ReactNode;
  title: string;
  variant?: "default" | "destructive";
};

function ActionDropdownMenuItem({
  onClick,
  icon,
  title,
  variant,
  style,
  textClass,
}: ActionDropdownMenuItemProps & {
  style?: React.CSSProperties;
  textClass?: string;
}) {
  const className =
    variant === "destructive"
      ? `text-destructive focus:text-destructive ${textClass ?? ""}`
      : (textClass ?? "");

  return (
    <DropdownMenuItem onClick={onClick} className={className} style={style}>
      {icon}
      <span className={`ml-2 ${textClass ?? ""}`}>{title}</span>
    </DropdownMenuItem>
  );
}

export default ActionDropdownMenuItem;
