## Requirements

You need to install fork of [darknet](https://github.com/AlexeyAB/darknet). Latest commit I've tested is [here](https://github.com/AlexeyAB/darknet/commit/9d40b619756be9521bc2ccd81808f502daaa3e9a). It corresponds last official [YOLOv4 release](https://github.com/AlexeyAB/darknet/releases/tag/yolov4)

Use provided [Makefile](Makefile).

* For CPU-based instalattion:
    ```shell
    make install_darknet
    ```
* For both CPU and GPU-based instalattion if you HAVE CUDA installed:
    ```shell
    make install_darknet_gpu
    ```
    Note: I've tested CUDA [10.2](https://developer.nvidia.com/cuda-10.2-download-archive) and cuDNN is [7.6.5](https://developer.nvidia.com/rdp/cudnn-archive#a-collapse765-102))

* For both CPU and GPU-based instalattion if you HAVE NOT CUDA installed:
    ```shell
    make install_darknet_gpu_cuda
    ```
    Note: There is some struggle in Makefile for cuDNN, but I hope it works in Ubuntu atleast. Do not forget provide proper CUDA and cuDNN versions.

* install darknet with nnpack for raspberry pi 3b+
    ```shell
    https://egemenertugrul.github.io/blog/Darknet-NNPACK-on-Raspberry-Pi/
    ```