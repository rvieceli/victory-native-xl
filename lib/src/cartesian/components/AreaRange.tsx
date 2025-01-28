import * as React from "react";
import { Path, type PathProps } from "@shopify/react-native-skia";
import type { PointsArray, MaybeNumber } from "../../types";
import { type AreaPathOptions, useAreaPath } from "../hooks/useAreaPath";
import { AnimatedPath } from "./AnimatedPath";
import { type PathAnimationConfig } from "../../hooks/useAnimatedPath";

// Extend PointsArray but make y represent upper bound and y0 lower bound
export type AreaRangePointsArray = {
  x: number;
  xValue: PointsArray[number]["xValue"];
  y: MaybeNumber;
  y0: MaybeNumber;
  yValue: PointsArray[number]["yValue"];
}[];

export type AreaRangeProps = (
	| {
			points: AreaRangePointsArray;
			upperPoints?: never;
			lowerPoints?: never;
	  }
	| {
			points?: never;
			upperPoints: PointsArray;
			lowerPoints: PointsArray;
	  }
) & {
	animate?: PathAnimationConfig;
} & AreaPathOptions &
  Partial<Pick<PathProps, "color" | "blendMode" | "opacity" | "antiAlias">>;

export function AreaRange({
  points,
  upperPoints,
	lowerPoints,
  animate,
  curveType,
  connectMissingData,
  ...ops
}: React.PropsWithChildren<AreaRangeProps>) {
	const areaRangePoints = React.useMemo(() => {
		if (points) {
			// Create upper bound points going forward
			const _upperPoints = points.map((point) => ({
				...point,
				y: point.y,
			}));

			// Create lower bound points going backward
			const _lowerPoints = [...points].reverse().map((point) => ({
				...point,
				y: point.y0,
			}));

			// Combine into single array that traces a complete path
			return [..._upperPoints, ..._lowerPoints];
		}

		const reverseLowerPoints = [...lowerPoints].reverse();

		return [...upperPoints, ...reverseLowerPoints];
	}, [points, lowerPoints, upperPoints]);

  const { path } = useAreaPath(areaRangePoints, 0, {
    curveType,
    connectMissingData,
  });

  return React.createElement(animate ? AnimatedPath : Path, {
    path,
    style: "fill",
    ...ops,
    ...(Boolean(animate) && { animate }),
  });
}
