## Requirements

You need to install fork of [darknet](https://github.com/AlexeyAB/darknet). Latest commit I've tested is [here](https://github.com/AlexeyAB/darknet/commit/9d40b619756be9521bc2ccd81808f502daaa3e9a). It corresponds last official [YOLOv4 release](https://github.com/AlexeyAB/darknet/releases/tag/yolov4)

Use provided [Makefile](Makefile).
#85.100.222.39
* For CPU-based instalattion:
    ```shell
    sudo apt install libleptonica-dev ffmpeg libavformat-dev libavresample-dev
    ```
* install linux
    ```shell
    echo 'options rtl8192ce ips=0 fwlps=0' >> /etc/modprobe.d/rtl8192ce.conf
    sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
    sudo apt update -y
    sudo apt install -y make build-essential cmake
    
    #nvm
    sudo apt install -y curl 
    curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
    source ~/.bashrc 
    
    #go
    curl https://go.dev/dl/go1.19.4.linux-amd64.tar.gz
    sudo rm -rf /usr/local/go 
    sudo tar -C /usr/local -xzf go1.19.4.linux-amd64.tar.gz
    echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc 
    source ~/.bashrc 

    #pyenv
    sudo apt-get update -y; sudo apt-get install -y make build-essential libssl-dev zlib1g-dev \
        libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
        libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev
    curl https://pyenv.run | bash
    echo 'export PATH="$HOME/.pyenv/bin:$PATH"' >> ~/.bashrc 
    echo 'eval "$(pyenv init --path)"' >> ~/.bashrc 
    echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.bashrc 
    source ~/.bashrc 
    pyenv install -l
    pyenv install mambaforge
    pyenv global mambaforge
    pyenv shell mambaforge
    source ~/.bashrc 
    ```
* install paddleocr
    ```shell
    #pip install numpy==1.23.5
    pip install paddlepaddle
    #python -m pip install paddlepaddle -i https://mirror.baidu.com/pypi/simple
    #python -m pip install paddlepaddle==2.4.1 -i https://pypi.tuna.tsinghua.edu.cn/simple
    pip install paddleocr
    ```
* install darknet 
    ```shell
    git clone https://github.com/AlexeyAB/darknet.git
    cd darknet
    git checkout 9d40b619756be9521bc2ccd81808f502daaa3e9a 
    mkdir build_release
    cd build_release
    cmake ..
    cmake --build . --target install --parallel 8
    cd ..
    sudo cp libdarknet.so /usr/lib/libdarknet.so
	sudo cp include/darknet.h /usr/include/darknet.h
	sudo ldconfig
    ```
* install darknet with nnpack for raspberry pi 3b+
    ```shell
    https://egemenertugrul.github.io/blog/Darknet-NNPACK-on-Raspberry-Pi/
    ```