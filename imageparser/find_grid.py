# Example Usage: 
#  python find_grid.py puzzles/basic.jpg 21 21 0
#  python find_grid.py puzzles/cross.jpg 13 13 0
#  python find_grid.py puzzles/e2.jpg 15 15 1
#  python find_grid.py puzzles/ez.jpg 21 21 1
#  python find_grid.py puzzles/ezpaper.jpg 13 13 1
#  python find_grid.py puzzles/filledin.jpg 21 21 1
#  python find_grid.py puzzles/newspaper.jpg 13 13 0
#  python find_grid.py puzzles/nyt.png 21 21 0
#  python find_grid.py puzzles/paper.jpg 15 15 0
#  python find_grid.py puzzles/sting.png 15 15 0
#  python find_grid.py puzzles/stretch.jpg 15 15 0
#  python find_grid.py puzzles/strez.jpg 15 15 1
#  python find_grid.py puzzles/yellow.jpg 18 18 0

import cv2
import numpy as np
import math
import sys

img_path = sys.argv[1] # first parameter is image path
width_squares = int(sys.argv[2]) # second parameter is number of squares wide the puzzle is
height_squares = int(sys.argv[3]) # third parameter is the number of squares tall the puzzle is
full_screen = int(sys.argv[4]) # fourth parameter is 1 if the puzzle takes up at least 80% of the screen, and 0 otherwise

img = cv2.imread(img_path)
gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
gaussian = cv2.GaussianBlur(gray,(3,3),0)
thresh_adaptive = cv2.adaptiveThreshold(gaussian,255,0,1,9,4)
contours_adaptive, hierarchy = cv2.findContours(thresh_adaptive, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

done = False


area = gray.size
max_area = area/8
for i in contours_adaptive:
    if cv2.contourArea(i)> max_area and (full_screen == 1 or cv2.contourArea(i) < area*.8):
        max_area = cv2.contourArea(i)
        peri = cv2.arcLength(i,True)
        approx = cv2.approxPolyDP(i,0.02*peri,True)
        if len(approx) == 4:
            done = True
            max_cnt = i
            max_approx = approx
            # cv2.drawContours(img,[approx],0,(0,255,0),2,cv2.CV_AA)

ret, thresh = cv2.threshold(gray,160,255,cv2.THRESH_BINARY_INV)
thresh2 = cv2.bitwise_not(thresh)


contours, hierarchy = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
for i in contours:
    if cv2.contourArea(i)> max_area and (full_screen == 1 or cv2.contourArea(i) < area*.8):
        max_area = cv2.contourArea(i)
        peri = cv2.arcLength(i,True)
        approx = cv2.approxPolyDP(i,0.02*peri,True)
        if len(approx) == 4:
            done = True
            max_cnt = i
            max_approx = approx
            # cv2.drawContours(img,[approx],0,(0,255,0),2,cv2.CV_AA)


# cut the crossword region, and resize it to a standard size with 10px x 10px blocks
x,y,w,h = cv2.boundingRect(max_approx)
print x,y,w,h
cross_rect = thresh2[y:y+h, x:x+w]
cross_rect = cv2.resize(cross_rect,(width_squares*10,height_squares*10))
# print width_squares

# cv2.imwrite('puzzles/out1.jpg',img)
# cv2.imwrite('puzzles/out2.jpg',cross_rect)

cross = np.zeros((width_squares,height_squares))

# select each box, if number of white pixels is more than 50, it is white box
for i in xrange(width_squares):
    for j in xrange(height_squares):
        box = cross_rect[i*10:(i+1)*10, j*10:(j+1)*10]
        if cv2.countNonZero(box) > 50:
            cross.itemset((i,j),1)

print "", str(cross).replace("[","").replace("]","").replace(".","")


# Most puzzles are symmetric--use this for a test
# rotated = np.rot90(cross,2)
# if (rotated == cross).all():
#   print "Symmetric"
# else:
#   print "Not symmetric"