import { BlogPost } from "@/components/blog-card"

// Static blog configuration - easily modifiable
export const BLOG_CONFIG = {
  // Blog section settings
  section: {
    title: "Travel Blog",
    description: "Discover insider tips, destination guides, and inspiring travel stories from our expert team. Get the most out of your adventures with our comprehensive travel resources and local insights.",
    features: [
      { icon: "MapPin", text: "Destination guides" },
      { icon: "Star", text: "Expert travel tips" },
      { icon: "Calendar", text: "Weekly updates" },
      { icon: "BookOpen", text: "Local insights" }
    ]
  },
  
  // Blog page settings
  page: {
    title: "Travel Stories & Tips",
    subtitle: "Discover insider tips, tour guides, and inspiring travel stories from our tropical paradise experts.",
    categories: ["All", "Hawaii", "Caribbean", "Fiji", "Bali", "Wine Tours", "Travel Tips", "Activities", "Photography", "Sustainable Travel"]
  },
  
  // Newsletter settings
  newsletter: {
    title: "Stay Updated",
    description: "Subscribe to our newsletter for the latest travel tips, tour guides, and exclusive offers.",
    placeholder: "Enter your email"
  }
}

// Static blog posts data - centralized for easy management
export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "10 Must-Visit Beaches in Hawaii",
    excerpt: "Discover the most stunning beaches across the Hawaiian islands, from the black sands of Punalu'u to the pristine waters of Lanikai Beach.",
    author: "Sarah Johnson",
    date: "2024-01-15",
    readTime: "5 min read",
    category: "Hawaii",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop&crop=center",
    featured: true,
    slug: "10-must-visit-beaches-in-hawaii"
  },
  {
    id: 2,
    title: "Caribbean Food Guide: Local Delicacies You Must Try",
    excerpt: "Explore the vibrant culinary landscape of the Caribbean with our comprehensive guide to local dishes and hidden food gems.",
    author: "Marcus Rodriguez",
    date: "2024-01-12",
    readTime: "7 min read",
    category: "Caribbean",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=450&fit=crop&crop=center",
    featured: true,
    slug: "caribbean-food-guide-local-delicacies-you-must-try"
  },
  {
    id: 3,
    title: "Top 10 Hidden Gems in Wine Country",
    excerpt: "Discover secret vineyards and local favorites off the beaten path in California's premier wine regions.",
    author: "Emily Chen",
    date: "2024-01-10",
    readTime: "6 min read",
    category: "Wine Tours",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=450&fit=crop&crop=center",
    featured: false,
    slug: "top-10-hidden-gems-in-wine-country"
  },
  {
    id: 4,
    title: "Best Time to Visit Fiji: A Seasonal Guide",
    excerpt: "Learn about Fiji's seasons, weather patterns, and the best times to visit for different activities and experiences.",
    author: "David Thompson",
    date: "2024-01-08",
    readTime: "6 min read",
    category: "Fiji",
    image: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=450&fit=crop&crop=center",
    featured: false,
    slug: "best-time-to-visit-fiji-a-seasonal-guide"
  },
  {
    id: 5,
    title: "Snorkeling vs Scuba Diving: Which is Right for You?",
    excerpt: "Compare snorkeling and scuba diving to help you choose the best underwater adventure for your tropical vacation.",
    author: "Lisa Park",
    date: "2024-01-05",
    readTime: "5 min read",
    category: "Activities",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=450&fit=crop&crop=center",
    featured: false,
    slug: "snorkeling-vs-scuba-diving-which-is-right-for-you"
  },
  {
    id: 6,
    title: "Hidden Gems of Bali: Off the Beaten Path",
    excerpt: "Discover lesser-known attractions and experiences in Bali that offer authentic culture and stunning natural beauty.",
    author: "James Wilson",
    date: "2024-01-03",
    readTime: "8 min read",
    category: "Bali",
    image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=450&fit=crop&crop=center",
    featured: false,
    slug: "hidden-gems-of-bali-off-the-beaten-path"
  },
  {
    id: 7,
    title: "Packing Tips for Adventure Tours",
    excerpt: "Essential packing advice for adventure tours, including what to bring, what to leave behind, and how to pack efficiently.",
    author: "Rachel Green",
    date: "2024-01-01",
    readTime: "4 min read",
    category: "Travel Tips",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=450&fit=crop&crop=center",
    featured: false,
    slug: "packing-tips-for-adventure-tours"
  },
  {
    id: 8,
    title: "Photography Tips for Your Tropical Vacation",
    excerpt: "Capture stunning memories with these professional photography tips specifically designed for tropical destinations.",
    author: "Michael Brown",
    date: "2023-12-28",
    readTime: "7 min read",
    category: "Photography",
    image: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=800&h=450&fit=crop&crop=center",
    featured: false,
    slug: "photography-tips-for-your-tropical-vacation"
  },
  {
    id: 9,
    title: "Sustainable Tourism: How to Travel Responsibly",
    excerpt: "Learn how to minimize your environmental impact while maximizing your travel experiences with sustainable tourism practices.",
    author: "Anna Martinez",
    date: "2023-12-25",
    readTime: "6 min read",
    category: "Sustainable Travel",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=450&fit=crop&crop=center",
    featured: false,
    slug: "sustainable-tourism-how-to-travel-responsibly"
  }
]

