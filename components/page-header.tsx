import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCard {
  icon: LucideIcon;
  title: string;
}

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
  backButton?: {
    label?: string;
    icon?: LucideIcon;
    onClick?: () => void;
    href?: string;
  };
  variant?: "default" | "coral" | "muted";
  className?: string;
  backgroundImage?: string;
  overlayOpacity?: number;
  featureCards?: FeatureCard[];
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  primaryAction,
  secondaryAction,
  backButton,
  variant = "default",
  className,
  backgroundImage,
  overlayOpacity = 0.6,
  featureCards,
}: PageHeaderProps) {
  const getBackgroundClasses = () => {
    if (backgroundImage) {
      return "relative";
    }

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
    if (backgroundImage) {
      return "text-white relative z-10";
    }

    switch (variant) {
      case "muted":
        return "text-brand-text";
      default:
        return "text-white";
    }
  };

  const getSubtitleClasses = () => {
    if (backgroundImage) {
      return "text-white/95 relative z-10";
    }

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
    const isImageBackground = !!backgroundImage;

    const buttonProps = {
      size: "lg" as const,
      variant: buttonVariant,
      className: cn(
        isImageBackground ? "relative z-10" : "",
        buttonVariant === "outline"
          ? variant === "muted" || isImageBackground
            ? "border-white text-white hover:bg-white hover:text-gray-900"
            : "border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white"
          : variant === "muted"
          ? "bg-brand-accent text-white hover:bg-brand-accent/90"
          : isImageBackground
          ? "bg-white text-gray-900 hover:bg-gray-100"
          : "bg-white text-brand-primary hover:bg-gray-100"
      ),
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

  const BackButtonComponent = () => {
    if (!backButton) return null;

    const buttonContent = (
      <>
        {backButton.icon && <backButton.icon className="h-4 w-4 mr-2" />}
        {backButton.label || "Back"}
      </>
    );

    const buttonProps = {
      variant: "ghost" as const,
      size: "sm" as const,
      className: cn(
        "absolute top-4 left-4 z-20",
        "bg-black/20 backdrop-blur-sm border border-white/30",
        "text-white hover:bg-black/40 hover:text-white",
        "transition-all duration-200"
      ),
    };

    if (backButton.href) {
      return (
        <Button asChild {...buttonProps}>
          <a href={backButton.href}>{buttonContent}</a>
        </Button>
      );
    }

    return (
      <Button onClick={backButton.onClick} {...buttonProps}>
        {buttonContent}
      </Button>
    );
  };

  return (
    <section
      className={cn("py-8 md:py-12", getBackgroundClasses(), className)}
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : undefined
      }
    >
      {/* Overlay for background image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Back Button */}
      <BackButtonComponent />

      <div className={cn("container mx-auto px-4 relative z-10", backButton ? "pt-12" : "")}>
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className={cn(
              "text-2xl md:text-3xl lg:text-4xl font-bold mb-3 font-barlow tracking-tight",
              getTextClasses()
            )}
          >
            {title}
          </h1>
          <p
            className={cn(
              "text-sm md:text-base lg:text-lg mb-4 font-work-sans max-w-3xl mx-auto",
              getSubtitleClasses()
            )}
          >
            {subtitle}
          </p>
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10 mb-4">
              {primaryAction && (
                <ActionButton action={primaryAction} variant="default" />
              )}
              {secondaryAction && (
                <ActionButton action={secondaryAction} variant="outline" />
              )}
            </div>
          )}

          {/* Feature Cards */}
          {featureCards && featureCards.length > 0 && (
            <div className="mt-6 relative z-10">
              <div className="grid grid-cols-3 gap-3 lg:gap-4 max-w-4xl mx-auto">
                {featureCards.map((card, index) => (
                  <div key={index} className="cursor-default">
                    {/* Content */}
                    <div className="p-4 lg:p-5">
                      <div className="flex flex-col items-center space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-3">
                        {/* Icon container */}
                        <div
                          className={cn(
                            "p-3 rounded-lg flex-shrink-0",
                            backgroundImage
                              ? "bg-white/10 border border-white/30"
                              : "bg-primary/10 border border-primary/20"
                          )}
                        >
                          <card.icon
                            className={cn(
                              "h-5 w-5 lg:h-6 lg:w-6",
                              backgroundImage ? "text-white" : "text-primary",
                              "drop-shadow-sm"
                            )}
                          />
                        </div>

                        {/* Title */}
                        <h3
                          className={cn(
                            "font-bold text-sm lg:text-base",
                            backgroundImage ? "text-white" : "text-foreground",
                            "drop-shadow-sm"
                          )}
                        >
                          {card.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
