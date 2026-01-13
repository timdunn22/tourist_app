import { PrismaClient, MapPinType } from '@prisma/client';

const prisma = new PrismaClient();

const OPENROUTESERVICE_API_KEY = process.env.OPENROUTESERVICE_API_KEY;
const OPENROUTESERVICE_BASE_URL = 'https://api.openrouteservice.org';

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface Coordinate {
  lat: number;
  lng: number;
}

interface RouteOptions {
  profile?: 'driving-car' | 'foot-walking' | 'cycling-regular';
  avoidTolls?: boolean;
  avoidHighways?: boolean;
}

/**
 * Get map pins within bounds
 */
export async function getMapPins(
  bounds: Bounds,
  types?: MapPinType[],
  userId?: string
): Promise<any[]> {
  const pins: any[] = [];

  const typeFilter = types && types.length > 0 ? types : Object.values(MapPinType);

  // Fetch experiences as pins
  if (typeFilter.includes(MapPinType.EXPERIENCE)) {
    const experiences = await prisma.experience.findMany({
      where: {
        status: 'PUBLISHED',
        meetingPointLat: {
          gte: bounds.south,
          lte: bounds.north,
        },
        meetingPointLng: {
          gte: bounds.west,
          lte: bounds.east,
        },
      },
      select: {
        id: true,
        title: true,
        meetingPointLat: true,
        meetingPointLng: true,
        price: true,
        rating: true,
        images: true,
        category: {
          select: { name: true, icon: true },
        },
      },
      take: 100,
    });

    experiences.forEach((exp) => {
      if (exp.meetingPointLat && exp.meetingPointLng) {
        pins.push({
          id: `exp-${exp.id}`,
          type: MapPinType.EXPERIENCE,
          lat: Number(exp.meetingPointLat),
          lng: Number(exp.meetingPointLng),
          title: exp.title,
          price: Number(exp.price),
          rating: Number(exp.rating),
          image: exp.images?.[0],
          category: exp.category?.name,
          icon: exp.category?.icon,
          link: `/experience/${exp.id}`,
        });
      }
    });
  }

  // Fetch activities as pins
  if (typeFilter.includes(MapPinType.ACTIVITY)) {
    const activities = await prisma.socialActivity.findMany({
      where: {
        status: 'ACTIVE',
        latitude: {
          gte: bounds.south,
          lte: bounds.north,
        },
        longitude: {
          gte: bounds.west,
          lte: bounds.east,
        },
        startDate: { gte: new Date() },
      },
      select: {
        id: true,
        title: true,
        type: true,
        latitude: true,
        longitude: true,
        startDate: true,
        currentParticipants: true,
        maxParticipants: true,
        isFree: true,
        price: true,
        creator: {
          select: { name: true, avatar: true },
        },
      },
      take: 100,
    });

    activities.forEach((act) => {
      if (act.latitude && act.longitude) {
        pins.push({
          id: `act-${act.id}`,
          type: MapPinType.ACTIVITY,
          lat: Number(act.latitude),
          lng: Number(act.longitude),
          title: act.title,
          activityType: act.type,
          startDate: act.startDate,
          participants: `${act.currentParticipants}/${act.maxParticipants}`,
          isFree: act.isFree,
          price: act.price ? Number(act.price) : null,
          host: act.creator?.name,
          link: `/activities/${act.id}`,
        });
      }
    });
  }

  // Fetch stays as business pins
  if (typeFilter.includes(MapPinType.BUSINESS)) {
    const stays = await prisma.stay.findMany({
      where: {
        status: 'PUBLISHED',
        latitude: {
          gte: bounds.south,
          lte: bounds.north,
        },
        longitude: {
          gte: bounds.west,
          lte: bounds.east,
        },
      },
      select: {
        id: true,
        title: true,
        type: true,
        latitude: true,
        longitude: true,
        pricePerNight: true,
        rating: true,
        images: true,
      },
      take: 100,
    });

    stays.forEach((stay) => {
      pins.push({
        id: `stay-${stay.id}`,
        type: MapPinType.BUSINESS,
        lat: Number(stay.latitude),
        lng: Number(stay.longitude),
        title: stay.title,
        businessType: stay.type,
        price: Number(stay.pricePerNight),
        rating: Number(stay.rating),
        image: stay.images?.[0],
        link: `/stays/${stay.id}`,
      });
    });
  }

  // Fetch map pins from MapPin table
  const mapPins = await prisma.mapPin.findMany({
    where: {
      latitude: {
        gte: bounds.south,
        lte: bounds.north,
      },
      longitude: {
        gte: bounds.west,
        lte: bounds.east,
      },
      ...(typeFilter.length < Object.values(MapPinType).length && {
        type: { in: typeFilter },
      }),
    },
    take: 100,
  });

  mapPins.forEach((pin) => {
    pins.push({
      id: `pin-${pin.id}`,
      type: pin.type,
      lat: Number(pin.latitude),
      lng: Number(pin.longitude),
      title: pin.title,
      description: pin.description,
      image: pin.image,
      link: pin.referenceType && pin.referenceId ? `/${pin.referenceType}/${pin.referenceId}` : undefined,
    });
  });

  return pins;
}

