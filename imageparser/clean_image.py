# Example Usage: python find_grid.py in.jpg out.jpg grid_x grid_y grid_width grid_height
import cv2
import numpy as np
import math
import sys

img_path = sys.argv[1] # first parameter is image path
x0 = int(sys.argv[3])
y0 = int(sys.argv[4])
x1 = int(sys.argv[3]) + int(sys.argv[5])
y1 = int(sys.argv[4]) + int(sys.argv[6])


# Clean
img = cv2.imread(img_path)
gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
gaussian = cv2.GaussianBlur(gray,(3,3),0)
# was: 120, 160, 120!!!
ret, thresh = cv2.threshold(gaussian,120,255,cv2.THRESH_BINARY_INV)
thresh2 = cv2.bitwise_not(thresh)


# Draw white rectangle over grid
cv2.rectangle(thresh2,(x0-2,y0-2),(x1+2,y1+2),(255,255,255),-1)


# Create image
cv2.imwrite(sys.argv[2],thresh2)