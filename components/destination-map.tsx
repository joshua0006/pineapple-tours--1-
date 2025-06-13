import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Mountain, Waves, TreePine } from "lucide-react";

export function DestinationMap() {
  const destinations = [
    {
      id: 1,
      name: "Gold Coast",
      type: "Beach Paradise",
      icon: <Waves className="h-5 w-5" />,
      position: { top: "60%", left: "85%" },
      color: "bg-blue-500",
    },
    {
      id: 2,
      name: "Brisbane",
      type: "Urban Adventure",
      icon: <MapPin className="h-5 w-5" />,
      position: { top: "45%", left: "80%" },
      color: "bg-purple-500",
    },
    {
      id: 3,
      name: "Tamborine Mountain",
      type: "Mountain Escape",
      icon: <Mountain className="h-5 w-5" />,
      position: { top: "55%", left: "75%" },
      color: "bg-green-500",
    },
    {
      id: 4,
      name: "Scenic Rim",
      type: "Nature Reserve",
      icon: <TreePine className="h-5 w-5" />,
      position: { top: "65%", left: "70%" },
      color: "bg-emerald-500",
    },
  ];

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-0">
        <div className="relative h-96 bg-gradient-to-br from-blue-100 via-green-50 to-yellow-50">
          {/* Simplified map background */}
          <div className="absolute inset-0 opacity-20">
            <svg
              viewBox="0 0 400 300"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Coastline */}
              <path
                d="M350 50 C380 80, 380 120, 370 160 C360 200, 340 240, 320 270 L300 290 L280 280 C260 260, 240 240, 220 220 C200 200, 180 180, 160 160 C140 140, 120 120, 100 100 C80 80, 60 60, 50 40 L70 30 C100 20, 150 25, 200 30 C250 35, 300 40, 350 50 Z"
                fill="currentColor"
                className="text-green-200"
              />
              {/* Mountains */}
              <path
                d="M100 150 L120 120 L140 150 L160 130 L180 150 L200 140 L220 150 L200 160 L180 170 L160 160 L140 170 L120 160 Z"
                fill="currentColor"
                className="text-gray-300"
              />
            </svg>
          </div>

          {/* Destination markers */}
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={destination.position}
            >
              <div
                className={`${destination.color} text-white p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-200`}
              >
                {destination.icon}
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white rounded-lg shadow-lg p-3 min-w-max">
                  <div className="font-semibold text-sm">
                    {destination.name}
                  </div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {destination.type}
                  </Badge>
                </div>
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <h4 className="font-semibold text-sm mb-2">
              Private Tour Destinations
            </h4>
            <div className="space-y-2">
              {destinations.map((destination) => (
                <div
                  key={destination.id}
                  className="flex items-center gap-2 text-xs"
                >
                  <div
                    className={`${destination.color} w-3 h-3 rounded-full`}
                  />
                  <span>{destination.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
