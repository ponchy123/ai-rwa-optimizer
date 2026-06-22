#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
渲染HTML mockup为PNG图片
"""
import subprocess
import os

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

# HTML文件列表
mockups = [
    ("demo/mockup_dashboard.html", "demo/frames/scene1.png"),
    ("demo/mockup_portfolio.html", "demo/frames/scene2.png"),
    ("demo/mockup_ai_strategy.html", "demo/frames/scene3.png"),
]

os.makedirs("demo/frames", exist_ok=True)

for html_file, output_file in mockups:
    abs_path = "file:///" + os.path.abspath(html_file).replace("\\", "/")
    print(f"Rendering {html_file}")
    cmd = [
        CHROME, "--headless", "--disable-gpu", "--no-sandbox",
        f"--screenshot={output_file}",
        "--window-size=1920,1080", "--hide-scrollbars",
        abs_path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(output_file):
        size = os.path.getsize(output_file)
        print(f"  OK: {output_file} ({size} bytes)")
    else:
        print(f"  FAILED: {output_file}")

print("Done!")