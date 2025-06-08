import React from "react";

interface FormProps {
  onSubmit?: (e: React.FormEvent) => void;
  children: React.ReactNode;
  className?: string;
}

export function Form({ onSubmit, children, className }: FormProps) {
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
    </form>
  );
}
