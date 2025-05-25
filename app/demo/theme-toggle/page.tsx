"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeToggleSimple } from "@/components/theme-toggle-simple"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ThemeToggleDemoPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Enhanced Theme Toggle Demo</h1>
          <p className="text-xl text-muted-foreground">
            Experience smooth fade-in/fade-out animations with theme primary colors
          </p>
          <Badge variant="secondary" className="text-sm">
            Responsive Design • Theme Colors • Smooth Animations
          </Badge>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Desktop Theme Toggle
                <ThemeToggle />
              </CardTitle>
              <CardDescription>
                Full dropdown menu with smooth fade-in/fade-out animations, theme primary color background, and visual indicators for the current theme.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Smooth 300ms fade-in animation</li>
                  <li>• Quick 200ms fade-out animation</li>
                  <li>• Theme primary color background with transparency</li>
                  <li>• Backdrop blur effect</li>
                  <li>• Hover and focus states with scale animations</li>
                  <li>• Active theme indicator with pulsing dot</li>
                  <li>• Responsive width (48 on mobile, 52 on desktop)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Mobile Theme Toggle
                <ThemeToggleSimple />
              </CardTitle>
              <CardDescription>
                Simplified cycling button for mobile interfaces with the same smooth animations and theme integration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Single button cycling through themes</li>
                  <li>• Same hover animations as desktop version</li>
                  <li>• Theme-aware icon transitions</li>
                  <li>• Accessible tooltips and labels</li>
                  <li>• Consistent yellow branding colors</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Animation Details</CardTitle>
            <CardDescription>
              Technical implementation of the enhanced dropdown animations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium text-green-600 dark:text-green-400">Fade-In Animation</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Duration:</strong> 300ms</p>
                  <p><strong>Easing:</strong> cubic-bezier(0.16, 1, 0.3, 1)</p>
                  <p><strong>Transform:</strong> scale(0.95) → scale(1)</p>
                  <p><strong>Opacity:</strong> 0 → 1</p>
                  <p><strong>Translate:</strong> translateY(-8px) → translateY(0)</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-red-600 dark:text-red-400">Fade-Out Animation</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Duration:</strong> 200ms</p>
                  <p><strong>Easing:</strong> ease-in</p>
                  <p><strong>Transform:</strong> scale(1) → scale(0.95)</p>
                  <p><strong>Opacity:</strong> 1 → 0</p>
                  <p><strong>Translate:</strong> translateY(0) → translateY(-8px)</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-blue-600 dark:text-blue-400">Theme Integration</h4>
              <div className="text-sm space-y-1">
                <p><strong>Background:</strong> bg-primary/5 (light) | bg-primary/10 (dark)</p>
                <p><strong>Border:</strong> border-primary/20</p>
                <p><strong>Backdrop:</strong> backdrop-blur-sm</p>
                <p><strong>Shadow:</strong> shadow-xl for enhanced depth</p>
                <p><strong>Item Hover:</strong> bg-primary/10 (light) | bg-primary/20 (dark)</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-purple-600 dark:text-purple-400">Responsive Design</h4>
              <div className="text-sm space-y-1">
                <p><strong>Mobile:</strong> w-48 (192px width)</p>
                <p><strong>Desktop:</strong> sm:w-52 (208px width)</p>
                <p><strong>Spacing:</strong> Increased padding and margins for touch targets</p>
                <p><strong>Icons:</strong> Color-coded (yellow for light, blue for dark, gray for system)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Try It Out!</CardTitle>
            <CardDescription>
              Click the theme toggle buttons above to see the smooth animations in action. 
              Notice how the dropdown fades in smoothly when opened and fades out quickly when closed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 justify-center">
              <ThemeToggle />
              <ThemeToggle />
              <ThemeToggleSimple />
              <ThemeToggleSimple />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 