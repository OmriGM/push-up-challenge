/*
 * Calculates the angle ABC (in radians)
 *
 * A first point, ex: {x: 0, y: 0}
 * C second point
 * B center point
 */
export const findAngle = (A, B, C) => {
    const AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2))
    const BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2))
    const AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2))
    return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB))
}

export const findAxis = (A, B) =>  Math.atan2(B.y - A.y, B.x - A.x) * 180 / Math.PI