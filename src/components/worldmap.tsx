import { useEffect, useRef } from "react";
import * as d3 from "d3-geo";
import { select } from "d3-selection";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { FeatureCollection, Feature, Geometry, GeoJsonProperties } from "geojson";
import { getZoneColor } from "../data/timezones";

interface Props {
    selectedOffset: number;
    onZoneClick: (offset: number) => void;
}

export default function WorldMap({selectedOffset, onZoneClick}: Props) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect (() => {
        // fetching Earth topojson
        fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
            .then(r => r.json())
            .then(data => {
                const world = data as Topology;
                const countries = feature(world, world.objects.countries) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
            const projection = d3.geoNaturalEarth1()
            .scale(160)
            .translate([480, 250]);
            const path = d3.geoPath().projection(projection);

            const svg = select(svgRef.current);
            svg.selectAll("path")
            .data(countries.features)
            .join("path")
            .attr("d", path)
            .attr("fill", d => {
                // map each country to its UTC offset using its longitude
                const centroid = d3.geoCentroid(d);
                // 15 deg = 1 hour
                const offset = Math.round(centroid[0] / 15);
                return getZoneColor(offset);
            })
            .attr("stroke", "#FFF")
            .attr("stroke-width", 0.4)
            .on("click", (_: MouseEvent, d: Feature<Geometry,GeoJsonProperties>) => {
                const centroid = d3.geoCentroid(d);
                onZoneClick(Math.round(centroid[0] / 15));
            });
        });
    }, []);

    // change highlight when selectedOffset is changed
    useEffect(() => {
        select(svgRef.current)
      .selectAll<SVGPathElement, Feature<Geometry, GeoJsonProperties>>("path")
      .attr("opacity", d => {
        const centroid = d3.geoCentroid(d);
        const offset = Math.round(centroid[0] / 15);
        return offset === selectedOffset ? 1 : 0.45;
      });
  }, [selectedOffset]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 960 500"
      style={{ width: "100%", cursor: "pointer" }}
    />
  );
}