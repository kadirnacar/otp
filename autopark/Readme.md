# Requirements

You need to install fork of [darknet](https://github.com/AlexeyAB/darknet). Latest commit I've tested is [here](https://github.com/AlexeyAB/darknet/commit/9d40b619756be9521bc2ccd81808f502daaa3e9a). It corresponds last official [YOLOv4 release](https://github.com/AlexeyAB/darknet/releases/tag/yolov4)

Use provided [Makefile](Makefile).
#85.100.222.39

# 1. Linux Ubuntu 18.04

```bash
# bazı wifiler için güç modu kapatma
echo 'options rtl8192ce ips=0 fwlps=0' >> /etc/modprobe.d/rtl8192ce.conf
sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
sudo nano /etc/systemd/logind.conf
sudo touch /etc/cloud/cloud-init.disabled
sudo apt update -y
```

- ## Add Testing repository

Ubuntu 18.04 debian testing repository

```bash
echo "deb http://ftp.us.debian.org/debian testing main contrib non-free" >> /etc/apt/sources.list
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 648ACFD622F3D138
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 0E98404D386FA1D9
```

Ubuntu 18.04 arm64

```bash
echo "deb http://ports.ubuntu.com/ubuntu-ports bionic-proposed restricted main multiverse universe" >> /etc/apt/sources.list
```

Ubuntu 18.04 86_64

```bash
echo "deb http://archive.ubuntu.com/ubuntu/ $(lsb_release -cs)-proposed restricted main multiverse universe" >> /etc/apt/sources.list
```

- ## Developer tools

```bash
sudo apt install -y make build-essential cmake wget curl git
```

## 2. Swapfile for pi

Install dphys-swapfile

```bash
sudo apt-get install dphys-swapfile
```

Enlarge the max swapsize to 4096

```bash
sudo nano /sbin/dphys-swapfile
```

Give the required size of 4096

```bash
sudo nano /etc/dphys-swapfile
```

Reboot afterwards

```bash
sudo reboot
```

After each boot up isteğe bağlı

```bash
sudo /etc/init.d/dphys-swapfile stop
sudo /etc/init.d/dphys-swapfile start
```

## 3. Install cmake 3.25

```bash
sudo apt purge --auto-remove cmake
wget -O - https://apt.kitware.com/keys/kitware-archive-latest.asc 2>/dev/null | gpg --dearmor - | sudo tee /etc/apt/trusted.gpg.d/kitware.gpg >dev/null
sudo apt-add-repository 'deb https://apt.kitware.com/ubuntu/ bionic main'
sudo apt-add-repository 'deb https://apt.kitware.com/ubuntu/ xenial main'
sudo apt update
sudo apt install cmake
```

## 4. Install ffmpeg

```bash
sudo apt install libleptonica-dev ffmpeg libavformat-dev libavresample-dev libswscale-dev
```

## 5. Install nvm

```bash
sudo apt install -y curl
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
source ~/.bashrc
```

## 6. Install go

```bash
sudo rm -rf /usr/local/go
```

For x86_64

```bash
wget https://go.dev/dl/go1.19.4.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.19.4.linux-amd64.tar.gz
```

For Arm64

```bash
wget https://go.dev/dl/go1.19.4.linux-arm64.tar.gz
sudo tar -C /usr/local -xzf go1.19.4.linux-arm64.tar.gz
```

Set bashrc

```bash
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
```

## 7. Install pyenv and mambaforge

```bash
sudo apt-get update -y; sudo apt-get install -y make build-essential libssl-dev zlib1g-dev \
 libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
 libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev
curl https://pyenv.run | bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc
pyenv install -l
pyenv install mambaforge-4.10.3-10
pyenv global mambaforge-4.10.3-10
pyenv shell mambaforge-4.10.3-10
source ~/.bashrc

```

## 8. Install paddleocr

Preinstall

```bash
sudo apt install libopencv-dev python3-opencv libatlas-base-dev libopenblas-dev libblas-dev liblapack-dev patchelf gfortran
```

Install Paddlepaddle for x86_64 add noavx pip repository cpu

```bash

#python -m pip install paddlepaddle -i https://mirror.baidu.com/pypi/simple
#python -m pip install paddlepaddle==2.4.1 -i https://pypi.tuna.tsinghua.edu.cn/simple
python3 -m pip download paddlepaddle==2.4.1 -f https://www.paddlepaddle.org.cn/whl/linux/mkl/noavx/stable.html --no-index --no-deps
```

Indirilen dosyanın adı ("/home/autopark/projects/paddlepaddle-2.3.2-cp38-cp38-linux_x86_64.whl")

```bash
pip install /home/autopark/projects/paddlepaddle-2.3.2-cp38-cp38-linux_x86_64.whl
```

<!-- # install dependencies gereksiz olabilir
sudo apt install libatlas-base-dev libopenblas-dev libblas-dev liblapack-dev patchelf gfortran
pip install Cython
pip install -U setuptools
pip install six requests wheel pyyaml
# upgrade version 3.0.0 -> 3.13.0
pip install -U protobuf
# download the wheel -->

Install Paddlepaddle for arm64 (Raspberry Pi) noavx cpu
version 2.3.1
```bash
wget https://github.com/Qengineering/Paddle-Raspberry-Pi/raw/main/paddlepaddle-2.3.1-cp39-cp39-linux_aarch64.whl
pip install paddlepaddle-2.3.1-cp39-cp39-linux_aarch64.whl
```
version 2.0.0
```bash
wget https://github.com/Qengineering/Paddle-Raspberry-Pi/raw/main/paddlepaddle-2.0.0-cp37-cp37m-linux_aarch64.whl
pip install paddlepaddle-2.0.0-cp37-cp37m-linux_aarch64.whl
```
Test paddle
```bash
python -c 'import paddle;paddle.utils.run_check()'
```
Install PaddleOcr

```bash
#pip install numpy==1.23.5
#pip install paddleocr -i https://www.piwheels.org/simple
pip install paddleocr
```

## 8. Install darknet
```bash
git clone https://github.com/AlexeyAB/darknet.git
cd darknet
git checkout 9d40b619756be9521bc2ccd81808f502daaa3e9a
sudo nano CMakeLists.txt
mkdir build_release
cd build_release
cmake ..
cmake --build . --target install --parallel 8
cd ..
sudo cp libdarknet.so /usr/lib/libdarknet.so
sudo cp include/darknet.h /usr/include/darknet.h
sudo ldconfig
```
## Install darknet with nnpack for raspberry pi 3b+ [Detail](https://egemenertugrul.github.io/blog/Darknet-NNPACK-on-Raspberry-Pi/)
```bash
sudo apt install ninja-build clang cmake
```
* NNPACK
```bash
git clone https://github.com/shizukachan/NNPACK.git
cd NNPACK
mkdir build
cd build
cmake -G Ninja -DBUILD_SHARED_LIBS=on ..
sudo ninja
sudo ninja install
```
* darknet-NNPACK
```bash
cd
git clone https://github.com/shizukachan/darknet-nnpack.git
cd darknet-nnpack
sudo nano Makefile
```
```bash
GPU=0
CUDNN=0
CUDNN_HALF=0
OPENCV=1
AVX=0
OPENMP=0
LIBSO=0
ZED_CAMERA=0
NNPACK=1
...
```
* build
```bash
make
```
## 9. PostgreSql

```bash
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '123';"
sudo -u postgres createuser otp
sudo -u postgres createdb otp
sudo -u postgres psql -c "ALTER USER otp PASSWORD '123';"
sudo -u postgres psql -c "grant all privileges on database otp to otp;"
```

## 10. Project
 ```bash
 git clone https://github.com/kadirnacar/otp.git
 pip install websocket rel
 ```


## 11. Test, Detection, direction classification and recognition: 
set the parameter`--use_gpu false` to disable the gpu device
```bash
paddleocr --image_dir ./imgs_en/img_12.jpg --use_angle_cls true --lang en --use_gpu false
```
Output will be a list, each item contains bounding box, text and recognition confidence
```bash
[[[441.0, 174.0], [1166.0, 176.0], [1165.0, 222.0], [441.0, 221.0]], ('ACKNOWLEDGEMENTS', 0.9971134662628174)]
[[[403.0, 346.0], [1204.0, 348.0], [1204.0, 384.0], [402.0, 383.0]], ('We would like to thank all the designers and', 0.9761400818824768)]
[[[403.0, 396.0], [1204.0, 398.0], [1204.0, 434.0], [402.0, 433.0]], ('contributors who have been involved in the', 0.9791957139968872)]
......
```
pdf file is also supported, you can infer the first few pages by using the `page_num` parameter, the default is 0, which means infer all pages
```bash
paddleocr --image_dir ./xxx.pdf --use_angle_cls true --use_gpu false --page_num 2
```
Only detection: set `--rec` to `false`
```bash
paddleocr --image_dir ./imgs_en/img_12.jpg --rec false
```
Output will be a list, each item only contains bounding box
```bash
[[397.0, 802.0], [1092.0, 802.0], [1092.0, 841.0], [397.0, 841.0]]
[[397.0, 750.0], [1211.0, 750.0], [1211.0, 789.0], [397.0, 789.0]]
[[397.0, 702.0], [1209.0, 698.0], [1209.0, 734.0], [397.0, 738.0]]
......
```
Only recognition: set `--det` to `false`
```bash
paddleocr --image_dir ./imgs_words_en/word_10.png --det false --lang en
```
Output will be a list, each item contains text and recognition confidence
```bash
['PAIN', 0.9934559464454651]
```