// Blog post content - easily expandable for different content types
export interface BlogPostContent {
  slug: string
  content: string
  contentType: 'html' | 'markdown' | 'rich'
  media?: {
    type: 'image' | 'video' | 'gallery'
    url: string
    caption?: string
    alt?: string
  }[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
  }
}

// Static blog post content - supports text, images, and videos
export const BLOG_POST_CONTENT: BlogPostContent[] = [
  {
    slug: "top-10-hidden-gems-in-wine-country",
    contentType: "html",
    content: `
      <p>California's wine country is renowned worldwide, but beyond the famous vineyards lie hidden treasures waiting to be discovered. These secret spots offer intimate tastings, stunning views, and authentic experiences away from the crowds.</p>
      
      <h2>1. Schramsberg Vineyards</h2>
      <p>Nestled in the hills of Calistoga, Schramsberg is a historic winery specializing in sparkling wines. Their cave tours take you through 19th-century tunnels carved into the hillside, offering a unique glimpse into winemaking history.</p>
      
      <h2>2. Castello di Amorosa</h2>
      <p>This authentic 13th-century Tuscan castle replica in Calistoga offers an unforgettable experience. Complete with a torture chamber, great hall, and medieval architecture, it's like stepping back in time while enjoying exceptional wines.</p>
      
      <h2>3. Inglenook Estate</h2>
      <p>Founded in 1879, this historic estate in Rutherford offers intimate tastings in their beautiful chateau. The property's rich history and exceptional Cabernet Sauvignon make it a must-visit for serious wine enthusiasts.</p>
      
      <h2>Planning Your Visit</h2>
      <p>The best time to visit these hidden gems is during the shoulder seasons (spring and fall) when the weather is perfect and the crowds are smaller. Many of these wineries require reservations, so plan ahead to secure your spot.</p>
      
      <p>Remember to designate a driver or book a tour service to ensure you can safely enjoy all the tastings. Our wine country tours include transportation and visits to both famous and hidden wineries for the complete experience.</p>
    `,
    media: [
      {
        type: "image",
        url: "/placeholder.jpg",
        caption: "Schramsberg's historic wine caves",
        alt: "Historic wine caves at Schramsberg Vineyards"
      }
    ],
    seo: {
      metaTitle: "Top 10 Hidden Gems in Wine Country - Pineapple Tours",
      metaDescription: "Discover secret vineyards and local favorites in California's wine country with our expert guide to hidden gems.",
      keywords: ["wine country", "hidden wineries", "California vineyards", "wine tours"]
    }
  },
  {
    slug: "best-time-to-visit-tropical-destinations",
    contentType: "html",
    content: `
      <p>Timing is everything when it comes to tropical travel. Understanding weather patterns, seasonal variations, and local events can make the difference between a good trip and an unforgettable adventure.</p>
      
      <h2>Dry Season vs. Wet Season</h2>
      <p>Most tropical destinations have two main seasons: dry and wet. The dry season typically offers the best weather for outdoor activities, while the wet season can provide lush landscapes and fewer crowds.</p>
      
      <h2>Caribbean: December to April</h2>
      <p>The Caribbean's peak season runs from December to April, offering perfect weather with minimal rainfall. However, this is also the most expensive time to visit. Consider May or November for great weather at lower prices.</p>
      
      <h2>Southeast Asia: November to March</h2>
      <p>For countries like Thailand, Vietnam, and Cambodia, the cool, dry season from November to March offers the most comfortable conditions for sightseeing and outdoor activities.</p>
      
      <h2>Pacific Islands: May to October</h2>
      <p>Fiji, Hawaii, and other Pacific destinations are best visited during their dry season from May to October, when humidity is lower and rainfall is minimal.</p>
      
      <h2>Hurricane and Monsoon Seasons</h2>
      <p>Always check for hurricane seasons in the Caribbean (June to November) and monsoon patterns in Asia. While these seasons can offer great deals, weather can be unpredictable.</p>
    `,
    media: [
      {
        type: "video",
        url: "/placeholder-video.mp4",
        caption: "Tropical weather patterns explained",
        alt: "Video guide to tropical weather patterns"
      }
    ]
  },
  {
    slug: "packing-tips-for-adventure-tours",
    contentType: "html",
    content: `
      <p>Packing for an adventure tour requires careful planning and strategic choices. The right gear can enhance your experience, while overpacking can weigh you down and limit your mobility.</p>
      
      <h2>Essential Clothing Items</h2>
      <p>Pack versatile, quick-dry clothing that can be layered. Merino wool and synthetic fabrics are ideal for their moisture-wicking and odor-resistant properties.</p>
      
      <h2>Footwear Fundamentals</h2>
      <p>Invest in quality hiking boots that are broken in before your trip. Pack lightweight sandals for camp and water activities, and consider water shoes for rocky beaches or river crossings.</p>
      
      <h2>Technology and Electronics</h2>
      <p>Bring a portable charger, waterproof phone case, and consider a GPS device for remote areas. Don't forget universal adapters and extra batteries for cameras and devices.</p>
      
      <h2>Health and Safety Essentials</h2>
      <p>Pack a comprehensive first aid kit, any prescription medications, sunscreen, insect repellent, and water purification tablets. Research any required vaccinations well in advance.</p>
      
      <h2>What to Leave Behind</h2>
      <p>Avoid cotton clothing, excessive electronics, valuable jewelry, and too many "just in case" items. Remember, you can buy forgotten essentials at most destinations.</p>
      
      <h2>Packing Strategy</h2>
      <p>Use packing cubes to organize your gear, roll clothes instead of folding, and pack heavier items closer to your back in your backpack. Always pack a change of clothes and essentials in your carry-on.</p>
    `,
    media: [
      {
        type: "gallery",
        url: "/placeholder-gallery.jpg",
        caption: "Essential packing items for adventure tours",
        alt: "Gallery of adventure tour packing essentials"
      }
    ]
  }
]

