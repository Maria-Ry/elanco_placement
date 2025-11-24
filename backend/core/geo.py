from __future__ import annotations
import random
from typing import Tuple

CITY_COORDS: dict[str, Tuple[float, float]] = {
    "London":      (51.509865, -0.118092),
    "Birmingham":  (52.489471, -1.898575),
    "Glasgow":     (55.860916, -4.251433),
    "Manchester":  (53.483959, -2.244644),
    "Liverpool":   (53.400002, -2.983333),
    "Leeds":       (53.801277, -1.548567),
    "Sheffield":   (53.383331, -1.466667),
    "Edinburgh":   (55.953251, -3.188267),
    "Bristol":     (51.454514, -2.587910),
    "Cardiff":     (51.481583, -3.179090),
    "Nottingham":  (52.950001, -1.150000),
    "Leicester":   (52.633331, -1.133333),
    "Southampton": (50.909698, -1.404351),
    "Newcastle":   (54.966667, -1.600000),
}

DEFAULT_COORDS: Tuple[float, float] = (54.0, -3.0)


def get_jittered_coords(region: str | None, jitter_deg: float = 0.05) -> Tuple[float, float]:
    
    if region is None:
        base_lat, base_lon = DEFAULT_COORDS
    else:
        base_lat, base_lon = CITY_COORDS.get(region, DEFAULT_COORDS)

    lat = base_lat + random.uniform(-jitter_deg, jitter_deg)
    lon = base_lon + random.uniform(-jitter_deg, jitter_deg)
    return lat, lon
