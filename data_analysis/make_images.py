import json
import os
import matplotlib.pyplot as plt
from matplotlib.patches import Circle

def getCircleData(json_path):
    with open(json_path, 'r') as file:
        circle_data = json.load(file)
        
    circles = circle_data.get('circles', {})
        
    drawn_circles = []
    generated_circles = []

    for user_id, sample_data in circles.items():
        drawn_circles.extend([json.loads(circle) for circle in sample_data.get('drawn', []) if circle is not None])
        generated_circles.extend([json.loads(circle) for circle in sample_data.get('generated', []) if circle is not None])

    return drawn_circles, generated_circles

def generateImages(drawn_data, generated_data):
    save_dir = os.path.join(os.path.dirname(__file__), 'image_data/drawn')
    for i, drawn_circle in enumerate(drawn_data):
        fig, ax = plt.subplots()
        ax.axis('off')

        x_values = [point['x'] for point in drawn_circle]
        y_values = [point['y'] for point in drawn_circle]

        ax.plot(x_values, y_values, color='white')

        ax.set_xlim(min(x_values) - 10, max(x_values) + 10)
        ax.set_ylim(min(y_values) - 10, max(y_values) + 10)

        plt.savefig(os.path.join(save_dir, f"drawn_circle_{i+1}.png"), facecolor='black')
        plt.close()

    save_dir = os.path.join(os.path.dirname(__file__), 'image_data/generated')
    for i, generated_circle in enumerate(generated_data):
        fig, ax = plt.subplots()
        ax.axis('off')

        circle = Circle((generated_circle[0]['x'], generated_circle[0]['y']), generated_circle[0]['r'], color='white', fill=False)
        ax.add_patch(circle)
        ax.set_aspect('equal')
        
        x_min = generated_circle[0]['x'] - generated_circle[0]['r'] - 10
        x_max = generated_circle[0]['x'] + generated_circle[0]['r'] + 10
        y_min = generated_circle[0]['y'] - generated_circle[0]['r'] - 10
        y_max = generated_circle[0]['y'] + generated_circle[0]['r'] + 10

        ax.set_xlim(x_min, x_max)
        ax.set_ylim(y_min, y_max)

        plt.savefig(os.path.join(save_dir, f"generated_circle_{i+1}.png"), facecolor='black')
        plt.close()

def main():
    json_path = os.path.join(os.path.dirname(__file__), 'json_data/circle_data_50_samples.json')
    drawn_data, generated_data = getCircleData(json_path)
    generateImages(drawn_data, generated_data)

if __name__ == "__main__":
    main()