/**
 * Get route from OpenRouteService
 */
export async function getRoute(
  start: Coordinate,
  end: Coordinate,
  options: RouteOptions = {}
): Promise<any> {
  if (!OPENROUTESERVICE_API_KEY) {
    throw new Error('OpenRouteService API key not configured');
  }

  const profile = options.profile || 'foot-walking';

  try {
    const response = await fetch(
      `${OPENROUTESERVICE_BASE_URL}/v2/directions/${profile}?api_key=${OPENROUTESERVICE_API_KEY}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json, application/geo+json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouteService error: ${error}`);
    }

    const data = await response.json() as {
      features?: Array<{
        properties?: {
          summary?: {
            distance?: number;
            duration?: number;
          };
          segments?: any[];
        };
        geometry?: {
          coordinates?: number[][];
        };
      }>;
      bbox?: number[];
    };

    // Extract route summary
    const feature = data.features?.[0];
    const properties = feature?.properties;
    const geometry = feature?.geometry;

    return {
      coordinates: geometry?.coordinates?.map((c: number[]) => ({
        lng: c[0],
        lat: c[1],
      })),
      distance: properties?.summary?.distance, // in meters
      duration: properties?.summary?.duration, // in seconds
      segments: properties?.segments,
      bbox: data.bbox,
    };
  } catch (error) {
    console.error('Route fetch error:', error);
    throw error;
  }
}

/**
 * Generate heatmap data for a specific type
 */
export async function getHeatmapData(
  type: 'activities' | 'experiences' | 'users',
  bounds?: Bounds
): Promise<Array<{ lat: number; lng: number; intensity: number }>> {
  const heatmapPoints: Array<{ lat: number; lng: number; intensity: number }> = [];

  if (type === 'activities') {
    const boundsFilter = bounds
      ? {
          latitude: { gte: bounds.south, lte: bounds.north },
          longitude: { gte: bounds.west, lte: bounds.east },
        }
      : {};

    const activities = await prisma.socialActivity.findMany({
      where: {
        status: 'ACTIVE',
        latitude: { not: null },
        longitude: { not: null },
        ...boundsFilter,
      },
      select: {
        latitude: true,
        longitude: true,
        currentParticipants: true,
      },
    });

    activities.forEach((act) => {
      if (act.latitude && act.longitude) {
        heatmapPoints.push({
          lat: Number(act.latitude),
          lng: Number(act.longitude),
          intensity: Math.min(act.currentParticipants / 10, 1),
        });
      }
    });
  }

  if (type === 'experiences') {
    const boundsFilter = bounds
      ? {
          meetingPointLat: { gte: bounds.south, lte: bounds.north },
          meetingPointLng: { gte: bounds.west, lte: bounds.east },
        }
      : {};

    const experiences = await prisma.experience.findMany({
      where: {
        status: 'PUBLISHED',
        meetingPointLat: { not: null },
        meetingPointLng: { not: null },
        ...boundsFilter,
      },
      select: {
        meetingPointLat: true,
        meetingPointLng: true,
        rating: true,
        bookingCount: true,
      },
    });

    experiences.forEach((exp) => {
      if (exp.meetingPointLat && exp.meetingPointLng) {
        const intensity = (Number(exp.rating) / 5) * 0.5 + Math.min(exp.bookingCount / 100, 0.5);
        heatmapPoints.push({
          lat: Number(exp.meetingPointLat),
          lng: Number(exp.meetingPointLng),
          intensity,
        });
      }
    });
  }

  return heatmapPoints;
}

/**
 * Update user's current location
 */
export async function updateUserLocation(
  userId: string,
  location: { latitude: number; longitude: number; city?: string; country?: string }
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentCity: location.city,
      currentCountry: location.country,
    },
  });
}

/**
 * Search for nearby places using a query
 */
export async function searchNearby(
  center: Coordinate,
  radiusKm: number = 10,
  types?: MapPinType[]
): Promise<any[]> {
  // Convert km to degrees (approximate)
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos(center.lat * (Math.PI / 180)));

  const bounds: Bounds = {
    north: center.lat + latDelta,
    south: center.lat - latDelta,
    east: center.lng + lngDelta,
    west: center.lng - lngDelta,
  };

  const pins = await getMapPins(bounds, types);

  // Calculate distance and sort by proximity
  return pins
    .map((pin) => ({
      ...pin,
      distance: calculateDistance(center, { lat: pin.lat, lng: pin.lng }),
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(point1: Coordinate, point2: Coordinate): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  const lat1 = toRad(point1.lat);
  const lat2 = toRad(point2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
