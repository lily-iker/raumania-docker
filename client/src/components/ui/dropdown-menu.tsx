// @/components/ui/dropdown-menu.tsx
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { clsx } from "clsx";
import React from "react";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuContent = ({
  className,
  ...props
}: DropdownMenuPrimitive.DropdownMenuContentProps) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      align="start"
      sideOffset={4}
      className={clsx(
        "z-50 min-w-[12rem] rounded-md bg-white p-2 text-sm shadow-md ring-1 ring-black/5 focus:outline-none",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);

export const DropdownMenuLabel = ({
  className,
  ...props
}: DropdownMenuPrimitive.DropdownMenuLabelProps) => (
  <DropdownMenuPrimitive.Label
    className={clsx("px-2 py-1.5 font-semibold text-gray-500", className)}
    {...props}
  />
);

export const DropdownMenuSeparator = ({
  className,
  ...props
}: DropdownMenuPrimitive.DropdownMenuSeparatorProps) => (
  <DropdownMenuPrimitive.Separator
    className={clsx("my-1 h-px bg-gray-200", className)}
    {...props}
  />
);

export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenuRadioItem = ({
  className,
  children,
  ...props
}: DropdownMenuPrimitive.DropdownMenuRadioItemProps) => (
  <DropdownMenuPrimitive.RadioItem
    className={clsx(
      "flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-100 focus:outline-none",
      className
    )}
    {...props}
  >
    <DropdownMenuPrimitive.ItemIndicator className="inline-block w-2 h-2 rounded-full bg-black" />
    {children}
  </DropdownMenuPrimitive.RadioItem>
);
