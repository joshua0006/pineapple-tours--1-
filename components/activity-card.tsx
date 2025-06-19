import Image from "next/image";
import Link from "next/link";
import { Clock, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ActivityCardProps {
  title: string;
  description: string;
  image: string;
  duration: string;
  difficulty: string;
  price: number;
  productCode?: string;
}

export function ActivityCard({
  title,
  description,
  image,
  duration,
  difficulty,
  price,
  productCode,
}: ActivityCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardHeader className="p-0 relative">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="absolute top-3 right-3">
          <Badge className={getDifficultyColor(difficulty)}>{difficulty}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-accent transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-3">{description}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>{difficulty}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign className="h-5 w-5 text-brand-accent" />
            <span className="text-2xl font-bold">${price}</span>
            <span className="text-sm text-muted-foreground">per person</span>
          </div>
          {productCode ? (
            <Link href={`/booking/${productCode}`}>
              <Button className="bg-brand-accent text-brand-secondary hover:bg-coral-600">
                Book Now
              </Button>
            </Link>
          ) : (
            <Button className="bg-brand-accent text-brand-secondary hover:bg-coral-600">
              Book Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
