#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成AI-RWA Portfolio Optimizer Logo图片
"""
from PIL import Image, ImageDraw, ImageFont
import math

def create_logo():
    # 尺寸
    size = 512
    img = Image.new('RGB', (size, size), (10, 10, 26))
    draw = ImageDraw.Draw(img)
    
    # 圆形背景
    center = size // 2
    radius = 200
    
    # 渐变圆形背景
    for r in range(radius, 0, -1):
        ratio = r / radius
        # 从紫色到深色的渐变
        r_color = int(102 + (10 - 102) * ratio)
        g_color = int(126 + (10 - 126) * ratio)
        b_color = int(234 + (26 - 234) * ratio)
        draw.ellipse([center-r, center-r, center+r, center+r], fill=(r_color, g_color, b_color))
    
    # 装饰环
    for angle in range(0, 360, 15):
        rad = math.radians(angle)
        x = center + 180 * math.cos(rad)
        y = center + 180 * math.sin(rad)
        draw.ellipse([x-4, y-4, x+4, y+4], fill=(255, 255, 255, 50))
    
    # AI文字
    try:
        font_ai = ImageFont.truetype("msyh.ttc", 120)
        font_sub = ImageFont.truetype("msyh.ttc", 36)
    except:
        font_ai = ImageFont.load_default()
        font_sub = ImageFont.load_default()
    
    # "AI"文字
    text = "AI"
    bbox = draw.textbbox((0, 0), text, font=font_ai)
    tw = bbox[2] - bbox[0]
    draw.text(((size - tw) // 2, center - 80), text, fill=(255, 255, 255), font=font_ai)
    
    # "-RWA"文字
    text2 = "-RWA"
    bbox2 = draw.textbbox((0, 0), text2, font=font_sub)
    tw2 = bbox2[2] - bbox2[0]
    draw.text(((size + 60) // 2, center + 20), text2, fill=(255, 255, 255), font=font_sub)
    
    # 底部文字
    text3 = "Portfolio"
    bbox3 = draw.textbbox((0, 0), text3, font=font_sub)
    tw3 = bbox3[2] - bbox3[0]
    draw.text(((size - tw3) // 2, center + 70), text3, fill=(200, 200, 200), font=font_sub)
    
    # 保存
    img.save('logo.png')
    print('Logo saved: logo.png')
    
    # 也生成一个小尺寸版本
    img_small = img.resize((128, 128), Image.LANCZOS)
    img_small.save('logo_small.png')
    print('Logo small saved: logo_small.png')

if __name__ == "__main__":
    create_logo()