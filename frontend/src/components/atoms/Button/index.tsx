import type { ButtonHTMLAttributes } from "react";
import "./styles.css";
interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}
export function Button({ variant = "primary", className = "", ...props }: IButtonProps) {
  return <button className={`button button_${variant} ${className}`} {...props} />;
}
