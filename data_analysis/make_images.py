import json
import os
import matplotlib.pyplot as plt
from matplotlib.patches import Shape

def getShapeData(json_path):
    with open(json_path, 'r') as file:
        shape_data = json.load(file)
        
    shapes = shape_data.get('shapes', {})
        
    drawn_shapes = []
    generated_shapes = []

    for user_id, sample_data in shapes.items():
        drawn_shapes.extend([json.loads(shape) for shape in sample_data.get('drawn', []) if shape is not None])
        generated_shapes.extend([json.loads(shape) for shape in sample_data.get('generated', []) if shape is not None])

    return drawn_shapes, generated_shapes

def generateImages(drawn_data, generated_data):
    save_dir = os.path.join(os.path.dirname(__file__), 'image_data/drawn')
    for i, drawn_shape in enumerate(drawn_data):
        fig, ax = plt.subplots()
        ax.axis('off')

        x_values = [point['x'] for point in drawn_shape]
        y_values = [point['y'] for point in drawn_shape]

        ax.plot(x_values, y_values, color='white')

        ax.set_xlim(min(x_values) - 10, max(x_values) + 10)
        ax.set_ylim(min(y_values) - 10, max(y_values) + 10)

        plt.savefig(os.path.join(save_dir, f"drawn_shape_{i+1}.png"), facecolor='black')
        plt.close()

    save_dir = os.path.join(os.path.dirname(__file__), 'image_data/generated')
    for i, generated_shape in enumerate(generated_data):
        fig, ax = plt.subplots()
        ax.axis('off')

        shape = Shape((generated_shape[0]['x'], generated_shape[0]['y']), generated_shape[0]['r'], color='white', fill=False)
        ax.add_patch(shape)
        ax.set_aspect('equal')
        
        x_min = generated_shape[0]['x'] - generated_shape[0]['r'] - 10
        x_max = generated_shape[0]['x'] + generated_shape[0]['r'] + 10
        y_min = generated_shape[0]['y'] - generated_shape[0]['r'] - 10
        y_max = generated_shape[0]['y'] + generated_shape[0]['r'] + 10

        ax.set_xlim(x_min, x_max)
        ax.set_ylim(y_min, y_max)

        plt.savefig(os.path.join(save_dir, f"generated_shape_{i+1}.png"), facecolor='black')
        plt.close()

def main():
    json_path = os.path.join(os.path.dirname(__file__), 'json_data/shape_data_50_samples.json')
    drawn_data, generated_data = getShapeData(json_path)
    generateImages(drawn_data, generated_data)

if __name__ == "__main__":
    main()


