# Pineapple Tours Categories

A comprehensive categorization system for tour products based on the official Pineapple Tours website and integrated with Rezdy API category IDs.

## Primary Tour Categories

### Wine & Beverage Tours
- **Winery Tours** (`winery-tours`)
  - Daily Group Winery Tours
  - Premium Full Day Wine Tours
  - Private Winery Experiences
- **Distillery Tours** (`distillery-tours`)
- **Brewery Tours** (`brewery-tours`)
- **Food and Wine Tours** (`food-wine-tours`)

### Nature & Adventure Tours
- **Nature Based Tours** (`nature-tours`)
  - Rainforest Skywalk Tours
  - Glow Worm Experience Tours
- **Hop on Hop off Tours** (`hop-on-hop-off`)

### Luxury & Special Experience Tours
- **Barefoot Luxury Tours** (`luxury-tours`)
  - Chauffeur Driven Luxury Vehicles
  - Premium Experiences
- **High Tea Tours** (`high-tea-tours`)
- **Private Tours** (`private-tours`)
  - Personalised Gourmet Food Tours
  - Boutique Tours

### Event & Group Tours
- **Hen's Party Tours** (`hens-party-tours`)
- **Corporate Tours** (`corporate-tours`)
- **Group Tours** (`group-tours`)

## Destinations

### Queensland
- **Gold Coast** (`gold-coast`)
- **Brisbane** (`brisbane`)
- **Mt Tamborine** (`mt-tamborine`)
- **Scenic Rim** (`scenic-rim`)

### New South Wales
- **Byron Bay** (`byron-bay`)
- **Tweed Coast** (`tweed-coast`)

## Service Types

### Transportation Services
- **Shuttles** (`shuttles`)
- **One-Way Transfers** (`transfers`)
- **Bus Charter** (`bus-charter`)
- **Formal and Event Hire** (`event-hire`)

### Tour Formats
- **Daily Group Tours** (`daily-group`)
- **Private/Personalised Tours** (`private-personalised`)
- **Boutique Tours** (`boutique`)

## Filtering Tags

### By Group Size
- `group` - Group tours
- `private` - Private tours
- `corporate` - Corporate bookings

### By Experience Level
- `luxury` - Premium/luxury experiences
- `standard` - Standard tour experiences
- `budget` - Budget-friendly options

### By Duration
- `full-day` - Full day tours
- `half-day` - Half day tours
- `multi-day` - Multi-day experiences

### By Theme
- `wine` - Wine-related experiences
- `food` - Food experiences
- `nature` - Nature and outdoor activities
- `cultural` - Cultural experiences
- `adventure` - Adventure activities
- `relaxation` - Relaxing experiences

## Category Hierarchy

```
Primary Categories
├── Wine & Beverage Tours
│   ├── Winery Tours
│   ├── Distillery Tours
│   ├── Brewery Tours
│   └── Food and Wine Tours
├── Nature & Adventure Tours
│   ├── Nature Based Tours
│   └── Hop on Hop off Tours
├── Luxury & Special Experience Tours
│   ├── Barefoot Luxury Tours
│   ├── High Tea Tours
│   └── Private Tours
└── Event & Group Tours
    ├── Hen's Party Tours
    ├── Corporate Tours
    └── Group Tours

Destinations
├── Queensland
│   ├── Gold Coast
│   ├── Brisbane
│   ├── Mt Tamborine
│   └── Scenic Rim
└── New South Wales
    ├── Byron Bay
    └── Tweed Coast
```

## Rezdy API Category IDs

The following Rezdy category IDs are used in the system for API integration:

### Primary Categories (Visible)
- **610656** - Hop on Hop off Tours - Brisbane
- **610660** - Hop on Hop off Tours - Gold Coast  
- **276149** - Day Tours - Gold Coast (includes winery tours)
- **276150** - Day Tours - Brisbane (nature-based tours)
- **292802** - All Tours and Experiences

### Legacy Categories (Hidden/Backward Compatibility)
- **620787** - Daily Wine Tours
- **292795** - Winery Tours (Small Group) - Legacy
- **398952** - Private Tours
- **466255** - Barefoot Luxury Tours
- **318664** - Hen's Party Tours
- **292796** - Brewery Tours
- **395072** - Corporate Tours
- **398329** - Bus Charter

### Website to Rezdy Category Mapping
| Website Category | Rezdy Category IDs | Description |
|------------------|-------------------|-------------|
| `winery-tours` | 276149, 620787 | Gold Coast day tours + daily wine tours |
| `hop-on-hop-off` | 610656, 610660 | Brisbane + Gold Coast hop-on-hop-off |
| `nature-tours` | 276150 | Brisbane day tours for nature experiences |
| `private-tours` | 398952 | Private tours |
| `luxury-tours` | 466255 | Barefoot luxury |
| `brewery-tours` | 292796 | Brewery tours |
| `hens-party-tours` | 318664 | Hen's party |
| `corporate-tours` | 395072 | Corporate tours |
| `bus-charter` | 398329 | Bus charter |

### Destination Mapping
| Destination | Rezdy Category IDs | Combined Filter |
|-------------|-------------------|-----------------|
| `gold-coast` | 610660, 276149 | Gold Coast hop-on-hop-off + day tours |
| `brisbane` | 610656, 276150 | Brisbane hop-on-hop-off + day tours |
| `mt-tamborine` | 276149 | Mt Tamborine accessed via Gold Coast day tours |

## Usage Notes

- Categories are designed to be mutually compatible (tours can belong to multiple categories)
- Slug format uses kebab-case for consistency
- Destinations can be combined with any tour type
- Service types are supplementary to main tour categories
- Tags provide additional filtering granularity
- Rezdy category IDs are used for direct API integration and product filtering
- Legacy category mappings maintain backward compatibility with existing URLs