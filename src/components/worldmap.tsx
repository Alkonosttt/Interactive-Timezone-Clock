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

const EPS = 1e-6;

export default function WorldMap({ selectedOffset, onZoneClick }: Props) {
    const svgRef   = useRef<SVGSVGElement>(null);
    const [loading, setLoading] = useState(true);

    const tzFeaturesRef = useRef<Feature<Geometry, GeoJsonProperties>[]>([]);

    // changes opacity based on the selected offset

    const updateOpacity = (offset: number) => {
        if (!svgRef.current) return;

        select(svgRef.current)
            .selectAll<SVGPathElement, Feature<Geometry, GeoJsonProperties>>("path.tz")
            .attr("opacity", (d) => {
                const zone = d.properties?.zone as number;
                return Math.abs(zone - offset) < EPS
                    ? 0.75
                    : 0;
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
        ])
        .then(([tzData, worldData]) => {
            const svgEl = svgRef.current!;
            const svg   = select(svgEl);

            // clears the previous render
            svg.selectAll("*").remove();

            const worldTopo = worldData as Topology;

            const land = feature(
                worldTopo,
                worldTopo.objects.land
            ) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;

            const countries = feature(
                worldTopo,
                worldTopo.objects.countries
            ) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;

            const projection = d3.geoEquirectangular()
                .scale(SCALE)
                .translate([TX, TY]);

            const path = d3.geoPath().projection(projection);

            // ocean
            svg.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", WIDTH)
                .attr("height", HEIGHT)
                .attr("fill", "#b0c4d8");

            // base landmass
            svg.append("path")
                .datum(land.features[0])
                .attr("d", path)
                .attr("fill", "#d4c9a8")
                .attr("stroke", "none");

            // stores time zone features
            tzFeaturesRef.current = tzData.features;

            // time zone regions
            svg.selectAll("path.tz")
                .data(tzData.features)
                .join("path")
                .attr("class", "tz")
                .attr("d", path)
                .attr("fill", (d) =>
                    getZoneColor(d.properties?.zone as number)
                )
                .attr("stroke", "none")
                .attr("opacity", 0)
                .on("click", (_: MouseEvent, d) => {
                    const zone = d.properties?.zone as number;
                    onZoneClick(zone);
                });

            // country borders overlay
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

            // applies initial highlight (device time zone)
            updateOpacity(selectedOffset);
        })
        .catch(err => {
            console.error("Map load error:", err);
            setLoading(false);
        });
    }, []);

    // updates highlight when a different offset is selected
    useEffect(() => {
        updateOpacity(selectedOffset);
    }, [selectedOffset]);

    return (
        <>
            {loading && (
                <p style={{ textAlign: "center" }}>
                    Loading map...
                </p>
            )}

            <svg
                ref={svgRef}
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                width={WIDTH}
                height={HEIGHT}
                style={{
                    display: loading ? "none" : "block",
                    cursor: "pointer"
                }}
            />
        </>
    );
}