// Author information - easily expandable
export interface AuthorInfo {
  name: string
  bio: string
  avatar?: string
  expertise: string[]
  socialLinks?: {
    twitter?: string
    instagram?: string
    linkedin?: string
  }
}

export const AUTHORS: { [key: string]: AuthorInfo } = {
  "Sarah Johnson": {
    name: "Sarah Johnson",
    bio: "Passionate about discovering hidden gems and sharing authentic travel experiences with over 10 years of travel writing experience.",
    expertise: ["Wine Tours", "Cultural Travel", "Photography"],
    socialLinks: {
      instagram: "@sarahtravels",
      twitter: "@sarahjohnson"
    }
  },
  "Marcus Rodriguez": {
    name: "Marcus Rodriguez",
    bio: "Caribbean travel specialist and food enthusiast who has explored over 25 islands in the region.",
    expertise: ["Caribbean Travel", "Food Tourism", "Island Culture"],
    socialLinks: {
      instagram: "@marcuscaribbean"
    }
  },
  "Emily Chen": {
    name: "Emily Chen",
    bio: "Adventure travel expert and sustainability advocate with a passion for responsible tourism.",
    expertise: ["Adventure Tours", "Sustainable Travel", "Outdoor Activities"],
    socialLinks: {
      linkedin: "emily-chen-travel"
    }
  }
}

// Utility functions for easy data access
export const getBlogPostsByCategory = (category: string): BlogPost[] => {
  if (category === "All") return BLOG_POSTS
  return BLOG_POSTS.filter(post => post.category === category)
}

export const getFeaturedPosts = (): BlogPost[] => {
  return BLOG_POSTS.filter(post => post.featured)
}

export const getLatestPosts = (limit: number = 3): BlogPost[] => {
  return BLOG_POSTS.slice(0, limit)
}

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return BLOG_POSTS.find(post => post.slug === slug)
}

export const getBlogPostContent = (slug: string): BlogPostContent | undefined => {
  return BLOG_POST_CONTENT.find(content => content.slug === slug)
}

export const getAuthorInfo = (authorName: string): AuthorInfo | undefined => {
  return AUTHORS[authorName]
} 