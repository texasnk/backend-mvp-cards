import type { ButtonHTMLAttributes } from "react";
interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}
export function Button({ variant = "primary", className = "", ...props }: IButtonProps) {
  return <button className={`button button--${variant} ${className}`} {...props} />;
}
