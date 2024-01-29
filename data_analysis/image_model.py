import open_clip
import cv2
import os
from sentence_transformers import util
from PIL import Image

device = "cpu"
model, _, preprocess = open_clip.create_model_and_transforms('ResNet-101', pretrained='convnext_small')
model.to(device)

def imageEncoder(img):
    img1 = Image.fromarray(img).convert('L')
    img1 = preprocess(img1).unsqueeze(0).to(device)
    img1 = model.encode_image(img1)
    return img1

def generateScore(image1, image2):
    test_img = cv2.imread(image1, cv2.IMREAD_UNCHANGED)
    data_img = cv2.imread(image2, cv2.IMREAD_UNCHANGED)
    img1 = imageEncoder(test_img)
    img2 = imageEncoder(data_img)
    cos_scores = util.pytorch_cos_sim(img1, img2)
    score = round(float(cos_scores[0][0])*100, 3)
    return score
    
def main():
    script_dir = os.path.dirname(os.path.realpath(__file__))
    sim_score = []
    for i in range(1, 51):
        image1 = os.path.join(script_dir, f"image_data/generated/generated_circle_{i}.png")
        image2 = os.path.join(script_dir, f"image_data/drawn/drawn_circle_{i}.png")
        sim_score.append(i, generateScore(image1, image2))
    
    for sim in sim_score:
        print (sim) 

if __name__ == "__main__":
    main()