import { MapContainer, TileLayer, useMap } from "react-leaflet";
import api from "../api/axios";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// Component to update heatmap when issues change
function HeatmapLayer({ issues, map }) {
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!map || !issues || issues.length === 0) return;

    // Remove existing heat layer if any
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Group issues by location (cluster nearby issues)
    const locationGroups = {};
    const clusterRadius = 0.001; // ~100 meters

    issues.forEach((issue) => {
      if (!issue.lat || !issue.lng) return;

      // Find if there's a nearby cluster
      let foundCluster = false;
      for (const [key, group] of Object.entries(locationGroups)) {
        const [clusterLat, clusterLng] = key.split(",").map(Number);
        const distance = Math.sqrt(
          Math.pow(issue.lat - clusterLat, 2) +
            Math.pow(issue.lng - clusterLng, 2)
        );

        if (distance < clusterRadius) {
          group.push(issue);
          foundCluster = true;
          break;
        }
      }

      // Create new cluster if not found
      if (!foundCluster) {
        const key = `${issue.lat},${issue.lng}`;
        locationGroups[key] = [issue];
      }
    });

    // Create heat points with intensity based on issue count
    const heatPoints = [];
    Object.entries(locationGroups).forEach(([key, groupIssues]) => {
      const [lat, lng] = key.split(",").map(Number);
      // Intensity increases with number of issues (max 1.0)
      const intensity = Math.min(groupIssues.length / 10, 1.0);
      heatPoints.push([lat, lng, intensity]);
    });

    // If no clustering, use individual points
    if (heatPoints.length === 0) {
      issues.forEach((issue) => {
        if (issue.lat && issue.lng) {
          heatPoints.push([issue.lat, issue.lng, 0.3]);
        }
      });
    }

    // Create heat layer with better settings
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 30,
      blur: 20,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: "#3b82f6", // blue-500
        0.3: "#10b981", // green-500
        0.5: "#eab308", // yellow-500
        0.7: "#f97316", // orange-500
        1.0: "#ef4444", // red-500
      },
    });

    heatLayer.addTo(map);
    heatLayerRef.current = heatLayer;

    // Cleanup on unmount
    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, issues]);

  return null;
}

// Component to handle map instance
function MapContent({ issues }) {
  const map = useMap();

  return <HeatmapLayer issues={issues} map={map} />;
}

export default function Heatmap() {
  const [mapType, setMapType] = useState("street"); // 'street' or 'satellite'
  const [mapInstance, setMapInstance] = useState(null);

  const { data: issues, isLoading } = useQuery({
    queryKey: ["heatmap"],
    queryFn: async () => {
      const { data } = await api.get("/issues/all");
      // Filter out issues without valid coordinates
      return data.filter(
        (issue) =>
          issue.lat &&
          issue.lng &&
          !isNaN(issue.lat) &&
          !isNaN(issue.lng) &&
          issue.lat !== 0 &&
          issue.lng !== 0
      );
    },
  });

  // Tile layer URLs
  const tileLayers = {
    street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };

  // Count issues by location for stats
  const issueCount = issues?.length || 0;
  const uniqueLocations = new Set(
    issues?.map((i) => `${i.lat?.toFixed(4)},${i.lng?.toFixed(4)}`) || []
  ).size;

  return (
    <div className="w-full h-screen relative bg-gray-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Community Issues Heatmap</h1>
              <p className="text-sm text-gray-600">Geospatial analysis of reported community concerns</p>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{issueCount}</p>
              <p className="text-sm text-gray-600">Total Issues</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{uniqueLocations}</p>
              <p className="text-sm text-gray-600">Locations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="absolute top-20 right-6 z-[1000] bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80">
        {/* Map Type Selection */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Map View</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMapType("street")}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                mapType === "street"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Street
            </button>
            <button
              onClick={() => setMapType("satellite")}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                mapType === "satellite"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 7.35V19a2 2 0 01-2 2H5a2 2 0 01-2-2V7.35A2 2 0 013.5 5.5h17A2 2 0 0121 7.35z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.5 5.5l8.5 4.5 8.5-4.5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10V22" />
              </svg>
              Satellite
            </button>
          </div>
        </div>

        {/* Heat Intensity Legend */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Issue Density</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Low</span>
              <span className="text-xs text-gray-600">High</span>
            </div>
            <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 via-orange-500 to-red-500"></div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>1-2 issues</span>
              <span>6+ issues</span>
            </div>
          </div>
        </div>

        {/* Data Status */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-900 mb-2">Data Status</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Coverage:</span>
              <span className="font-medium">Rupandehi District</span>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-blue-600">
                <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading data...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="pt-20 h-full">
        <MapContainer
          center={[27.6842, 83.4323]}
          zoom={11}
          className="h-full w-full"
          whenCreated={setMapInstance}
        >
          <TileLayer
            url={tileLayers[mapType]}
            attribution={
              mapType === "satellite"
                ? "&copy; Esri &mdash; Source: Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community"
                : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
          />
          {mapInstance && <MapContent issues={issues} />}
        </MapContainer>
      </div>

      {/* Empty State */}
      {issues && issues.length === 0 && !isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center max-w-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600 text-sm">
            There are currently no geotagged issues to display on the heatmap.
          </p>
        </div>
      )}

      {/* Footer Information */}
      <div className="absolute bottom-4 left-6 z-[1000] bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
        <p className="text-xs text-gray-600">
          Municipal Corporation • Geospatial Analysis System
        </p>
      </div>
    </div>
  );
}