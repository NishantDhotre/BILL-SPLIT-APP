import os
from PIL import Image

def generate_assets(source_image_path):
    if not os.path.exists(source_image_path):
        print(f"Error: Source image not found at {source_image_path}")
        return

    img = Image.open(source_image_path)

    # Web Assets
    web_sizes = {
        'public/logo192.png': (192, 192),
        'public/logo512.png': (512, 512),
        'public/favicon.ico': (64, 64) # Simple favicon
    }

    print("Generating Web Assets...")
    for path, size in web_sizes.items():
        resized = img.resize(size, Image.Resampling.LANCZOS)
        resized.save(path)
        print(f"Saved {path}")

    # Android Assets (mipmap)
    android_base = 'android/app/src/main/res'
    android_sizes = {
        'mipmap-mdpi': (48, 48),
        'mipmap-hdpi': (72, 72),
        'mipmap-xhdpi': (96, 96),
        'mipmap-xxhdpi': (144, 144),
        'mipmap-xxxhdpi': (192, 192)
    }

    print("Generating Android Assets...")
    for folder, size in android_sizes.items():
        folder_path = os.path.join(android_base, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        resized = img.resize(size, Image.Resampling.LANCZOS)
        
        # Save as ic_launcher.png
        resized.save(os.path.join(folder_path, 'ic_launcher.png'))
        # Save as ic_launcher_round.png (using same image for now, ideally would be masked)
        resized.save(os.path.join(folder_path, 'ic_launcher_round.png'))
        
        print(f"Saved icons in {folder}")

if __name__ == "__main__":
    # We'll expect the generated image to be saved as 'bill_splitter_logo.png' in the current dir
    # or we can pass it as an argument. For now let's assume it's in the root or artifacts.
    # actually, generate_image saves to artifacts. I need to know where that is.
    # The system prompt says artifacts are in <appDataDir>/brain/<conversation-id>
    # But I can also just copy it to the root project dir first.
    
    # I will rely on the user/agent to make sure the image is available.
    # For this script, I'll assume 'logo-source.png' exists in project root.
    generate_assets('logo-source.png')
