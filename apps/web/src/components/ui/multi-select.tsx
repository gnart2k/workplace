import { Command as CommandPrimitive } from "cmdk";
import { X } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/cn";

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  /** Fixed options will be ordered at the top of the dropdown menu and cannot be removed. */
  fixed?: boolean;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    onChange([...selected, value]);
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter((v) => v !== value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = e.target as HTMLInputElement;
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      input.value === "" &&
      selected.length > 0
    ) {
      handleRemove(selected[selected.length - 1]);
    }
  };

  const selectedOptions = selected
    .map((value) => options.find((option) => option.value === value))
    .filter(Boolean) as Option[];

  return (
    <div className="relative">
      <Command
        onKeyDown={handleKeyDown}
        className="overflow-visible bg-transparent"
      >
        <div
          className={cn(
            "group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            className,
          )}
        >
          <div className="flex flex-wrap gap-1">
            {selectedOptions.map(({ value, label }) => (
              <Badge
                key={value}
                variant="secondary"
                className="rounded-sm px-2 py-1"
              >
                {label}
                <button
                  type="button"
                  onClick={() => handleRemove(value)}
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRemove(value);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
            <CommandPrimitive.Input
              placeholder={placeholder}
              className="ml-2 flex-1 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground"
              onFocus={() => setOpen(true)}
              onBlur={() => setOpen(false)}
            />
          </div>
        </div>
        <div className="relative mt-2">
          {open && (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandList>
                <CommandGroup>
                  {options
                    .filter((option) => !selected.includes(option.value))
                    .map((option) => (
                      <CommandItem
                        key={option.value}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onSelect={() => handleSelect(option.value)}
                        className="cursor-pointer"
                      >
                        {option.label}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </div>
          )}
        </div>
      </Command>
    </div>
  );
}
