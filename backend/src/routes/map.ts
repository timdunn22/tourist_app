import { Router, Request, Response } from 'express';
import { optionalAuth, authenticate } from '../middleware/auth';
import {
  getMapPins,
  getRoute,
  getHeatmapData,
  updateUserLocation,
  searchNearby,
} from '../services/mapService';
import { MapPinType } from '@prisma/client';

const router = Router();

/**
 * GET /api/map/pins
 * Get map pins within bounds
 */
router.get('/pins', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { north, south, east, west, types } = req.query;

    if (!north || !south || !east || !west) {
      return res.status(400).json({
        error: 'Missing bounds parameters',
        required: ['north', 'south', 'east', 'west'],
      });
    }

    const bounds = {
      north: parseFloat(north as string),
      south: parseFloat(south as string),
      east: parseFloat(east as string),
      west: parseFloat(west as string),
    };

    // Validate bounds
    if (
      isNaN(bounds.north) ||
      isNaN(bounds.south) ||
      isNaN(bounds.east) ||
      isNaN(bounds.west)
    ) {
      return res.status(400).json({ error: 'Invalid bounds values' });
    }

    // Parse types filter
    let typeFilter: MapPinType[] | undefined;
    if (types) {
      const typeArray = (types as string).split(',');
      typeFilter = typeArray.filter((t) =>
        Object.values(MapPinType).includes(t as MapPinType)
      ) as MapPinType[];
    }

    const userId = req.user?.id;
    const pins = await getMapPins(bounds, typeFilter, userId);

    res.json({ pins });
  } catch (error) {
    console.error('Get map pins error:', error);
    res.status(500).json({ error: 'Failed to get map pins' });
  }
});

/**
 * GET /api/map/route
 * Get route between two points
 */
router.get('/route', async (req: Request, res: Response) => {
  try {
    const { startLat, startLng, endLat, endLng, profile } = req.query;

    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({
        error: 'Missing coordinates',
        required: ['startLat', 'startLng', 'endLat', 'endLng'],
      });
    }

    const start = {
      lat: parseFloat(startLat as string),
      lng: parseFloat(startLng as string),
    };
    const end = {
      lat: parseFloat(endLat as string),
      lng: parseFloat(endLng as string),
    };

    if (isNaN(start.lat) || isNaN(start.lng) || isNaN(end.lat) || isNaN(end.lng)) {
      return res.status(400).json({ error: 'Invalid coordinate values' });
    }

    const validProfiles = ['driving-car', 'foot-walking', 'cycling-regular'];
    const routeProfile =
      profile && validProfiles.includes(profile as string)
        ? (profile as 'driving-car' | 'foot-walking' | 'cycling-regular')
        : 'foot-walking';

    const route = await getRoute(start, end, { profile: routeProfile });

    res.json(route);
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({ error: 'Failed to get route' });
  }
});

/**
 * GET /api/map/heatmap/:type
 * Get heatmap data
 */
router.get('/heatmap/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { north, south, east, west } = req.query;

    const validTypes = ['activities', 'experiences', 'users'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: 'Invalid heatmap type',
        validTypes,
      });
    }

    let bounds;
    if (north && south && east && west) {
      bounds = {
        north: parseFloat(north as string),
        south: parseFloat(south as string),
        east: parseFloat(east as string),
        west: parseFloat(west as string),
      };
    }

    const heatmapData = await getHeatmapData(
      type as 'activities' | 'experiences' | 'users',
      bounds
    );

    res.json({ data: heatmapData });
  } catch (error) {
    console.error('Get heatmap error:', error);
    res.status(500).json({ error: 'Failed to get heatmap data' });
  }
});

/**
 * POST /api/map/location
 * Update user's current location
 */
router.post('/location', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { latitude, longitude, city, country } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        error: 'Missing location',
        required: ['latitude', 'longitude'],
      });
    }

    await updateUserLocation(userId, { latitude, longitude, city, country });

    res.json({ message: 'Location updated' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

/**
 * GET /api/map/nearby
 * Search for nearby places
 */
router.get('/nearby', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius, types } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Missing center coordinates',
        required: ['lat', 'lng'],
      });
    }

    const center = {
      lat: parseFloat(lat as string),
      lng: parseFloat(lng as string),
    };

    if (isNaN(center.lat) || isNaN(center.lng)) {
      return res.status(400).json({ error: 'Invalid coordinate values' });
    }

    const radiusKm = radius ? parseFloat(radius as string) : 10;

    // Parse types filter
    let typeFilter: MapPinType[] | undefined;
    if (types) {
      const typeArray = (types as string).split(',');
      typeFilter = typeArray.filter((t) =>
        Object.values(MapPinType).includes(t as MapPinType)
      ) as MapPinType[];
    }

    const results = await searchNearby(center, radiusKm, typeFilter);

    res.json({ results });
  } catch (error) {
    console.error('Search nearby error:', error);
    res.status(500).json({ error: 'Failed to search nearby' });
  }
});

export default router;
