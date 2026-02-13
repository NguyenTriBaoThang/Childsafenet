import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`card ${className}`}
      {...rest} 
    >
      {children}
    </div>
  );
}