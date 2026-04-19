import { useEffect, useRef, useState } from "react";
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
const WIDTH = 960;
const HEIGHT = 500;
const SCALE = 152.8;
const TX = 480;
const TY = 250;

export default function WorldMap({ selectedOffset, onZoneClick }: Props) {
    const svgRef   = useRef<SVGSVGElement>(null);
    const [loading, setLoading] = useState(true);

    const tzFeaturesRef = useRef<Feature<Geometry, GeoJsonProperties>[]>([]);

    const updateOpacity = (offset: number) => {
        select(svgRef.current)
            .selectAll<SVGPathElement, Feature<Geometry, GeoJsonProperties>>("path.tz")
            .attr("opacity", (d: Feature<Geometry, GeoJsonProperties>) => {
                const zone = d.properties?.zone as number;
                // highlights the clicked zone
                return Math.abs(zone - offset) < 0.26 ||
                       Math.round(zone) === offset
                    ? 0.75 : 0;
            });
    };

    useEffect(() => {
        if (!svgRef.current) return;

        Promise.all([
            fetch("/timezones.geojson").then(r => {
                if (!r.ok) throw new Error(`timezones.geojson: ${r.status}`);
                return r.json() as Promise<FeatureCollection<Geometry, GeoJsonProperties>>;
            }),
            fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(r => {
                if (!r.ok) throw new Error(`world-atlas: ${r.status}`);
                return r.json();
            }),
        ]).then(([tzData, worldData]) => {
            const svgEl = svgRef.current!;
            const svg   = select(svgEl);
            svg.selectAll("*").remove();

            const worldTopo = worldData as Topology;
            const land = feature(worldTopo, worldTopo.objects.land) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
            const countries = feature(worldTopo, worldTopo.objects.countries) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;

            const projection = d3.geoEquirectangular()
                .scale(SCALE)
                .translate([TX, TY]);
            const path = d3.geoPath().projection(projection);

            // ocean
            svg.append("rect")
                .attr("x", 0).attr("y", 0)
                .attr("width", WIDTH).attr("height", HEIGHT)
                .attr("fill", "#b0c4d8");

            // non-selected land
            svg.append("path")
                .datum(land.features[0])
                .attr("d", path)
                .attr("fill", "#d4c9a8")
                .attr("stroke", "none");

            // time zone regions
            tzFeaturesRef.current = tzData.features;
            svg.selectAll("path.tz")
                .data(tzData.features)
                .join("path")
                .attr("class", "tz")
                .attr("d", path)
                .attr("fill", (d: Feature<Geometry, GeoJsonProperties>) =>
                    getZoneColor(d.properties?.zone as number)
                )
                .attr("stroke", "none")
                .attr("opacity", 0)
                .on("click", (_: MouseEvent, d: Feature<Geometry, GeoJsonProperties>) => {
                    onZoneClick(Math.round(d.properties?.zone as number));
                });

            // country borders
            svg.selectAll("path.country")
                .data(countries.features)
                .join("path")
                .attr("class", "country")
                .attr("d", path)
                .attr("fill", "none")
                .attr("stroke", "#888")
                .attr("stroke-width", 0.3)
                .style("pointer-events", "none");

            setLoading(false);
            updateOpacity(selectedOffset);
        }).catch(err => {
            console.error("Map load error:", err);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        updateOpacity(selectedOffset);
    }, [selectedOffset]);

    return (
        <>
            {loading && <p style={{ textAlign: "center" }}>Loading map...</p>}
            <svg
                ref={svgRef}
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                width={WIDTH}
                height={HEIGHT}
                style={{ display: loading ? "none" : "block", cursor: "pointer" }}
            />
        </>
    );
}