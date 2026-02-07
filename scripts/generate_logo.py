from PIL import Image, ImageDraw, ImageFont
import math

def create_gradient(width, height, start_color, end_color):
    base = Image.new('RGBA', (width, height), start_color)
    top = Image.new('RGBA', (width, height), end_color)
    mask = Image.new('L', (width, height))
    mask_data = []
    for y in range(height):
        for x in range(width):
            mask_data.append(int(255 * (y / height)))
    mask.putdata(mask_data)
    base.paste(top, (0, 0), mask)
    return base

def draw_logo(size=1024):
    # Colors: Indigo to Violet gradient
    start_color = (79, 70, 229, 255) # Indigo 600
    end_color = (124, 58, 237, 255)  # Violet 600
    
    # Create background
    img = create_gradient(size, size, start_color, end_color)
    draw = ImageDraw.Draw(img)
    
    # Draw a "Bill" shape
    margin = size * 0.25
    rect_coords = [margin, margin, size - margin, size - margin]
    
    # White Receipt
    draw.rounded_rectangle(rect_coords, radius=size*0.05, fill=(255, 255, 255, 255))
    
    # Lines on receipt
    line_color = (203, 213, 225, 255) # Slate 300
    line_height = size * 0.03
    start_x = margin + size * 0.1
    end_x = size - margin - size * 0.1
    
    current_y = margin + size * 0.15
    for i in range(3):
        draw.rectangle([start_x, current_y, end_x, current_y + line_height], fill=line_color)
        current_y += line_height * 2.5
        
    # "Split" cut line (dashed)
    split_y = size * 0.5
    dash_len = size * 0.02
    for x in range(int(margin), int(size - margin), int(dash_len * 2)):
        draw.line([(x, split_y), (x + dash_len, split_y)], fill=(148, 163, 184, 255), width=int(size * 0.01))
        
    # Checkmark or Coin at bottom
    # Let's draw a simple "Split" symbol (arrows diverging) or just a check
    # Checkmark
    check_color = (16, 185, 129, 255) # Emerald 500
    # points for check
    center_x = size * 0.5
    center_y = size * 0.7
    
    # Circle for check
    circle_rad = size * 0.12
    draw.ellipse([center_x - circle_rad, center_y - circle_rad, center_x + circle_rad, center_y + circle_rad], fill=check_color)
    
    # White check stroke
    # Simple polygon
    # ...
    
    return img

if __name__ == "__main__":
    logo = draw_logo()
    logo.save('logo-source.png')
    print("Generated logo-source.png")
