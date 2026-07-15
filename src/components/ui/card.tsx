import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-brand-surface border border-gray-800 rounded-xl overflow-hidden shadow-xl transition-all hover:border-gray-700/80 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div className={`p-4 border-b border-gray-800 ${className}`}>
      {children}
    </div>
  );
}

function CardContent({ children, className = "" }: CardProps) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

function CardFooter({ children, className = "" }: CardProps) {
  return (
    <div className={`p-4 border-t border-gray-800 bg-black/10 ${className}`}>
      {children}
    </div>
  );
}

// Mapeo de subcomponentes
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
