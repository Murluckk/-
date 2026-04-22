# syntax=docker/dockerfile:1.6

# -----------------------------------------------------------------------------
# Build stage: clone profanity2, apply keccak-of-address patch, compile.
# -----------------------------------------------------------------------------
FROM nvidia/cuda:12.4.1-devel-ubuntu22.04 AS build

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        git \
        ca-certificates \
        ocl-icd-opencl-dev \
        opencl-headers \
    && rm -rf /var/lib/apt/lists/*

# Pin profanity2 to a known commit so the patch keeps applying.
ARG PROFANITY2_REPO=https://github.com/1inch/profanity2.git
ARG PROFANITY2_COMMIT=13d16e83556b17a4ec6a09114f11a36b338acf05

WORKDIR /src
RUN git clone "${PROFANITY2_REPO}" profanity2 && \
    cd profanity2 && \
    git checkout "${PROFANITY2_COMMIT}"

# Copy the patched source files on top of the vanilla profanity2 tree.
COPY patches/profanity.cl   /src/profanity2/profanity.cl
COPY patches/Mode.hpp       /src/profanity2/Mode.hpp
COPY patches/Mode.cpp       /src/profanity2/Mode.cpp
COPY patches/profanity.cpp  /src/profanity2/profanity.cpp

WORKDIR /src/profanity2
RUN make -j"$(nproc)"

# -----------------------------------------------------------------------------
# Runtime stage: minimal CUDA runtime image (ships with OpenCL ICD for NVIDIA).
# -----------------------------------------------------------------------------
FROM nvidia/cuda:12.4.1-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
        ocl-icd-libopencl1 \
        clinfo \
        ca-certificates \
        python3 \
        python3-pip \
    && rm -rf /var/lib/apt/lists/*

# NVIDIA base images don't always register the OpenCL ICD file inside the
# container, so we create it explicitly. With --gpus all the actual libs are
# bind-mounted from the host driver at runtime.
RUN mkdir -p /etc/OpenCL/vendors && \
    echo "libnvidia-opencl.so.1" > /etc/OpenCL/vendors/nvidia.icd

ENV NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility

WORKDIR /opt/miner
COPY --from=build /src/profanity2/profanity2.x64  ./profanity2.x64
COPY --from=build /src/profanity2/profanity.cl    ./profanity.cl
COPY --from=build /src/profanity2/keccak.cl       ./keccak.cl
COPY scripts/run.sh                                ./run.sh
COPY scripts/verify.py                             ./verify.py
COPY scripts/gen-key.py                            ./gen-key.py
RUN chmod +x ./run.sh

ENTRYPOINT ["./run.sh"]
CMD ["--help"]
