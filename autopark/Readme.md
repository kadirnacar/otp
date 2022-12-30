## Requirements

You need to install fork of [darknet](https://github.com/AlexeyAB/darknet). Latest commit I've tested is [here](https://github.com/AlexeyAB/darknet/commit/9d40b619756be9521bc2ccd81808f502daaa3e9a). It corresponds last official [YOLOv4 release](https://github.com/AlexeyAB/darknet/releases/tag/yolov4)

Use provided [Makefile](Makefile).
#85.100.222.39

* install linux ubuntu 18.04
    ```shell
    echo 'options rtl8192ce ips=0 fwlps=0' >> /etc/modprobe.d/rtl8192ce.conf
    sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
    sudo nano /etc/systemd/logind.conf
    sudo touch /etc/cloud/cloud-init.disabled
    sudo apt update -y
    sudo apt install -y make build-essential cmake wget curl git

    #cmake
    sudo apt purge --auto-remove cmake
    wget -O - https://apt.kitware.com/keys/kitware-archive-latest.asc 2>/dev/null | gpg --dearmor - | sudo tee /etc/apt/trusted.gpg.d/kitware.gpg >/dev/null    
    sudo apt-add-repository 'deb https://apt.kitware.com/ubuntu/ bionic main'
    sudo apt-add-repository 'deb https://apt.kitware.com/ubuntu/ xenial main'
    sudo apt update
    sudo apt install cmake

    #ffmpeg
    sudo apt install libleptonica-dev ffmpeg libavformat-dev libavresample-dev libswscale-dev

    #nvm
    sudo apt install -y curl 
    curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
    source ~/.bashrc 
    
    #go
    wget https://go.dev/dl/go1.19.4.linux-amd64.tar.gz
    sudo rm -rf /usr/local/go 
    sudo tar -C /usr/local -xzf go1.19.4.linux-amd64.tar.gz
    echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc 
    source ~/.bashrc 

    #pyenv
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
* install paddleocr
    ```shell
    #pip install numpy==1.23.5
    sudo apt install numpy==1.23.5 libopencv-dev python3-opencv 
    python3 -m pip download paddlepaddle==2.4.1 -f https://www.paddlepaddle.org.cn/whl/linux/mkl/noavx/stable.html --no-index --no-deps
    #inen dosyanın adı
    pip install /home/autopark/projects/paddlepaddle-2.3.2-cp38-cp38-linux_x86_64.whl
    #python -m pip install paddlepaddle -i https://mirror.baidu.com/pypi/simple
    #python -m pip install paddlepaddle==2.4.1 -i https://pypi.tuna.tsinghua.edu.cn/simple
    pip install paddleocr
    ```
* install darknet 
    ```shell
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
* PostgreSql
    ```shell
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
* project
    ```shell
    git clone https://github.com/kadirnacar/otp.git
    pip install websocket rel
    ```
* install darknet with nnpack for raspberry pi 3b+
    ```shell
    https://egemenertugrul.github.io/blog/Darknet-NNPACK-on-Raspberry-Pi/
    ```