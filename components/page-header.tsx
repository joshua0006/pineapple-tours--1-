import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  primaryAction?: {
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
    href?: string;
  };
  variant?: "default" | "coral" | "muted";
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  primaryAction,
  secondaryAction,
  variant = "default",
  className,
}: PageHeaderProps) {
  const getBackgroundClasses = () => {
    switch (variant) {
      case "coral":
        return "bg-gradient-to-r from-coral-500 to-orange-500";
      case "muted":
        return "bg-muted";
      default:
        return "bg-gradient-to-r from-brand-primary to-brand-accent";
    }
  };

  const getTextClasses = () => {
    switch (variant) {
      case "muted":
        return "text-brand-text";
      default:
        return "text-white";
    }
  };

  const getSubtitleClasses = () => {
    switch (variant) {
      case "muted":
        return "text-muted-foreground";
      default:
        return "text-white/90";
    }
  };

  const ActionButton = ({
    action,
    variant: buttonVariant,
  }: {
    action: NonNullable<PageHeaderProps["primaryAction"]>;
    variant: "default" | "outline";
  }) => {
    const buttonProps = {
      size: "lg" as const,
      variant: buttonVariant,
      className:
        buttonVariant === "outline"
          ? "border-white text-white hover:bg-white hover:text-brand-primary"
          : variant === "muted"
          ? "bg-brand-accent text-white hover:bg-brand-accent/90"
          : "bg-white text-brand-primary hover:bg-gray-100",
    };

    const content = (
      <>
        {action.icon && <action.icon className="mr-2 h-5 w-5" />}
        {action.label}
      </>
    );

    if (action.href) {
      return (
        <Button asChild {...buttonProps}>
          <a href={action.href}>{content}</a>
        </Button>
      );
    }

    return (
      <Button onClick={action.onClick} {...buttonProps}>
        {content}
      </Button>
    );
  };

  return (
    <section
      className={cn("py-16 md:py-20", getBackgroundClasses(), className)}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className={cn(
              "text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-barlow tracking-tight",
              getTextClasses()
            )}
          >
            {title}
          </h1>
          <p
            className={cn(
              "text-lg md:text-xl lg:text-2xl mb-8 font-work-sans max-w-3xl mx-auto",
              getSubtitleClasses()
            )}
          >
            {subtitle}
          </p>
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {primaryAction && (
                <ActionButton action={primaryAction} variant="default" />
              )}
              {secondaryAction && (
                <ActionButton action={secondaryAction} variant="outline" />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
