import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin, Star, Calendar } from "lucide-react";

export function DestinationStats() {
  const stats = [
    {
      icon: <Users className="h-6 w-6 text-brand-accent" />,
      value: "2,500+",
      label: "Happy Travelers",
    },
    {
      icon: <MapPin className="h-6 w-6 text-brand-accent" />,
      value: "15+",
      label: "Destinations",
    },
    {
      icon: <Star className="h-6 w-6 text-brand-accent" />,
      value: "4.9/5",
      label: "Average Rating",
    },
    {
      icon: <Calendar className="h-6 w-6 text-brand-accent" />,
      value: "10+",
      label: "Years Experience",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="bg-white/95 backdrop-blur-sm border-0 shadow-lg"
        >
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-3">{stat.icon}</div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
