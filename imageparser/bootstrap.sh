# yes | sudo apt-get update
# yes | sudo apt-get install python-numpy
# yes | sudo apt-get install python-opencv
sudo su

yes | sudo apt-get update
yes | sudo apt-get install zip unzip
yes | sudo apt-get install build-essential checkinstall cmake pkg-config yasm
yes | sudo apt-get install libtiff4-dev libjpeg-dev libjasper-dev
yes | sudo apt-get install libavcodec-dev libavformat-dev libswscale-dev libdc1394-22-dev libxine-dev libgstreamer0.10-dev libgstreamer-plugins-base0.10-dev libv4l-dev
yes | sudo apt-get install python-dev python-numpy
yes | sudo apt-get install libtbb-dev
yes | sudo apt-get install libqt4-dev libgtk2.0-dev
cd /vagrant
sudo unzip opencv-2.4.8.zip -d /usr/local/lib
cd /usr/local/lib/opencv-2.4.8/
mkdir build
cd build
cmake -D WITH_QT=ON -D WITH_XINE=ON -D WITH_OPENGL=ON -D WITH_TBB=ON -D BUILD_EXAMPLES=ON ..
make
sudo make install
sudo sh -c 'echo "/usr/local/lib" > /etc/ld.so.conf.d/opencv.conf'
sudo ldconfig

# node stuff
yes | sudo apt-get install git-core curl build-essential openssl libssl-dev
cd /usr/local/lib
yes | sudo git clone https://github.com/joyent/node.git
cd node
yes | sudo ./configure
yes | sudo make
yes | sudo make install
yes | sudo curl https://npmjs.org/install.sh | sudo sh

# yes | sudo npm install --nodedir=/usr/local/lib/node jsdom


# java
yes | sudo apt-get install openjdk-6-jre-headless

# image magick
yes | sudo apt-get install imagemagick

# tesseract
yes | sudo apt-get install tesseract-ocr

sudo echo "tessedit_char_blacklist \|\‘\’" >/usr/share/tesseract-ocr/tessdata/configs/custom_bl

# ruby
yes | sudo gem install json

# yes | sudo apt-get install zip unzip

# version="$(wget -q -O - http://sourceforge.net/projects/opencvlibrary/files/opencv-unix | egrep -m1 -o '\"[0-9](\.[0-9])+' | cut -c2-)"
# downloadfilelist="opencv-$version.tar.gz opencv-$version.zip"
# downloadfile=
# for file in $downloadfilelist; 
# do 
#         wget --spider http://sourceforge.net/projects/opencvlibrary/files/opencv-unix/$version/$file/download
#         if [ $? -eq 0 ]; then
#                 downloadfile=$file
#         fi
# done
# if [ -z "$downloadfile" ]; then
#         echo "Could not find download file on sourceforge page.  Please find the download file for version $version at"
#         echo "http://sourceforge.net/projects/opencvlibrary/files/opencv-unix/$version/ and update this script"
#         exit  1
# fi
# echo "Installing OpenCV" $version
# mkdir OpenCV
# cd OpenCV
# echo "Removing any pre-installed ffmpeg and x264"
# sudo apt-get -qq remove ffmpeg x264 libx264-dev
# echo "Installing Dependenices"
# sudo apt-get -qq install libopencv-dev build-essential checkinstall cmake pkg-config yasm libtiff4-dev libjpeg-dev libjasper-dev libavcodec-dev libavformat-dev libswscale-dev libdc1394-22-dev libxine-dev libgstreamer0.10-dev libgstreamer-plugins-base0.10-dev libv4l-dev python-dev python-numpy libtbb-dev libqt4-dev libgtk2.0-dev libfaac-dev libmp3lame-dev libopencore-amrnb-dev libopencore-amrwb-dev libtheora-dev libvorbis-dev libxvidcore-dev x264 v4l-utils ffmpeg unzip
# echo "Downloading OpenCV" $version
# wget -O $downloadfile http://sourceforge.net/projects/opencvlibrary/files/opencv-unix/$version/$downloadfile/download
# echo "Installing OpenCV" $version
# echo $downloadfile | grep ".zip"
# if [ $? -eq 0 ]; then
#         unzip $downloadfile
# else
#         tar -xvf $downloadfile
# fi
# cd opencv-$version
# mkdir build
# cd build
# yes | sudo apt-get cmake
# yes | sudo cmake -D CMAKE_BUILD_TYPE=RELEASE -D CMAKE_INSTALL_PREFIX=/usr/local -D WITH_TBB=ON -D BUILD_NEW_PYTHON_SUPPORT=ON -D WITH_V4L=ON -D INSTALL_C_EXAMPLES=ON -D INSTALL_PYTHON_EXAMPLES=ON -D BUILD_EXAMPLES=ON -D WITH_QT=ON -D WITH_OPENGL=ON ..
# make -j 4
# sudo make install
# sudo sh -c 'echo "/usr/local/lib" > /etc/ld.so.conf.d/opencv.conf'
# sudo ldconfig
# echo "OpenCV" $version "ready to be used"