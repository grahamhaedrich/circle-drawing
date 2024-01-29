from scipy.spatial.distance import directed_hausdorff
from make_images import getCircleData
import numpy as np
import os

def hausdorffDist(drawn_points, generated_points):
    hausdorff_distance = []
    for i, (drawn, generated) in enumerate(zip(drawn_points, generated_points)):
        distance = round((directed_hausdorff(drawn, generated)[0]), 3)
        hausdorff_distance.append((i+1, distance))

    return hausdorff_distance

def formatData(drawn_data, generated_data):
    drawn_points = []
    for drawn_circle in drawn_data:
        x_values = [point['x'] for point in drawn_circle]
        y_values = [point['y'] for point in drawn_circle]
        points = np.array(list(zip(x_values, y_values)))
        drawn_points.append(points)

    generated_points = []
    for generated_circle in generated_data:
        x_center = generated_circle[0]['x']
        y_center = generated_circle[0]['y']
        radius = generated_circle[0]['r']
        theta = np.linspace(0, 2*np.pi, 100)
        x_values = x_center + radius * np.cos(theta)
        y_values = y_center + radius * np.sin(theta)
        points = np.array(list(zip(x_values, y_values)))
        generated_points.append(points)
    
    return drawn_points, generated_points

def main():
    json_path = os.path.join(os.path.dirname(__file__), 'json_data/circle_data_50_samples.json')
    drawn_data, generated_data = getCircleData(json_path)
    drawn_points, generated_points = formatData(drawn_data, generated_data)
    hausdorff_data = hausdorffDist(drawn_points, generated_points)

    for data in hausdorff_data:
        print(data)

if __name__ == "__main__":
    main()


