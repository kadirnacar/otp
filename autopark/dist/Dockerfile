FROM arm64v8/ubuntu:20.04 as base

ARG DEBIAN_FRONTEND=noninteractive

ENV TZ=Europe/Istanbul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN apt-get update
RUN apt-get install -y gpg wget
RUN wget -O - https://apt.kitware.com/keys/kitware-archive-latest.asc 2>/dev/null | gpg --dearmor - | tee /usr/share/keyrings/kitware-archive-keyring.gpg >/dev/null
RUN echo "deb http://ports.ubuntu.com/ubuntu-ports focal-proposed restricted main multiverse universe" >> /etc/apt/sources.list
RUN echo 'deb [signed-by=/usr/share/keyrings/kitware-archive-keyring.gpg] https://apt.kitware.com/ubuntu/ focal main' | tee /etc/apt/sources.list.d/kitware.list >/dev/null
RUN apt-get update -y && apt-get upgrade -y
RUN apt install -y make wget curl git cmake build-essential
RUN cd /root/ && mkdir tmp && cd tmp
RUN curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
RUN . /root/.nvm/nvm.sh && nvm install 14
RUN wget https://go.dev/dl/go1.19.4.linux-arm64.tar.gz
RUN tar -C /usr/local -xzf go1.19.4.linux-arm64.tar.gz
RUN rm -rf go1.19.4.linux-arm64.tar.gz
RUN echo 'export PATH=$PATH:/usr/local/go/bin' >> /root/.bashrc
RUN apt-get update -y; apt-get install -y libssl-dev zlib1g-dev \
 libbz2-dev libreadline-dev libsqlite3-dev llvm \
 libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev
RUN cd /root/tmp && wget -O pyenv.sh https://pyenv.run
RUN /bin/bash -c 'source /root/tmp/pyenv.sh'
RUN ls
RUN ls
RUN echo 'export PYENV_ROOT="$HOME/.pyenv"' >> /root/.bashrc && \
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> /root/.bashrc && \
echo 'eval "$(pyenv init -)"' >> /root/.bashrc 
SHELL ["/bin/bash", "-c"]
RUN apt install -y libopencv-dev python3-opencv python3-dev libatlas-base-dev libopenblas-dev libblas-dev liblapack-dev patchelf gfortran
ADD detects /root/tmp
# COPY ./requirements.txt .   
# RUN pip install -r requirements.txt
# ADD . .
EXPOSE 3335:3333
CMD ["/bin/bash"]