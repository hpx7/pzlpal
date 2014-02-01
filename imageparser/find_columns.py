# Example Usage: python find_columns.py puzzles/image1.jpg puzzles/columns

import cv2
import numpy as np
import math
import sys

# Load the image
img = cv2.imread(sys.argv[1])
height, width, depth = img.shape

# convert to grayscale
gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)

# smooth the image to avoid noises
gray = cv2.medianBlur(gray,5)

# Apply adaptive threshold
thresh = cv2.adaptiveThreshold(gray,255,1,1,11,2)
thresh_color = cv2.cvtColor(thresh,cv2.COLOR_GRAY2BGR)

# apply some dilation and erosion to join the gaps
# was 30, 20, maybe 8, 8
thresh = cv2.dilate(thresh,None,iterations = 30)
thresh = cv2.erode(thresh,None,iterations = 20)

# Find the contours
contours,hierarchy = cv2.findContours(thresh,cv2.RETR_LIST,cv2.CHAIN_APPROX_SIMPLE)


columns = []
# For each contour, find the bounding rectangle and draw it
for cnt in contours:
    x,y,w,h = cv2.boundingRect(cnt)
    if w > width*.10 and h > height*.05:
      column = img[y:y+h, x:x+w]
      columns.append((column,x))

    #cv2.rectangle(img,(x,y),(x+w,y+h),(0,255,0),2)
    #cv2.rectangle(thresh_color,(x,y),(x+w,y+h),(0,255,0),2)
count = 0
for column in sorted(columns, key=lambda column: column[1]):
  cv2.imwrite(sys.argv[2] + "/" + str(count) + ".jpg", column[0])
  count += 1




# Finally show the image
# cv2.imshow('img',img)
# cv2.imshow('res',thresh_color)
# cv2.waitKey(0)
# cv2.destroyAllWindows()
# cv2.imwrite(sys.argv[2],thresh_color)
# # Example Usage: python find_columns.py puzzles/image1.jpg puzzles/columns

# import cv2
# import numpy as np
# import math
# import sys

# # Load the image
# img = cv2.imread(sys.argv[1])
# height, width, depth = img.shape

# # convert to grayscale
# gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)

# # smooth the image to avoid noises
# gray = cv2.medianBlur(gray,5)

# # Apply adaptive threshold
# thresh = cv2.adaptiveThreshold(gray,255,1,1,11,2)
# thresh_color = cv2.cvtColor(thresh,cv2.COLOR_GRAY2BGR)


# iters = 60
# passed = False

# while not passed and iters > 0:
#   print "Iters", iters
#   iters -= 5
#   passed = True

#   # apply some dilation and erosion to join the gaps
#   # was 30, 20, maybe 8, 8
#   thresh_new = cv2.dilate(thresh,None,iterations = iters)
#   thresh_new = cv2.erode(thresh,None,iterations = iters)

#   # Find the contours
#   contours,hierarchy = cv2.findContours(thresh_new,cv2.RETR_LIST,cv2.CHAIN_APPROX_SIMPLE)


#   columns = []
#   # For each contour, find the bounding rectangle and draw it
#   for cnt in contours:
#       x,y,w,h = cv2.boundingRect(cnt)
#       if w > width*.10 and h > height*.05:
#         column = img[y:y+h, x:x+w]
#         columns.append((column,x))
#       if w > width * .50:
#         passed = False
#         print "Bad"

#   if len(columns) < 1:
#     passed = False



#     #cv2.rectangle(img,(x,y),(x+w,y+h),(0,255,0),2)
#     #cv2.rectangle(thresh_color,(x,y),(x+w,y+h),(0,255,0),2)
# count = 0
# for column in sorted(columns, key=lambda column: column[1]):
#   cv2.imwrite(sys.argv[2] + "/" + str(count) + ".jpg", column[0])
#   count += 1

# print count


# # Finally show the image
# # cv2.imshow('img',img)
# # cv2.imshow('res',thresh_color)
# # cv2.waitKey(0)
# # cv2.destroyAllWindows()
# # cv2.imwrite(sys.argv[2],thresh_color)