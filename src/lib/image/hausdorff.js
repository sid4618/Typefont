/**
 * @module Hausdorff
 * @author Vasile Pește <sirvasile@protonmail.ch>
*/

export const HausdorffDistance = (
    function (undefined)
    {
        const _hausdorff = (points, points1, vector) => {
            let min;
            let max = Number.MIN_VALUE;
            
            for (const point of points)
            {
                min = Number.MAX_VALUE;
                
                for (const point1 of points1)
                {
                    // Euclidean distance.
                    let dis = Math.hypot(point.x - point1.x + vector.x, point.y - point1.y + vector.y);
                    
                    if (dis < min)
                        min = dis;
                    else if (dis == 0)
                        break;
                }
                
                if (min > max)
                    max = min;
            }
            
            return max;
        };
        
        const _center = (shape) => {
            let x = 0;
            let y = 0;
            let size = 0;
            
            for (let i = 0; i < shape.height; ++i)
                for (let j = 0; j < shape.width; ++j)
                    if (shape.data[(j + i * shape.width) * 4 + 3])
                    {
                        x += j;
                        y += i;
                        ++size;
                    }
            
            return { x: x / size, y: y / size };
        };
        
        const _distance = (shape, shape1) => {
            const points = [];
            const points1 = [];
            const width = shape.width;
            
            for (let y = 0; y < width; y += 4)
                for (let x = 0; x < width; x += 4)
                {
                    if (shape.data[(x + y * width) * 4 + 3] > 0)
                        points.push({ x, y, });
                    
                    if (shape1.data[(x + y * width) * 4 + 3] > 0)
                        points1.push({ x, y, });
                }
            
            const center = _center(shape);
            const center1 = _center(shape1);
            const vector = { x: center.x - center1.x, y: center.y - center1.y };
            const h1 = _hausdorff(points, points1, vector);
            
            vector.x *= -1;
            vector.y *= -1;
            
            const h2 = _hausdorff(points, points1, vector);
            const max = Math.max(h1, h2);
            
            return 1 - Math.pow(max * Math.sqrt(2) / 300, 1 / 1.4);
        };
        
        return (shape, shape1) => _distance(shape, shape1);
    }
());