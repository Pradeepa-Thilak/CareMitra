// utils/geocoder.js
const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours

class Geocoder {
  constructor() {
    this.services = [
      this.geocodeWithOSM.bind(this)
    ];
  }

  // Method 1: OpenStreetMap (FREE, no limits)
  async geocodeWithOSM(address, pincode) {
    try {
      const cacheKey = `osm_${address}_${pincode}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const searchQuery = `${address}, ${pincode}, India`;
      const encodedQuery = encodeURIComponent(searchQuery);
      
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CareMitra-Healthcare-App/1.0',
            'Accept-Language': 'en'
          },
          timeout: 5000
        }
      );

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const coordinates = {
          type: 'Point',
          coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
          accuracy: this.calculateAccuracy(result),
          formattedAddress: result.display_name,
          source: 'openstreetmap'
        };
        
        cache.set(cacheKey, coordinates);
        return coordinates;
      }
      
      return null;
    } catch (error) {
      console.error('OSM Geocoding error:', error.message);
      return null;
    }
  }

  // Main geocode method - tries all services
  async geocode(address, pincode) {
    if (!address || !pincode) {
      return {
        type: 'Point',
        coordinates: [78.9629, 20.5937], // Default India coordinates
        accuracy: 'low',
        source: 'default'
      };
    }

    // Try each geocoding service
    for (const service of this.services) {
      const result = await service(address, pincode);
      if (result) {
        console.log(`📍 Geocoded with ${result.source}:`, result.coordinates);
        return result;
      }
    }

    // Fallback to default
    return {
      type: 'Point',
      coordinates: [78.9629, 20.5937],
      accuracy: 'low',
      source: 'default'
    };
  }

  calculateAccuracy(result) {
    // Calculate accuracy based on OSM result type
    const types = {
      'house': 'high',
      'building': 'high',
      'street': 'medium',
      'locality': 'medium',
      'city': 'low',
      'state': 'low'
    };
    
    return types[result.type] || 'medium';
  }
}

module.exports = new Geocoder();