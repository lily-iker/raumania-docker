// @/components/ui/alert-dialog.tsx
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { clsx } from "clsx";
import React from "react";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export const AlertDialogContent = ({
  className,
  ...props
}: AlertDialogPrimitive.AlertDialogContentProps) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogPrimitive.Overlay className="fixed inset-0 bg-black/40 z-50" />
    <AlertDialogPrimitive.Content
      className={clsx(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none",
        className
      )}
      {...props}
    />
  </AlertDialogPrimitive.Portal>
);

export const AlertDialogHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => <div className="mb-4">{children}</div>;

export const AlertDialogFooter = ({
  children,
}: {
  children: React.ReactNode;
}) => <div className="mt-4 flex justify-end gap-2">{children}</div>;

export const AlertDialogTitle = ({
  children,
}: {
  children: React.ReactNode;
}) => <AlertDialogPrimitive.Title className="text-lg font-semibold">{children}</AlertDialogPrimitive.Title>;

export const AlertDialogDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => <AlertDialogPrimitive.Description className="text-sm text-gray-500">{children}</AlertDialogPrimitive.Description>;

export const AlertDialogCancel = ({
  children,
  ...props
}: AlertDialogPrimitive.AlertDialogCancelProps) => (
  <AlertDialogPrimitive.Cancel
    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
    {...props}
  >
    {children}
  </AlertDialogPrimitive.Cancel>
);

export const AlertDialogAction = ({
  children,
  ...props
}: AlertDialogPrimitive.AlertDialogActionProps) => (
  <AlertDialogPrimitive.Action
    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
    {...props}
  >
    {children}
  </AlertDialogPrimitive.Action>
);
