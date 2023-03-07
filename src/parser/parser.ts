/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-argument */
import { create } from 'xmlbuilder2';
import BaseBuilder from '../builder/BaseBuilder';
import { Link, Point, Route, Segment, Track } from '../builder/BaseBuilder/models';

const getArrayOrNothing = (source: any): any[] | undefined => {
    if (Array.isArray(source)) {
        return source;
    }
    if (source) {
        return [source];
    }
    return undefined;
};

const getPoints = (source: any) => {
    return (
        getArrayOrNothing(source)?.map((item) => {
            return new Point(Number(item['@lat']), Number(item['@lon']), {
                ele: item.ele != null ? Number(item.ele) : undefined,
                time: item.time ? new Date(item.time) : undefined,
                name: item.name,
                sym: item.sym,
                type: item.type,
                fix: item.fix != null ? Number(item.fix) : undefined,
                cmt: item.cmt,
                desc: item.desc,
                src: item.src,
                dgpsid: item.dgpsid != null ? Number(item.dgpsid) : undefined,
                ageofdgpsdata: item.ageofdgpsdata != null ? Number(item.ageofdgpsdata) : undefined,
                hdop: item.hdop != null ? Number(item.hdop) : undefined,
                sat: item.sat != null ? Number(item.sat) : undefined,
                pdop: item.pdop != null ? Number(item.pdop) : undefined,
                magvar: item.magvar != null ? Number(item.magvar) : undefined,
                vdop: item.vdop != null ? Number(item.vdop) : undefined,
                geoidheight: item.geoidheight != null ? Number(item.geoidheight) : undefined,
                link: item.link ? new Link(item.link['@href']) : undefined,
            });
        }) || []
    );
};

const getRoutes = (source: any) => {
    return getArrayOrNothing(source)?.map((item) => {
        return new Route({
            name: item.name,
            rtept: getPoints(item.rtept),
        });
    });
};

const getSegments = (source: any) => {
    return getArrayOrNothing(source)?.map((item) => {
        return new Segment(getPoints(item.trkpt));
    });
};

const getTracks = (source: any) => {
    return getArrayOrNothing(source)?.map((item) => {
        return new Track(getSegments(item.trkseg), {
            name: item.name,
        });
    });
};

export const _experimentalParseGpx = (gpx: string): BaseBuilder => {
    const parsed = create(gpx).toObject() as any;

    if (!parsed.gpx) {
        throw new Error('Invalid format.');
    }

    const gpxData = new BaseBuilder();

    const routes = getRoutes(parsed.gpx.rte);

    if (routes) {
        gpxData.setRoutes(routes);
    }

    const waypoints = getPoints(parsed.gpx.wpt);

    if (waypoints && waypoints.length) {
        gpxData.setWayPoints(waypoints);
    }

    const tracks = getTracks(parsed.gpx.trk);

    if (tracks) {
        gpxData.setTracks(tracks);
    }

    return gpxData;
};
